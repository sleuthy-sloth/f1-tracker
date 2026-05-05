/**
 * Race Data Service
 * Fetches OpenF1 API data and builds ReplayFrame objects for race replay visualization
 */

import type {
  Driver,
  LocationData,
  CarData,
  WeatherData,
  RaceControlData,
  ReplayFrame,
  DriverPosition,
  SafetyCarStatus,
  StintData,
  SessionResult,
} from './types';

import { FrameBuffer } from './frameBuffer';

import {
  getDrivers,
  getLocation,
  getCarData,
  getWeather,
  getRaceControl,
  getStints,
  getSessionResult,
} from './api/openf1';

// ──────────────────────────────────────────────────────────────────────────
// Composable Fetchers — used by Strategy Lab's tiered progressive loader
// ──────────────────────────────────────────────────────────────────────────

/**
 * Lightweight session bootstrap data: drivers + stints + race control +
 * session_result (for grid order) + weather. ~5 parallel requests.
 *
 * Designed to land in <1s so the UI shell can render before the (expensive)
 * per-driver location streams begin.
 */
export interface SessionMetadata {
  drivers: Driver[];
  stints: StintData[];
  raceControl: RaceControlData[];
  sessionResult: SessionResult[];
  weather: WeatherData[];
}

export async function fetchSessionMetadata(
  sessionKey: number
): Promise<SessionMetadata> {
  const [drivers, stints, raceControl, sessionResult, weather] = await Promise.all([
    getDrivers({ session_key: sessionKey }).catch(() => [] as Driver[]),
    getStints({ session_key: sessionKey }).catch(() => [] as StintData[]),
    getRaceControl({ session_key: sessionKey }).catch(() => [] as RaceControlData[]),
    getSessionResult({ session_key: sessionKey }).catch(() => [] as SessionResult[]),
    getWeather({ session_key: sessionKey }).catch(() => [] as WeatherData[]),
  ]);
  return { drivers, stints, raceControl, sessionResult, weather };
}

/**
 * Resolve a driver_number ordering using the session_result (final position
 * is a reasonable proxy for grid order; we don't have an explicit /grid call
 * in our client). Falls back to the order in `drivers` for any unmapped slots.
 */
export function deriveGridOrder(
  sessionResult: SessionResult[],
  drivers: Driver[]
): number[] {
  const ordered: number[] = [];
  const seen = new Set<number>();

  const sortedResults = sessionResult
    .filter((r) => typeof r.position === 'number' && r.position > 0)
    .sort((a, b) => a.position - b.position);

  for (const r of sortedResults) {
    if (!seen.has(r.driver_number)) {
      ordered.push(r.driver_number);
      seen.add(r.driver_number);
    }
  }

  for (const d of drivers) {
    if (!seen.has(d.driver_number)) {
      ordered.push(d.driver_number);
      seen.add(d.driver_number);
    }
  }

  return ordered;
}

/**
 * Fetch raw GPS location data for a single driver. Wraps `getLocation` so
 * Strategy Lab can stream driver data in chunks and progressively merge it
 * into the FrameBuffer.
 */
export async function fetchDriverLocations(
  sessionKey: number,
  driverNumber: number
): Promise<LocationData[]> {
  return getLocation({ session_key: sessionKey, driver_number: driverNumber });
}

/**
 * Fetch raw car telemetry for a single driver. Called lazily — only after the
 * user selects a driver in the UI.
 */
export async function fetchDriverCarData(
  sessionKey: number,
  driverNumber: number
): Promise<CarData[]> {
  return getCarData({ session_key: sessionKey, driver_number: driverNumber });
}

// ──────────────────────────────────────────────────────────────────────────
// Original monolithic fetcher (kept for backwards compatibility / tests)
// ──────────────────────────────────────────────────────────────────────────

/**
 * Configuration for RaceDataService
 */
export interface RaceDataServiceConfig {
  /** Session key for the race session */
  sessionKey: number;
  /** Frame interval in milliseconds (default: 200ms = 5 fps) */
  frameIntervalMs?: number;
  /** Callback for progress updates */
  onProgress?: (msg: string) => void;
}

