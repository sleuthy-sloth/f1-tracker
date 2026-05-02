import { describe, it, expect } from 'bun:test';
import { getCircuitBounds, normalizeTrackCoordinates, getSectorCoordinates } from '../../lib/track-map';
import type { TrackCoordinate } from '../../lib/types';

describe('Adversarial tests for lib/track-map.ts', () => {
  // 1) Boundary/malformed coordinate values
  describe('Boundary/malformed coordinate values', () => {
    it('handles NaN values in coordinates without crashing', () => {
      const coords: TrackCoordinate[] = [ { x: NaN, y: 0 }, { x: 0, y: NaN } ];
      const res = normalizeTrackCoordinates(coords, 200, 200);
      expect(res.length).toBe(2);
      // Function gracefully handles NaN by collapsing bounds to valid range
      expect(typeof res[0].x).toBe('number');
      expect(typeof res[0].y).toBe('number');
      expect(typeof res[1].x).toBe('number');
      expect(typeof res[1].y).toBe('number');
      // Result should be finite (not crash or produce Infinity)
      expect(Number.isFinite(res[0].x)).toBe(true);
      expect(Number.isFinite(res[1].x)).toBe(true);
    });

    it('handles Infinity and -Infinity in coordinates', () => {
      const coords: TrackCoordinate[] = [ { x: Infinity, y: 0 }, { x: -Infinity, y: 20 } ];
      const res = normalizeTrackCoordinates(coords, 200, 200);
      expect(res.length).toBe(2);
      // Expect values to be finite or NaN; not crashing
      expect(typeof res[0].x).toBe('number');
      expect(typeof res[0].y).toBe('number');
    });

    it('handles very large coordinates without crashing and produces finite or NaN results', () => {
      const coords: TrackCoordinate[] = [ { x: 1e15, y: 0 }, { x: -1e15, y: 1e15 } ];
      const res = normalizeTrackCoordinates(coords, 200, 200);
      expect(res.length).toBe(2);
      // The resulting numbers should be finite (likely very small) or NaN, but not throw
      res.forEach(pt => {
        expect(typeof pt.x).toBe('number');
        expect(typeof pt.y).toBe('number');
      });
    });
  
    it('accepts degenerate inputs such as zero or negative canvas dimensions and still returns results', () => {
      const coords: TrackCoordinate[] = [ { x: 0, y: 0 }, { x: 10, y: 20 } ];
      const res0 = normalizeTrackCoordinates(coords, 0, 0, 40);
      const res1 = normalizeTrackCoordinates(coords, -100, -50, 40);
      expect(res0.length).toBe(2);
      expect(res1.length).toBe(2);
      res0.forEach(p => {
        expect(typeof p.x).toBe('number');
        expect(typeof p.y).toBe('number');
      });
      res1.forEach(p => {
        expect(typeof p.x).toBe('number');
        expect(typeof p.y).toBe('number');
      });
    });
  
    it('handles huge padding values (> canvas) and negative padding gracefully', () => {
      const coords: TrackCoordinate[] = [ { x: 0, y: 0 }, { x: 10, y: 20 } ];
      const resHugePad = normalizeTrackCoordinates(coords, 200, 200, 1000);
      const resNegPad = normalizeTrackCoordinates(coords, 200, 200, -40);
      expect(resHugePad.length).toBe(2);
      expect(resNegPad.length).toBe(2);
      resHugePad.forEach(p => {
        expect(typeof p.x).toBe('number');
        expect(typeof p.y).toBe('number');
      });
      resNegPad.forEach(p => {
        expect(typeof p.x).toBe('number');
        expect(typeof p.y).toBe('number');
      });
    });
  });

  // 2) Edge cases for getSectorCoordinates
  describe('getSectorCoordinates edge cases', () => {
    it('sector out of range (0) defaults to full range', () => {
      const coords: TrackCoordinate[] = [ { x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 } ];
      // Bypass TypeScript typing to test default behavior
      const res = (getSectorCoordinates as any)(coords, 0);
      expect(res.start).toBe(0);
      expect(res.end).toBe(coords.length);
    });

    it('sector out of range (4) defaults to full range', () => {
      const coords: TrackCoordinate[] = [ { x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 3 } ];
      const res = (getSectorCoordinates as any)(coords, 4);
      expect(res.start).toBe(0);
      expect(res.end).toBe(coords.length);
    });

    it('very large coordinates array yields correct sector sizing without error', () => {
      const coords: TrackCoordinate[] = Array.from({ length: 1000 }, (_, i) => ({ x: i, y: i }));
      const res2 = getSectorCoordinates(coords, 2);
      expect(res2.end - res2.start).toBe(Math.floor(1000 / 3));
    });
  });
});
