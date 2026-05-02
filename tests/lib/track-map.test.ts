import { describe, it, expect } from 'bun:test';
import { getCircuitBounds, normalizeTrackCoordinates, getSectorCoordinates } from '../../lib/track-map';
import type { TrackCoordinate } from '../../lib/types';

describe('lib/track-map.ts', () => {
  describe('getCircuitBounds', () => {
    it('computes normal bounds for multiple coordinates', () => {
      const coords: TrackCoordinate[] = [
        { x: 0, y: 0 },
        { x: 10, y: 20 },
        { x: -5, y: 3 },
      ];

      const bounds = getCircuitBounds(coords);

      expect(bounds.minX).toBe(-5);
      expect(bounds.maxX).toBe(10);
      expect(bounds.minY).toBe(0);
      expect(bounds.maxY).toBe(20);
      expect(bounds.centerX).toBeCloseTo(2.5);
      expect(bounds.centerY).toBeCloseTo(10);
    });

    it('handles empty coordinates array', () => {
      const bounds = getCircuitBounds([]);
      expect(bounds.minX).toBe(0);
      expect(bounds.maxX).toBe(0);
      expect(bounds.minY).toBe(0);
      expect(bounds.maxY).toBe(0);
      expect(bounds.centerX).toBe(0);
      expect(bounds.centerY).toBe(0);
    });

    it('handles a single point', () => {
      const coords: TrackCoordinate[] = [{ x: 7, y: 9 }];
      const bounds = getCircuitBounds(coords);
      expect(bounds.minX).toBe(7);
      expect(bounds.maxX).toBe(7);
      expect(bounds.minY).toBe(9);
      expect(bounds.maxY).toBe(9);
      expect(bounds.centerX).toBe(7);
      expect(bounds.centerY).toBe(9);
    });
  });

  describe('normalizeTrackCoordinates', () => {
    it('normalizes coordinates to 0..1 scale with proper flipping of Y', () => {
      const coords: TrackCoordinate[] = [ { x: 0, y: 0 }, { x: 10, y: 20 } ];
      const width = 100;
      const height = 100;
      const result = normalizeTrackCoordinates(coords, width, height);

      // Expected based on internal math from implementation
      // Center at (width/2, height/2) and scale = 1 in this test case
      expect(result).toEqual([
        { x: 45, y: 60 },
        { x: 55, y: 40 },
      ]);
    });

    it('returns empty array for empty input', () => {
      const res = normalizeTrackCoordinates([], 100, 100);
      expect(res).toEqual([]);
    });

    it('degenerate single point maps to center', () => {
      const coords = [{ x: 1, y: 1 }];
      const res = normalizeTrackCoordinates(coords, 100, 200);
      expect(res).toEqual([{ x: 50, y: 100 }]);
    });

    it('backward-compat bounds parameter produces same result as omitting bounds', () => {
      const coords: TrackCoordinate[] = [ { x: 0, y: 0 }, { x: 10, y: 20 } ];
      const width = 100;
      const height = 100;
      const bounds = getCircuitBounds(coords);
      const resWithout = normalizeTrackCoordinates(coords, width, height, 40);
      const resWith = normalizeTrackCoordinates(coords, width, height, 40, bounds);
      expect(resWith).toEqual(resWithout);
    });

    it('Y-axis flip is applied in normalization', () => {
      const coords: TrackCoordinate[] = [ { x: 0, y: 0 }, { x: 0, y: 20 } ];
      const width = 100;
      const height = 100;
      const res = normalizeTrackCoordinates(coords, width, height, 40);
      // With Y-axis flip, higher original Y should map to lower screen Y
      expect(res[0].y).toBeGreaterThan(res[1].y);
    });
  });

  describe('getSectorCoordinates', () => {
    it('divides coordinates into three sectors correctly', () => {
      const coords: TrackCoordinate[] = [
        { x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 },
        { x: 3, y: 3 }, { x: 4, y: 4 }, { x: 5, y: 5 },
        { x: 6, y: 6 }, { x: 7, y: 7 }, { x: 8, y: 8 }
      ];
      expect(getSectorCoordinates(coords, 1)).toEqual({ start: 0, end: 3 });
      expect(getSectorCoordinates(coords, 2)).toEqual({ start: 3, end: 6 });
      expect(getSectorCoordinates(coords, 3)).toEqual({ start: 6, end: 9 });
    });

    it('returns empty range for empty coordinates', () => {
      expect(getSectorCoordinates([], 1)).toEqual({ start: 0, end: 0 });
    });

    it('sector 3 end equals total coordinates length', () => {
      const coords: TrackCoordinate[] = [ { x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 3 } ];
      const { end } = getSectorCoordinates(coords, 3);
      expect(end).toBe(coords.length);
    });
  });
});