/**
 * Result from RaceDataService
 */
export interface RaceDataServiceResult {
  /** The frame buffer with all replay frames */
  frameBuffer: FrameBuffer;
  /** Driver information for the session */
  drivers: Driver[];
  /** Total number of frames */
  totalFrames: number;
  /** Time range of the session */
  timeRange: { start: number; end: number } | null;
}

/**
 * Default frame interval: 200ms (5 fps)
 */
const DEFAULT_FRAME_INTERVAL_MS = 200;

/**
 * Find the closest item to a target timestamp using Binary Search
 * Returns the item whose date is closest to the target.
 * Assumes items are sorted by date.
 */
function findClosest<T extends { date: string }>(
  items: T[],
  targetMs: number
): T | null {
  if (items.length === 0) return null;
  if (items.length === 1) return items[0];

  let low = 0;
  let high = items.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const midMs = (items[mid] as any)._ts || new Date(items[mid].date).getTime();

    if (midMs === targetMs) return items[mid];
    if (midMs < targetMs) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  // After search: high < low.
  if (high < 0) return items[low];
  if (low >= items.length) return items[high];

  const tsHigh = (items[high] as any)._ts || new Date(items[high].date).getTime();
  const tsLow = (items[low] as any)._ts || new Date(items[low].date).getTime();

  const diffHigh = Math.abs(tsHigh - targetMs);
  const diffLow = Math.abs(tsLow - targetMs);
  
  return diffHigh <= diffLow ? items[high] : items[low];
}

/**
 * Detect safety car status at a given timestamp
 *
 * @param raceControl - Race control messages
 * @param targetTimestamp - Target timestamp in milliseconds
 * @returns Safety car status or undefined if no safety car activity
 */
/**
 * Track safety car deployment state from race control messages
 */
enum SafetyCarPhase {
  NONE,
  DEPLOYED,
  RETURNING,
}

