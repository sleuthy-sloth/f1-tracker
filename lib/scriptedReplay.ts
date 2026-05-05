/**
 * Scripted Replay Frame Generator
 *
 * Builds placeholder ReplayFrames where each driver is interpolated along a
 * known track path at a constant lap rate, offset by their grid position.
 * Used to make Strategy Lab interactive immediately while real per-driver
 * GPS data is still streaming in. As real data arrives, the FrameBuffer
 * mutates these frames in place.
 */

import type {
  Driver,
  ReplayFrame,
  DriverPosition,
  WeatherData,
  RaceControlData,
  LapData,
} from './types';

export interface ScriptedReplayConfig {
  /** Seed driver's track coordinates — the path scripted dots travel along */
  trackPath: { x: number; y: number }[];
  /** All drivers in the session (used for driver_number stability) */
  drivers: Driver[];
  /** Driver numbers ordered by grid position (P1 first). Drivers not present in
   *  trackPath's session are still rendered as scripted dots. */
  gridOrder: number[];
  /** Real session start timestamp (ms) — frame 0 timestamp. */
  startTimestamp: number;
  /** Real session end timestamp (ms). Determines total frame count. */
  endTimestamp: number;
  /** Frame interval in ms (default 200ms = 5fps). */
  frameIntervalMs?: number;
  /** Time per scripted lap in ms (default 90s). */
  scriptedLapMs?: number;
  /** Optional real lap start data (from the race leader). When provided, each
   *  frame's lap number is derived from the most recent lap start timestamp,
   *  giving accurate lap counts that match the actual race. */
  lapData?: LapData[];
  /** Optional total number of laps in the race (from SessionResult). Used to
   *  clamp the per-frame lap number so it never exceeds the race distance. */
  totalRaceLaps?: number;
  /** Optional weather samples — attached per-frame via nearest timestamp. */
  weather?: WeatherData[];
  /** Optional race control messages — attached per-frame via nearest timestamp. */
  raceControl?: RaceControlData[];
}

const DEFAULT_FRAME_INTERVAL_MS = 200;
const DEFAULT_SCRIPTED_LAP_MS = 90_000;

/**
 * Build a list of ReplayFrames covering the session's time range, with each
 * driver placed along the given track path at a constant cadence offset by
 * their grid index.
 */
export function buildScriptedFrames(config: ScriptedReplayConfig): ReplayFrame[] {
  const {
    trackPath,
    drivers,
    gridOrder,
    startTimestamp,
    endTimestamp,
    frameIntervalMs = DEFAULT_FRAME_INTERVAL_MS,
    scriptedLapMs = DEFAULT_SCRIPTED_LAP_MS,
    lapData,
    totalRaceLaps,
    weather,
    raceControl,
  } = config;

  if (trackPath.length === 0 || endTimestamp <= startTimestamp) {
    return [];
  }

  // Make sure every driver appears, even if not listed in gridOrder.
  const orderedNumbers: number[] = [...gridOrder];
  const seen = new Set(orderedNumbers);
  for (const d of drivers) {
    if (!seen.has(d.driver_number)) {
      orderedNumbers.push(d.driver_number);
      seen.add(d.driver_number);
    }
  }

  const pathLen = trackPath.length;
  const totalDrivers = Math.max(orderedNumbers.length, 1);
  // Spread the cars around ~1/3 of the lap so they're visible as a pack at start.
  const spacingFraction = 1 / (totalDrivers * 3);

  const sortedWeather = weather?.length ? sortByDate(weather) : null;
  const sortedRaceControl = raceControl?.length ? sortByDate(raceControl) : null;

  // ── Lap lookup: use real lap start timestamps if available ────────
  // Build a binary-search closure that maps any frame timestamp to the
  // correct lap number. Falls back to the time-based estimate when no
  // lap data is provided.
  const getLap = lapData && lapData.length > 0
    ? buildLapLookup(lapData, totalRaceLaps)
    : (ts: number) => {
        const lap = Math.floor((ts - startTimestamp) / scriptedLapMs) + 1;
        return totalRaceLaps ? Math.min(lap, totalRaceLaps) : lap;
      };

  const frames: ReplayFrame[] = [];
  const totalDurationMs = endTimestamp - startTimestamp;

  for (let t = 0; t <= totalDurationMs; t += frameIntervalMs) {
    const lapProgress = (t % scriptedLapMs) / scriptedLapMs;

    const driverPositions: DriverPosition[] = orderedNumbers.map(
      (driverNumber, gridIdx) => {
        // Negative offset puts later grid positions slightly behind P1.
        let p = lapProgress - gridIdx * spacingFraction;
        if (p < 0) p += 1;
        if (p >= 1) p -= 1;

        const idxFloat = p * pathLen;
        const idx = Math.floor(idxFloat) % pathLen;
        const point = trackPath[idx];

        return {
          driver_number: driverNumber,
          position: gridIdx + 1,
          x: point.x,
          y: point.y,
          speed: 0,
          rpm: 0,
          gear: 0,
          throttle: 0,
          brake: 0,
          drs: 0,
        };
      }
    );

    const ts = startTimestamp + t;

    const frameWeather = sortedWeather
      ? closestByTimestamp(sortedWeather, ts) ?? undefined
      : undefined;
    const frameRC = sortedRaceControl
      ? messagesAtOrBefore(sortedRaceControl, ts)
      : [];

    frames.push({
      timestamp: ts,
      date: new Date(ts).toISOString(),
      lap: getLap(ts),
      driver_positions: driverPositions,
      weather: frameWeather,
      safety_car: undefined,
      race_control_messages: frameRC,
    });
  }

  return frames;
}

