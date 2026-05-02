import { describe, it, expect } from 'bun:test';
import { FrameBuffer } from '../../lib/frameBuffer';
import type { ReplayFrame } from '../../lib/types';

// Helper to build a small, deterministic frame set
function makeFrames(): ReplayFrame[] {
  return [
    { timestamp: 0, date: '2020-01-01T00:00:00Z', lap: 1, driver_positions: [] },
    { timestamp: 1000, date: '2020-01-01T00:00:01Z', lap: 1, driver_positions: [] },
    { timestamp: 2000, date: '2020-01-01T00:00:02Z', lap: 1, driver_positions: [] },
  ];
}

describe('FrameBuffer', () => {
  it('Constructor / load: empty constructor and load replacement', () => {
    const fb = new FrameBuffer();
    expect(fb.length).toBe(0);
    expect(fb.index).toBe(-1);
    // current should be null for empty buffer
    expect(fb.current).toBeNull();

    const frames = makeFrames();
    fb.load(frames);
    expect(fb.length).toBe(3);
    expect(fb.index).toBe(0);
    expect(fb.current).toEqual(frames[0]);
  });

  it('Constructor with frames should expose properties', () => {
    const fb = new FrameBuffer();
    const frames = makeFrames();
    fb.load(frames);
    expect(fb.length).toBe(3);
    expect(fb.index).toBe(0);
    expect(fb.hasPrev).toBe(false);
    expect(fb.hasNext).toBe(true);
    expect(fb.current).toEqual(frames[0]);
  });

  it('Navigation: next() moves forward and returns null at end; prev() backwards', () => {
    const frames = makeFrames();
    const fb = new FrameBuffer(frames);
    // start at index 0
    expect(fb.current).toEqual(frames[0]);
    const n1 = fb.next();
    expect(n1).toEqual(frames[1]);
    expect(fb.index).toBe(1);
    const n2 = fb.next();
    expect(n2).toEqual(frames[2]);
    expect(fb.index).toBe(2);
    const nEnd = fb.next();
    expect(nEnd).toBeNull();
    expect(fb.index).toBe(2);
    const p1 = fb.prev();
    expect(p1).toEqual(frames[1]);
    expect(fb.index).toBe(1);
    const p0 = fb.prev();
    expect(p0).toEqual(frames[0]);
    expect(fb.index).toBe(0);
    const pStart = fb.prev();
    expect(pStart).toBeNull();
  });

  it('Seek: seek(index) within bounds and out-of-bounds handling', () => {
    const frames = makeFrames();
    const fb = new FrameBuffer(frames);
    fb.seek(0);
    expect(fb.index).toBe(0);
    fb.seek(frames.length - 1);
    expect(fb.index).toBe(frames.length - 1);
    const prevIndex = fb.index;
    const res = fb.seek(-5);
    expect(res).toBeNull();
    expect(fb.index).toBe(prevIndex);
    // another out-of-bounds (too large)
    const res2 = fb.seek(9999);
    expect(res2).toBeNull();
    expect(fb.index).toBe(prevIndex);
  });

  it('seekToFrame: by timestamp/date reference', () => {
    const frames = makeFrames();
    const fb = new FrameBuffer(frames);
    const found = fb.seekToFrame(frames[1] as any);
    expect(found).toEqual(frames[1]);
    const notFound = fb.seekToFrame({ timestamp: 9999, date: '2020-01-01T00:00:00Z', lap: 1, driver_positions: [] });
    expect(notFound).toBeNull();
  });

  it('findIndexByTimestamp: exact, closest, and edge cases', () => {
    const frames = makeFrames();
    const fb = new FrameBuffer(frames);
    // exact match
    expect(fb.findIndexByTimestamp(1000)).toBe(1);
    // closest-before when target between frames (tie goes to earlier)
    expect(fb.findIndexByTimestamp(1500)).toBe(1);
    // closest-after when after target is closer to the next frame
    expect(fb.findIndexByTimestamp(1501)).toBe(2);
    // before-all: returns 0 (closest frame)
    expect(fb.findIndexByTimestamp(-100)).toBe(0);
    // after-all: returns last index
    expect(fb.findIndexByTimestamp(3000)).toBe(2);
    // equal-distant should pick earlier frame
    // with 0, 1000, 2000, target 500 -> 0
    expect(fb.findIndexByTimestamp(500)).toBe(0);
    // ISO date string input
    expect(fb.findIndexByTimestamp('1970-01-01T00:00:01Z')).toBe(1);
    // empty buffer
    const emptyFb = new FrameBuffer([]);
    expect(emptyFb.findIndexByTimestamp(1000)).toBe(-1);
  });

  it('seekToTimestamp delegates to findIndexByTimestamp + seek', () => {
    const frames = makeFrames();
    const fb = new FrameBuffer(frames);
    fb.seekToTimestamp('1970-01-01T00:00:01Z');
    expect(fb.index).toBe(1);
  });

  it('getRange: normal ranges and bounds', () => {
    const frames = makeFrames();
    const fb = new FrameBuffer(frames);
    expect(fb.getRange(0, 2)).toEqual([frames[0], frames[1]]);
    // start > end -> []
    expect(fb.getRange(2, 1)).toEqual([]);
    // clamp start to 0 and end to length-1
    expect(fb.getRange(-5, 100)).toEqual(frames);
    // empty buffer
    const emptyFb = new FrameBuffer([]);
    expect(emptyFb.getRange(0, 1)).toEqual([]);
  });

  it('getTimeRange: returns start/end times or null for empties', () => {
    const frames = makeFrames();
    const fb = new FrameBuffer(frames);
    const tr = fb.getTimeRange();
    expect(tr).toBeDefined();
    expect(tr?.start).toBe(frames[0].timestamp);
    expect(tr?.end).toBe(frames[2].timestamp);
    // empty buffer
    const emptyFb = new FrameBuffer([]);
    expect(emptyFb.getTimeRange()).toBeNull();
    // single frame
    const single = new FrameBuffer([frames[0]] as any);
    const singleTr = single.getTimeRange();
    expect(singleTr).toBeDefined();
    expect(singleTr?.start).toBe(singleTr?.end);
  });

  it('getAll returns a copy and does not mutate buffer when modified', () => {
    const frames = makeFrames();
    const fb = new FrameBuffer(frames);
    const all = fb.getAll();
    // mutate the returned array reference and ensure buffer is unchanged
    all[0] = { timestamp: 9999, date: '2020-01-01T00:00:00Z', lap: 99, driver_positions: [] };
    const after = fb.getAll();
    expect(after[0]).toEqual(frames[0]);
  });
});
