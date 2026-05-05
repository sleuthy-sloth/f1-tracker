'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { ReplayFrame } from '@/lib/types';
import { FrameBuffer } from '@/lib/frameBuffer';

/**
 * Configuration for the replay engine
 */
export interface ReplayEngineConfig {
  frameBuffer: FrameBuffer;
  initialSpeed?: number;
}

/**
 * State and actions returned by the useReplayEngine hook
 */
export interface ReplayEngineState {
  // State
  currentFrame: ReplayFrame | null;
  isPlaying: boolean;
  speed: number;
  currentIndex: number;
  totalFrames: number;
  timeRange: { start: number; end: number } | null;
  progress: number;

  // Actions
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  stepForward: () => void;
  stepBack: () => void;
  setSpeed: (speed: number) => void;
  seekToIndex: (index: number) => void;
  seekToTimestamp: (timestamp: number | string) => void;
  seekToProgress: (progress: number) => void;
}

/**
 * Valid playback speeds
 */
const VALID_SPEEDS = [0.25, 0.5, 1, 2, 5, 10, 20] as const;

/**
 * Interval in ms for the playback timer (100ms for responsive feel)
 */
const TICK_INTERVAL_MS = 100;

/**
 * Default initial speed
 */
const DEFAULT_SPEED = 1;

/**
 * useReplayEngine - Custom React hook for replay playback
 * Provides state and controls for navigating through race replay frames
 *
 * @example
 * const engine = useReplayEngine({ frameBuffer, initialSpeed: 1 });
 * engine.play();
 * engine.setSpeed(5);
 * engine.seekToProgress(0.5);
 */
export function useReplayEngine(config: ReplayEngineConfig): ReplayEngineState {
  const { frameBuffer, initialSpeed = DEFAULT_SPEED } = config;

  // State
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeedState] = useState(initialSpeed);
  // Trigger re-render when index changes (FrameBuffer manages the actual index)
  const [, setRenderTick] = useState(0);

  // Refs for interval and async-safe state
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const frameBufferRef = useRef(frameBuffer);
  const isPlayingRef = useRef(isPlaying);
  const speedRef = useRef(speed);
  const accumulatorRef = useRef(0);

  // Sync refs with state
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { speedRef.current = speed; }, [speed]);

  // Keep frameBuffer ref updated and re-render when the buffer mutates
  // (driver data streamed in progressively).
  useEffect(() => {
    frameBufferRef.current = frameBuffer;
    const unsubscribe = frameBuffer.subscribe(() => {
      setRenderTick((t) => t + 1);
    });
    return unsubscribe;
  }, [frameBuffer]);

  // Derived state (uses frameBuffer directly to stay in sync)
  const totalFrames = frameBuffer.length;
  const timeRange = frameBuffer.getTimeRange();
  const currentIndex = frameBuffer.index >= 0 ? frameBuffer.index : 0;
  const progress = totalFrames === 0 ? 0 : totalFrames === 1 ? 1 : currentIndex / (totalFrames - 1);
  // Return a shallow copy on every render so React memo'd consumers
  // (TelemetryHUD, Leaderboard, etc.) re-render after in-place buffer mutations
  // such as progressive driver location/telemetry streams.
  const rawFrame = frameBuffer.current;
  const currentFrame = rawFrame
    ? { ...rawFrame, driver_positions: rawFrame.driver_positions.slice() }
    : null;

  // Trigger re-render via renderTick increment
  const bumpRenderTick = useCallback(() => {
    setRenderTick((t) => t + 1);
  }, []);

  // Clear interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Playback loop
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        const fb = frameBufferRef.current;

        // Guard: check playing state synchronously via ref
        if (!isPlayingRef.current) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          return;
        }

        // Check if we've reached the end
        if (!fb.hasNext) {
          setIsPlaying(false);
          return;
        }

        // Accumulate fractional speed value for sub-1x speeds (0.25, 0.5)
        accumulatorRef.current += speedRef.current;
        let framesToAdvance = Math.floor(accumulatorRef.current);
        if (framesToAdvance > 0) {
          accumulatorRef.current -= framesToAdvance;
          // Clamp to not exceed remaining frames
          framesToAdvance = Math.min(framesToAdvance, fb.length - fb.index - 1);
          if (framesToAdvance > 0) {
            fb.seek(fb.index + framesToAdvance);
            bumpRenderTick();
          }
        }
      }, TICK_INTERVAL_MS);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      // Reset accumulator on pause
      accumulatorRef.current = 0;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPlaying, bumpRenderTick]);

  // Actions - all use frameBufferRef for consistency
  const play = useCallback(() => {
    const fb = frameBufferRef.current;
    if (fb.length === 0) return;
    // If at end, restart from beginning
    if (!fb.hasNext) {
      fb.seek(0);
      bumpRenderTick();
    }
    setIsPlaying(true);
  }, [bumpRenderTick]);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlayingRef.current) {
      pause();
    } else {
      play();
    }
  }, [play, pause]);

  const stepForward = useCallback(() => {
    const fb = frameBufferRef.current;
    if (fb.length === 0) return;
    const next = fb.next();
    if (next) {
      bumpRenderTick();
    }
  }, [bumpRenderTick]);

  const stepBack = useCallback(() => {
    const fb = frameBufferRef.current;
    if (fb.length === 0) return;
    const prev = fb.prev();
    if (prev) {
      bumpRenderTick();
    }
  }, [bumpRenderTick]);

  const setSpeed = useCallback((newSpeed: number) => {
    // Clamp to valid speeds
    const clampedSpeed = VALID_SPEEDS.includes(newSpeed as typeof VALID_SPEEDS[number])
      ? newSpeed
      : VALID_SPEEDS.find((s) => s >= newSpeed) ?? DEFAULT_SPEED;
    setSpeedState(clampedSpeed);
    accumulatorRef.current = 0; // Reset accumulator on speed change
  }, []);

  const seekToIndex = useCallback((index: number) => {
    const fb = frameBufferRef.current;
    if (fb.length === 0) return;
    const frame = fb.seek(index);
    if (frame) {
      bumpRenderTick();
    }
  }, [bumpRenderTick]);

  const seekToTimestamp = useCallback((timestamp: number | string) => {
    const fb = frameBufferRef.current;
    if (fb.length === 0) return;
    const frame = fb.seekToTimestamp(timestamp);
    if (frame) {
      bumpRenderTick();
    }
  }, [bumpRenderTick]);

  const seekToProgress = useCallback((progressValue: number) => {
    const fb = frameBufferRef.current;
    if (fb.length === 0) return;
    const clampedProgress = Math.max(0, Math.min(1, progressValue));
    const targetIndex = Math.round(clampedProgress * (fb.length - 1));
    const frame = fb.seek(targetIndex);
    if (frame) {
      bumpRenderTick();
    }
  }, [bumpRenderTick]);

  return {
    // State
    currentFrame,
    isPlaying,
    speed,
    currentIndex,
    totalFrames,
    timeRange,
    progress,

    // Actions
    play,
    pause,
    togglePlay,
    stepForward,
    stepBack,
    setSpeed,
    seekToIndex,
    seekToTimestamp,
    seekToProgress,
  };
}

export default useReplayEngine;