function detectSafetyCar(
  raceControl: RaceControlData[],
  targetTimestamp: number
): SafetyCarStatus | undefined {
  // Filter and sort messages up to target timestamp
  const relevantMessages = raceControl
    .filter((msg) => {
      const msgTime = new Date(msg.date).getTime();
      return msgTime <= targetTimestamp;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (relevantMessages.length === 0) {
    return undefined;
  }

  // Process all messages to track the SC state machine without early returns
  let phase = SafetyCarPhase.NONE;

  for (const msg of relevantMessages) {
    const category = (msg.category || '').toUpperCase();
    const flag = (msg.flag || '').toUpperCase();
    const message = (msg.message || '').toUpperCase();

    const isSafetyCarEvent =
      category.includes('SAFETY CAR') ||
      flag.includes('SCD') ||
      flag.includes('SCR');

    if (!isSafetyCarEvent) {
      continue;
    }

    // Deploy: SCD flag or "DEPLOYED" in message
    if (flag.includes('SCD') || message.includes('DEPLOYED')) {
      phase = SafetyCarPhase.DEPLOYED;
    }
    // Returning: "RETURNING" in message
    else if (message.includes('RETURNING')) {
      phase = SafetyCarPhase.RETURNING;
    }
    // Return completed: SCR flag, "RETURNED", or "END" in message
    else if (flag.includes('SCR') || message.includes('RETURNED') || message.includes('END')) {
      phase = SafetyCarPhase.NONE;
    }
  }

  switch (phase) {
    case SafetyCarPhase.DEPLOYED:
      return { status: 'deployed' };
    case SafetyCarPhase.RETURNING:
      return { status: 'returning' };
    default:
      return undefined;
  }
}

/**
 * Estimate lap number from timestamp
 * This is a simplified estimate based on typical race duration
 *
 * @param timestamp - Current timestamp
 * @param startTimestamp - Session start timestamp
 * @returns Estimated lap number
 */
function estimateLap(
  timestamp: number,
  startTimestamp: number
): number {
  const elapsedSeconds = (timestamp - startTimestamp) / 1000;
  // Approximate: ~90 seconds per lap for typical F1 race
  const averageLapTime = 90;
  const lap = Math.floor(elapsedSeconds / averageLapTime) + 1;
  return lap > 0 ? lap : 1;
}

/**
 * Fetch raw data components for a race session
 */
export async function fetchRawRaceData(
  sessionKey: number, 
  onProgress?: (msg: string) => void
) {
  if (onProgress) onProgress('Fetching driver list...');
  const drivers = await getDrivers({ session_key: sessionKey } as any).catch((err) => {
    console.error('Error fetching drivers:', err);
    return [] as Driver[];
  });

  if (drivers.length === 0) {
    if (onProgress) onProgress('No drivers found for this session.');
    return {
      drivers: [],
      locationByDriver: new Map(),
      carDataByDriver: new Map(),
      weatherData: [],
      raceControlData: []
    };
  }

  const totalDrivers = drivers.length;
  let completedDrivers = 0;
  const locationByDriver = new Map<number, LocationData[]>();
  const carDataByDriver = new Map<number, CarData[]>();

  // Process drivers in small chunks to avoid overwhelming the connection pool
  const CHUNK_SIZE = 3;
  for (let i = 0; i < drivers.length; i += CHUNK_SIZE) {
    const chunk = drivers.slice(i, i + CHUNK_SIZE);
    
    await Promise.all(
      chunk.map(async (driver) => {
        const dn = driver.driver_number;
        if (onProgress) {
          onProgress(`Synchronizing: ${driver.name_acronym} (${completedDrivers + 1}/${totalDrivers})`);
        }
        
        const [locs, cars] = await Promise.all([
          getLocation({ session_key: sessionKey, driver_number: dn }).catch(() => [] as LocationData[]),
          getCarData({ session_key: sessionKey, driver_number: dn }).catch(() => [] as CarData[]),
        ]);
        
        if (locs.length > 0) locationByDriver.set(dn, locs);
        if (cars.length > 0) carDataByDriver.set(dn, cars);
        
        completedDrivers++;
      })
    );
  }

  if (onProgress) onProgress('Fetching weather and race control messages...');

  const [weatherData, raceControlData] = await Promise.all([
    getWeather({ session_key: sessionKey }).catch(() => [] as WeatherData[]),
    getRaceControl({ session_key: sessionKey }).catch(() => [] as RaceControlData[]),
  ]);

  return {
    drivers,
    locationByDriver,
    carDataByDriver,
    weatherData,
    raceControlData
  };
}

/**
 * Fetch race data for a session and build frame buffer
 *
 * @param config - Race data service configuration
 * @returns Race data service result with frame buffer
 *
 * @example
 * const result = await fetchRaceData({ sessionKey: 5628, frameIntervalMs: 200 });
 * console.log(result.totalFrames);
 */
export async function fetchRaceData(
  config: RaceDataServiceConfig
): Promise<RaceDataServiceResult> {
  const { sessionKey, frameIntervalMs = DEFAULT_FRAME_INTERVAL_MS, onProgress } = config;

  try {
    const rawData = await fetchRawRaceData(sessionKey, onProgress);
    if (!rawData || rawData.locationByDriver.size === 0) {
      return {
        frameBuffer: new FrameBuffer(),
        drivers: rawData?.drivers || [],
        totalFrames: 0,
        timeRange: null,
      };
    }

    const { drivers, locationByDriver, carDataByDriver, weatherData, raceControlData } = rawData;

    if (onProgress) onProgress('Optimizing data streams...');
    
    // Pre-calculate timestamps to avoid redundant new Date() calls in loops
    for (const locs of locationByDriver.values()) {
      for (const loc of locs) {
        (loc as any)._ts = new Date(loc.date).getTime();
      }
      locs.sort((a: any, b: any) => a._ts - b._ts);
    }

    for (const cars of carDataByDriver.values()) {
      for (const car of cars) {
        (car as any)._ts = new Date(car.date).getTime();
      }
      cars.sort((a: any, b: any) => a._ts - b._ts);
    }

    // Collect unique timestamps using pre-calculated values
    const timestampSet = new Set<number>();
    for (const locs of locationByDriver.values()) {
      for (const loc of locs) {
        timestampSet.add((loc as any)._ts);
      }
    }

    if (onProgress) onProgress('Analyzing session timeline...');
    const allTimestamps = Array.from(timestampSet).sort((a, b) => a - b);

    // Pre-process weather and race control
    for (const weather of weatherData) {
      (weather as any)._ts = new Date(weather.date).getTime();
    }
    for (const msg of raceControlData) {
      (msg as any)._ts = new Date(msg.date).getTime();
    }

    if (allTimestamps.length === 0) {
      console.warn('No valid timestamps found for session:', sessionKey);
      return {
        frameBuffer: new FrameBuffer(),
        drivers,
        totalFrames: 0,
        timeRange: null,
      };
    }

    // Sample timestamps at frameIntervalMs intervals
    const startTime = allTimestamps[0];
    const endTime = allTimestamps[allTimestamps.length - 1];
    const sampledTimestamps: number[] = [];

    for (let ts = startTime; ts <= endTime; ts += frameIntervalMs) {
      // Optimized: Use binary search to find the closest actual timestamp
      let low = 0;
      let high = allTimestamps.length - 1;
      let closestTimestamp = allTimestamps[0];

      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        if (allTimestamps[mid] === ts) {
          closestTimestamp = allTimestamps[mid];
          break;
        }
        if (allTimestamps[mid] < ts) {
          low = mid + 1;
        } else {
          high = mid - 1;
        }
      }

      if (closestTimestamp !== ts) {
        if (high < 0) closestTimestamp = allTimestamps[low];
        else if (low >= allTimestamps.length) closestTimestamp = allTimestamps[high];
        else {
          closestTimestamp = Math.abs(allTimestamps[high] - ts) <= Math.abs(allTimestamps[low] - ts)
            ? allTimestamps[high]
            : allTimestamps[low];
        }
      }

      // Avoid duplicates
      if (
        sampledTimestamps.length === 0 ||
        sampledTimestamps[sampledTimestamps.length - 1] !== closestTimestamp
      ) {
        sampledTimestamps.push(closestTimestamp);
      }
    }

    // Build replay frames for each sampled timestamp
    const replayFrames: ReplayFrame[] = [];

    // Create driver number to position map for ordering
    const driverNumbers = drivers.map((d) => d.driver_number);
    const basePosition: Map<number, number> = new Map();
    driverNumbers.forEach((num, idx) => basePosition.set(num, idx + 1));

    // Weather data sorted by time
    const sortedWeather = [...weatherData].sort(
      (a, b) => (a as any)._ts - (b as any)._ts
    );

    // Race control sorted by time
    const sortedRaceControl = [...raceControlData].sort(
      (a, b) => (a as any)._ts - (b as any)._ts
    );

    let frameCount = 0;
    const totalFramesToBuild = sampledTimestamps.length;
    // Pointer that advances monotonically through the sorted race-control list as
    // we walk frames in time order. Avoids the O(N) per-frame filter that used to
    // copy the entire prefix into every frame (O(F·N) memory and allocations).
    let raceControlCursor = 0;

    for (const targetTimestamp of sampledTimestamps) {
      if (onProgress && frameCount % 500 === 0) {
        onProgress(`Processing frames: ${frameCount}/${totalFramesToBuild}`);
      }
      frameCount++;

      const driverPositions: DriverPosition[] = [];

      // Build position for each driver
      for (const driver of drivers) {
        const driverNumber = driver.driver_number;
        const locs = locationByDriver.get(driverNumber) || [];
        const cars = carDataByDriver.get(driverNumber) || [];

        const closestLoc = findClosest<LocationData>(locs, targetTimestamp);
        const closestCar = findClosest<CarData>(cars, targetTimestamp);

        if (!closestLoc) {
          continue;
        }

        const position = basePosition.get(driverNumber) || driverNumbers.indexOf(driverNumber) + 1;

        const driverPosition: DriverPosition = {
          driver_number: driverNumber,
          position,
          x: closestLoc.x,
          y: closestLoc.y,
          speed: closestCar?.speed ?? 0,
          rpm: closestCar?.rpm ?? 0,
          gear: closestCar?.n_gear ?? 0,
          throttle: closestCar?.throttle ?? 0,
          brake: closestCar?.brake ?? 0,
          drs: closestCar?.drs ?? 0,
        };

        driverPositions.push(driverPosition);
      }

      // Sort by position
      driverPositions.sort((a, b) => a.position - b.position);

      // Skip frames with no driver positions
      if (driverPositions.length === 0) {
        continue;
      }

      // Find closest weather (convert null to undefined)
      const closestWeatherResult = findClosest(sortedWeather, targetTimestamp);
      const weather = closestWeatherResult !== null ? closestWeatherResult : undefined;

      // Detect safety car status
      const safetyCar = detectSafetyCar(sortedRaceControl, targetTimestamp);

      // Advance the race-control cursor to include any newly-active messages, then
      // expose only the most recent ones. Consumers (RaceControlFeed, SafetyCar)
      // sort/filter from this slice and the feed already caps at 50 entries, so
      // there's no point storing the entire prefix in every frame.
      while (
        raceControlCursor < sortedRaceControl.length &&
        (sortedRaceControl[raceControlCursor] as any)._ts <= targetTimestamp
      ) {
        raceControlCursor++;
      }
      const RACE_CONTROL_TAIL = 50;
      const frameRaceControl =
        raceControlCursor === 0
          ? []
          : sortedRaceControl.slice(Math.max(0, raceControlCursor - RACE_CONTROL_TAIL), raceControlCursor);

      const frame: ReplayFrame = {
        timestamp: targetTimestamp,
        date: new Date(targetTimestamp).toISOString(),
        lap: estimateLap(targetTimestamp, startTime),
        driver_positions: driverPositions,
        weather: weather,
        safety_car: safetyCar,
        race_control_messages: frameRaceControl,
      };

      replayFrames.push(frame);
    }

    // Sort frames by timestamp (should already be sorted, but ensure)
    replayFrames.sort((a, b) => a.timestamp - b.timestamp);

    // Create frame buffer
    const frameBuffer = new FrameBuffer(replayFrames);

    return {
      frameBuffer,
      drivers,
      totalFrames: replayFrames.length,
      timeRange:
        replayFrames.length > 0
          ? {
              start: replayFrames[0].timestamp,
              end: replayFrames[replayFrames.length - 1].timestamp,
            }
          : null,
    };
  } catch (error) {
    console.error('Error fetching race data:', error);
    return {
      frameBuffer: new FrameBuffer(),
      drivers: [],
      totalFrames: 0,
      timeRange: null,
    };
  }
}

/**
 * Get estimated frame count for a session
 * Quick preview without full fetch
 *
 * @param sessionKey - Session key
 * @returns Approximate frame count
 *
 * @example
 * const count = await getFrameCount(5628);
 * console.log(`Estimated ${count} frames`);
 */
export async function getFrameCount(sessionKey: number): Promise<number> {
  try {
    // Fetch only location data (smallest payload)
    const location = await getLocation({ session_key: sessionKey });

    if (location.length === 0) {
      return 0;
    }

    // Compute time span from location data to estimate frame count
    const timestamps = location.map((l) => new Date(l.date).getTime()).filter((t) => !isNaN(t));
    if (timestamps.length === 0) return 0;

    const minTime = Math.min(...timestamps);
    const maxTime = Math.max(...timestamps);
    const totalDurationMs = maxTime - minTime;

    // Estimate frames at 200ms interval (5 fps)
    const estimatedFrames = Math.floor(totalDurationMs / DEFAULT_FRAME_INTERVAL_MS);

    return Math.max(1, estimatedFrames);
  } catch (error) {
    console.error('Error getting frame count:', error);
    return 0;
  }
}