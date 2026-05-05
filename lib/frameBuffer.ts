/**
 * Frame Buffer for Storing and Navigating Race Replay Frames
 * Provides sequential access to ReplayFrame objects with seeking and timestamp navigation
 */

import type { ReplayFrame, LocationData, CarData, DriverPosition } from './types';

/**
 * Frame buffer state interface
 */
interface FrameBufferState {
  frames: ReplayFrame[];
  currentIndex: number;
}

/**
 * FrameBuffer - A circular buffer for storing and navigating replay frames
 * Provides methods for sequential access, binary search, and timestamp-based seeking.
 *
 * The buffer also supports in-place mutation (replaceDriverLocations / replaceDriverCarData)
 * so progressive driver data can stream in without re-creating the buffer or
 * disrupting the user's current playback position. Subscribers (e.g. the
 * replay engine hook) are notified after each mutation.
 */
export class FrameBuffer {
  private frames: ReplayFrame[] = [];
  private currentIndex: number = -1;
  private listeners: Set<() => void> = new Set();
  private _version = 0;

  /**
   * Create a new FrameBuffer
   * @param frames - Optional initial frames to load
   */
  constructor(frames?: ReplayFrame[]) {
    if (frames && frames.length > 0) {
      this.load(frames);
    }
  }

  /**
   * Monotonic counter that increments on every mutation. Cheap dependency
   * for memoised consumers that need to re-derive on buffer change.
   */
  get version(): number {
    return this._version;
  }

