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
} from './types';

import { FrameBuffer } from './frameBuffer';

import {
  getDrivers,
  getLocation,
  getCarData,
  getWeather,
  getRaceControl,
} from './api/openf1';

/**
 * Configuration for RaceDataService
 */
export interface RaceDataServiceConfig {
  /** Session key for the race session */
  sessionKey: number;
  /** Frame interval in milliseconds (default: 200ms = 5 fps) */
  frameIntervalMs?: number;
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
 * Find the closest item to a target timestamp
 * Returns the item whose date is closest to and not exceeding the target,
 * or the closest if all are after the target
 *
 * @param items - Array of items with date strings
 * @param targetMs - Target timestamp in milliseconds
 * @returns The closest item or null if items is empty
 */
function findClosest<T extends { date: string }>(
  items: T[],
  targetMs: number
): T | null {
  if (items.length === 0) {
    return null;
  }

  let bestBefore: T | null = null;
  let bestAfter: T | null = null;
  let smallestBeforeDiff = Infinity;
  let smallestAfterDiff = Infinity;

  for (const item of items) {
    const itemMs = new Date(item.date).getTime();
    const diff = targetMs - itemMs;

    if (diff >= 0) {
      // At or before target
      if (diff < smallestBeforeDiff) {
        bestBefore = item;
        smallestBeforeDiff = diff;
      }
    } else {
      // After target
      const absDiff = Math.abs(diff);
      if (absDiff < smallestAfterDiff) {
        bestAfter = item;
        smallestAfterDiff = absDiff;
      }
    }
  }

  // Prefer before-target (≤ target). Fall back to nearest after-target.
  return bestBefore ?? bestAfter;
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
  const { sessionKey, frameIntervalMs = DEFAULT_FRAME_INTERVAL_MS } = config;

  try {
    // Fetch all data in parallel
    const results = await Promise.all([
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      getDrivers({ session_key: sessionKey } as any).catch((err) => {
        console.error('Error fetching drivers:', err);
        return [] as Driver[];
      }),
      getLocation({ session_key: sessionKey }).catch((err) => {
        console.error('Error fetching location:', err);
        return [] as LocationData[];
      }),
      getCarData({ session_key: sessionKey }).catch((err) => {
        console.error('Error fetching car data:', err);
        return [] as CarData[];
      }),
      getWeather({ session_key: sessionKey }).catch((err) => {
        console.error('Error fetching weather:', err);
        return [] as WeatherData[];
      }),
      getRaceControl({ session_key: sessionKey }).catch((err) => {
        console.error('Error fetching race control:', err);
        return [] as RaceControlData[];
      }),
    ]);

    const drivers = results[0] as Driver[];
    const locationData = results[1] as LocationData[];
    const carData = results[2] as CarData[];
    const weatherData = results[3] as WeatherData[];
    const raceControlData = results[4] as RaceControlData[];

    // Handle empty responses
    if (drivers.length === 0 || locationData.length === 0) {
      console.warn('No driver or location data found for session:', sessionKey);
      return {
        frameBuffer: new FrameBuffer(),
        drivers: [],
        totalFrames: 0,
        timeRange: null,
      };
    }

    // Group location and car data by driver
    const locationByDriver = new Map<number, LocationData[]>();
    const carDataByDriver = new Map<number, CarData[]>();

    for (const loc of locationData) {
      const driverNumber = loc.driver_number;
      if (!locationByDriver.has(driverNumber)) {
        locationByDriver.set(driverNumber, []);
      }
      locationByDriver.get(driverNumber)!.push(loc);
    }

    for (const car of carData) {
      const driverNumber = car.driver_number;
      if (!carDataByDriver.has(driverNumber)) {
        carDataByDriver.set(driverNumber, []);
      }
      carDataByDriver.get(driverNumber)!.push(car);
    }

    // Sort each driver's data by timestamp
    for (const [, locs] of locationByDriver) {
      locs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }

    for (const [, cars] of carDataByDriver) {
      cars.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }

    // Collect all unique timestamps from location data
    const timestampSet = new Set<number>();
    for (const loc of locationData) {
      const ts = new Date(loc.date).getTime();
      if (!isNaN(ts)) {
        timestampSet.add(ts);
      }
    }

    const allTimestamps = Array.from(timestampSet).sort((a, b) => a - b);

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
      // Find the closest actual timestamp
      const closestTimestamp = allTimestamps.reduce((prev, curr) =>
        Math.abs(curr - ts) < Math.abs(prev - ts) ? curr : prev
      );

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
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Race control sorted by time
    const sortedRaceControl = [...raceControlData].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    for (const targetTimestamp of sampledTimestamps) {
      const driverPositions: DriverPosition[] = [];

      // Build position for each driver
      for (const driver of drivers) {
        const driverNumber = driver.driver_number;
        const locs = locationByDriver.get(driverNumber) || [];
        const cars = carDataByDriver.get(driverNumber) || [];

        const closestLoc = findClosest(locs, targetTimestamp);
        const closestCar = findClosest(cars, targetTimestamp);

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

      // Get race control messages up to this point
      const frameRaceControl = sortedRaceControl.filter(
        (msg) => new Date(msg.date).getTime() <= targetTimestamp
      );

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