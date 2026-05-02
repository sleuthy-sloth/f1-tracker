/**
 * Frame Buffer for Storing and Navigating Race Replay Frames
 * Provides sequential access to ReplayFrame objects with seeking and timestamp navigation
 */

import type { ReplayFrame } from './types';

/**
 * Frame buffer state interface
 */
interface FrameBufferState {
  frames: ReplayFrame[];
  currentIndex: number;
}

/**
 * FrameBuffer - A circular buffer for storing and navigating replay frames
 * Provides methods for sequential access, binary search, and timestamp-based seeking
 */
export class FrameBuffer {
  private frames: ReplayFrame[] = [];
  private currentIndex: number = -1;

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
}

export type { FrameBufferState };