  /**
   * Subscribe to mutation events. Returns an unsubscribe function.
   */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this._version++;
    for (const listener of this.listeners) {
      listener();
    }
  }

  /**
   * Get the total number of frames
   */
  get length(): number {
    return this.frames.length;
  }

  /**
   * Get the current index position
   */
  get index(): number {
    return this.currentIndex;
  }

  /**
   * Check if there's a previous frame available
   */
  get hasPrev(): boolean {
    return this.currentIndex > 0;
  }

  /**
   * Check if there's a next frame available
   */
  get hasNext(): boolean {
    return this.currentIndex < this.frames.length - 1;
  }

  /**
   * Get the current frame
   */
  get current(): ReplayFrame | null {
    if (this.currentIndex >= 0 && this.currentIndex < this.frames.length) {
      return this.frames[this.currentIndex];
    }
    return null;
  }

  /**
   * Load or replace frames in the buffer
   * Resets index to 0
   * @param frames - Array of ReplayFrame objects
   */
  load(frames: ReplayFrame[]): void {
    this.frames = frames && frames.length > 0 ? [...frames] : [];
    this.currentIndex = this.frames.length > 0 ? 0 : -1;
  }

  /**
   * Advance to the next frame
   * @returns The next frame or null if at end
   */
  next(): ReplayFrame | null {
    if (!this.hasNext) {
      return null;
    }
    this.currentIndex++;
    return this.current;
  }

  /**
   * Go back to the previous frame
   * @returns The previous frame or null if at start
   */
  prev(): ReplayFrame | null {
    if (!this.hasPrev) {
      return null;
    }
    this.currentIndex--;
    return this.current;
  }

  /**
   * Seek to a specific index
   * @param index - Target index
   * @returns The frame at that index or null if out of bounds
   */
  seek(index: number): ReplayFrame | null {
    if (index < 0 || index >= this.frames.length) {
      return null;
    }
    this.currentIndex = index;
    return this.current;
  }

  /**
   * Seek to a frame by reference
   * Finds the frame that matches the target frame
   * @param targetFrame - The frame to find
   * @returns The found frame or null if not found
   */
  seekToFrame(targetFrame: ReplayFrame): ReplayFrame | null {
    const targetIndex = this.frames.findIndex(
      (f) =>
        f.timestamp === targetFrame.timestamp &&
        f.date === targetFrame.date
    );
    if (targetIndex === -1) {
      return null;
    }
    this.currentIndex = targetIndex;
    return this.current;
  }

  /**
   * Find the closest index for a given timestamp using binary search
   * @param timestamp - Target timestamp (millis or ISO date string)
   * @returns The index of the closest frame or -1 if empty
   */
  findIndexByTimestamp(timestamp: number | string): number {
    if (this.frames.length === 0) {
      return -1;
    }

    const targetMs =
      typeof timestamp === 'string' ? new Date(timestamp).getTime() : timestamp;

    // Binary search: find exact match or insertion point
    let low = 0;
    let high = this.frames.length - 1;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const midTimestamp = this.frames[mid].timestamp;

      if (midTimestamp === targetMs) {
        return mid;
      }
      if (midTimestamp < targetMs) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    // After search: high < low. low is the insertion point.
    // If high < 0, all frames are after target → return low (index 0)
    // If low >= length, all frames are before target → return high
    // Otherwise, compare which neighbor is closer
    if (high < 0) return low;
    if (low >= this.frames.length) return high;

    const diffHigh = Math.abs(this.frames[high].timestamp - targetMs);
    const diffLow = Math.abs(this.frames[low].timestamp - targetMs);
    return diffHigh <= diffLow ? high : low;
  }

  /**
   * Seek to the frame closest to a given timestamp
   * @param timestamp - Target timestamp (millis or ISO date string)
   * @returns The frame or null if empty
   */
  seekToTimestamp(timestamp: number | string): ReplayFrame | null {
    const index = this.findIndexByTimestamp(timestamp);
    if (index === -1) {
      return null;
    }
    return this.seek(index);
  }

  /**
   * Get a range of frames
   * @param start - Start index (clamped to 0 if negative)
   * @param end - End index (clamped to length if out of bounds)
   * @returns Array of frames in the range
   */
  getRange(start: number, end: number): ReplayFrame[] {
    const clampedStart = Math.max(0, start);
    const clampedEnd = Math.min(this.frames.length, end);

    if (clampedStart >= clampedEnd) {
      return [];
    }

    return this.frames.slice(clampedStart, clampedEnd);
  }

  /**
   * Get a copy of all frames
   * @returns Copy of all frames
   */
  getAll(): ReplayFrame[] {
    return [...this.frames];
  }

  /**
   * Get the time range of frames
   * @returns Object with start and end timestamps or null if empty
   */
  getTimeRange(): { start: number; end: number } | null {
    if (this.frames.length === 0) {
      return null;
    }
    return {
      start: this.frames[0].timestamp,
      end: this.frames[this.frames.length - 1].timestamp,
    };
  }

  /**
   * Replace the x/y for a single driver across all frames using fresh location
   * data. Frames where the driver is not yet present have a position appended.
   * Intended for progressive (streaming) loads where each driver's GPS arrives
   * separately. Notifies subscribers after the in-place edit.
   */
  replaceDriverLocations(driverNumber: number, locations: LocationData[]): void {
    if (this.frames.length === 0 || locations.length === 0) return;

    const sorted = sortAndStampByDate(locations);

    for (const frame of this.frames) {
      const closest = closestByTimestamp(sorted, frame.timestamp);
      if (!closest) continue;

      const existing = frame.driver_positions.find(
        (dp) => dp.driver_number === driverNumber
      );
      if (existing) {
        existing.x = closest.x;
        existing.y = closest.y;
      } else {
        const fresh: DriverPosition = {
          driver_number: driverNumber,
          position: frame.driver_positions.length + 1,
          x: closest.x,
          y: closest.y,
          speed: 0,
          rpm: 0,
          gear: 0,
          throttle: 0,
          brake: 0,
          drs: 0,
        };
        frame.driver_positions.push(fresh);
      }
    }

    this.notify();
  }

  /**
   * Fill in speed/rpm/gear/throttle/brake/drs for a single driver across all
   * frames using fresh car-data. Drivers not yet present in a frame are skipped.
   * Notifies subscribers after the in-place edit.
   */
  replaceDriverCarData(driverNumber: number, carData: CarData[]): void {
    if (this.frames.length === 0 || carData.length === 0) return;

    const sorted = sortAndStampByDate(carData);

    for (const frame of this.frames) {
      const dp = frame.driver_positions.find(
        (p) => p.driver_number === driverNumber
      );
      if (!dp) continue;

      const closest = closestByTimestamp(sorted, frame.timestamp);
      if (!closest) continue;

      dp.speed = closest.speed ?? 0;
      dp.rpm = closest.rpm ?? 0;
      dp.gear = closest.n_gear ?? 0;
      dp.throttle = closest.throttle ?? 0;
      dp.brake = closest.brake ?? 0;
      dp.drs = closest.drs ?? 0;
    }

    this.notify();
  }
}

// ──────────────────────────────────────────────────────────────────────────
// Internal helpers — kept out of the public API
// ──────────────────────────────────────────────────────────────────────────

/**
 * Pre-stamp `_ts` (numeric timestamp) on each item if missing, then sort.
 * The optional `_ts` cache lets repeated binary searches skip Date parsing.
 */
function sortAndStampByDate<T extends { date: string }>(items: T[]): T[] {
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

/**
 * Binary search for the item whose `_ts` is closest to `targetMs`.
 */
function closestByTimestamp<T extends { date: string }>(
  items: T[],
  targetMs: number
): T | null {
  if (items.length === 0) return null;
  if (items.length === 1) return items[0];

  let low = 0;
  let high = items.length - 1;

  while (low <= high) {
    const mid = (low + high) >> 1;
    const midTs = (items[mid] as unknown as { _ts: number })._ts;
    if (midTs === targetMs) return items[mid];
    if (midTs < targetMs) low = mid + 1;
    else high = mid - 1;
  }

  if (high < 0) return items[low];
  if (low >= items.length) return items[high];

  const tsHigh = (items[high] as unknown as { _ts: number })._ts;
  const tsLow = (items[low] as unknown as { _ts: number })._ts;
  return Math.abs(tsHigh - targetMs) <= Math.abs(tsLow - targetMs)
    ? items[high]
    : items[low];
}

export type { FrameBufferState };