// ──────────────────────────────────────────────────────────────────────────
// Internal helpers
// ──────────────────────────────────────────────────────────────────────────

function sortByDate<T extends { date: string }>(items: T[]): T[] {
  const out = items.slice();
  for (const item of out) {
    if ((item as unknown as { _ts?: number })._ts === undefined) {
      (item as unknown as { _ts: number })._ts = new Date(item.date).getTime();
    }
  }
  out.sort(
    (a, b) =>
      (a as unknown as { _ts: number })._ts -
      (b as unknown as { _ts: number })._ts
  );
  return out;
}

function closestByTimestamp<T extends { date: string }>(
  items: T[],
  ts: number
): T | null {
  if (items.length === 0) return null;
  let lo = 0;
  let hi = items.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const m = (items[mid] as unknown as { _ts: number })._ts;
    if (m === ts) return items[mid];
    if (m < ts) lo = mid + 1;
    else hi = mid - 1;
  }
  if (hi < 0) return items[lo];
  if (lo >= items.length) return items[hi];
  const tHi = (items[hi] as unknown as { _ts: number })._ts;
  const tLo = (items[lo] as unknown as { _ts: number })._ts;
  return Math.abs(tHi - ts) <= Math.abs(tLo - ts) ? items[hi] : items[lo];
}

/**
 * Return all race control messages whose timestamp is <= ts. Capped at the
 * 20 most recent to keep frame payload small.
 */
function messagesAtOrBefore(items: RaceControlData[], ts: number): RaceControlData[] {
  const filtered: RaceControlData[] = [];
  for (const m of items) {
    const mt = (m as unknown as { _ts: number })._ts;
    if (mt <= ts) filtered.push(m);
    else break;
  }
  return filtered.slice(-20);
}

/**
 * Build a binary-search closure that maps any frame timestamp to the
 * correct lap number using real lap-start timestamps from OpenF1.
 *
 * Assumes `laps` is sorted by date_start ascending. Only lap_number >= 1
 * entries are used (excludes the formation lap / lap 0).
 *
 * When totalRaceLaps is provided, the returned lap is clamped so it
 * never exceeds the actual race distance — this handles the time after
 * the chequered flag where no new lap starts exist.
 */
function buildLapLookup(
  laps: LapData[],
  totalRaceLaps?: number
): (ts: number) => number {
  // Convert lap date_start to numeric timestamps, keep only race laps.
  const lapStarts = laps
    .filter((l) => l.lap_number >= 1 && !!l.date_start)
    .map((l) => ({
      ts: new Date(l.date_start).getTime(),
      lap: l.lap_number,
    }))
    .sort((a, b) => a.ts - b.ts);

  const maxLap =
    totalRaceLaps && totalRaceLaps > 0
      ? totalRaceLaps
      : (lapStarts.length > 0 ? lapStarts[lapStarts.length - 1].lap : 0);

  return (ts: number): number => {
    if (lapStarts.length === 0) return 1;

    // Binary search: find the most recent lap start ≤ ts
    let lo = 0;
    let hi = lapStarts.length - 1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (lapStarts[mid].ts <= ts) lo = mid + 1;
      else hi = mid - 1;
    }

    // hi is the index of the most recent lap start ≤ ts
    if (hi < 0) return 1; // Before first lap start (formation lap etc.)
    return Math.min(lapStarts[hi].lap, maxLap);
  };
}
