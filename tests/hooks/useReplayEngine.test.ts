import { describe, it, expect } from 'bun:test';
import { FrameBuffer } from '../../lib/frameBuffer';
import type { ReplayFrame } from '../../lib/types';

// We test the FrameBuffer + derived state that the hook depends on,
// and export a pure equivalent of the progress calculation.

// Replicate the progress calculation from useReplayEngine for testability
function calcProgress(totalFrames: number, currentIndex: number): number {
  if (totalFrames === 0) return 0;
  if (totalFrames === 1) return 1;
  return currentIndex / (totalFrames - 1);
}

// Replicate formatTime from TimelineControls
function formatTime(timestamp: number): string {
  const totalSeconds = Math.floor(timestamp / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;
}

function makeFrames(n: number): ReplayFrame[] {
  return Array.from({ length: n }, (_, i) => ({
    timestamp: i * 1000,
    date: new Date(i * 1000).toISOString(),
    lap: Math.floor(i / 10) + 1,
    driver_positions: [],
  }));
}

describe('useReplayEngine - derived state (pure functions)', () => {
  describe('progress calculation', () => {
    it('returns 0 for empty buffer', () => {
      expect(calcProgress(0, 0)).toBe(0);
    });

    it('returns 1 (100%) for single frame', () => {
      expect(calcProgress(1, 0)).toBe(1);
    });

    it('returns 0 at start of multi-frame', () => {
      expect(calcProgress(10, 0)).toBe(0);
    });

    it('returns 0.5 at midpoint', () => {
      expect(calcProgress(10, 4.5)).toBe(0.5);
    });

    it('returns 1 at last frame', () => {
      expect(calcProgress(10, 9)).toBe(1);
    });

    it('returns ~0.333 at one-third', () => {
      expect(calcProgress(10, 3)).toBeCloseTo(1 / 3);
    });
  });

  describe('frameBuffer integration', () => {
    it('empty buffer has length 0 and index -1', () => {
      const fb = new FrameBuffer();
      expect(fb.length).toBe(0);
      expect(fb.index).toBe(-1);
      expect(fb.current).toBeNull();
      expect(fb.hasNext).toBe(false);
      expect(fb.hasPrev).toBe(false);
    });

    it('single frame buffer has index 0, 100% progress', () => {
      const fb = new FrameBuffer(makeFrames(1));
      expect(fb.length).toBe(1);
      expect(fb.index).toBe(0);
      expect(fb.hasNext).toBe(false);
      expect(fb.hasPrev).toBe(false);
      expect(fb.current).toBeDefined();
      expect(calcProgress(fb.length, fb.index)).toBe(1);
    });

    it('navigation: next/prev works correctly', () => {
      const fb = new FrameBuffer(makeFrames(5));
      expect(fb.index).toBe(0);
      fb.next(); expect(fb.index).toBe(1);
      fb.next(); expect(fb.index).toBe(2);
      fb.prev(); expect(fb.index).toBe(1);
      fb.seek(4); expect(fb.index).toBe(4);
      expect(fb.hasNext).toBe(false);
      fb.prev(); expect(fb.index).toBe(3);
    });

    it('seek to timestamp finds correct frame', () => {
      const fb = new FrameBuffer(makeFrames(10));
      const frame = fb.seekToTimestamp(5000);
      expect(frame).toBeDefined();
      expect(frame?.timestamp).toBe(5000);
      expect(fb.index).toBe(5);
    });

    it('progress increases as we advance frames', () => {
      const fb = new FrameBuffer(makeFrames(5));
      const progressValues: number[] = [];
      for (let i = 0; i < 5; i++) {
        progressValues.push(calcProgress(fb.length, fb.index));
        fb.next();
      }
      expect(progressValues).toEqual([0, 0.25, 0.5, 0.75, 1]);
    });
  });
});

describe('TimelineControls - formatTime helper', () => {
  it('formats zero milliseconds', () => {
    expect(formatTime(0)).toBe('00:00');
  });

  it('formats seconds only', () => {
    expect(formatTime(5000)).toBe('00:05');
  });

  it('formats minutes', () => {
    expect(formatTime(125000)).toBe('02:05');
  });

  it('formats hours', () => {
    expect(formatTime(3661000)).toBe('01:01:01');
  });

  it('formats 90 minutes', () => {
    expect(formatTime(5400000)).toBe('01:30:00');
  });
});
