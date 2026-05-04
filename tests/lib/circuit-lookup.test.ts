// @ts-nocheck
import { describe, test, expect } from 'vitest';
import {
  getCircuitLocation,
  hasCircuitLocation,
  getAllCircuitLocations,
  getApproximateCircuitCenterFromTrackCoordinates,
} from '../../lib/circuit-lookup';

describe('circuit-lookup', () => {
  describe('getCircuitLocation', () => {
    test('returns correct data for known circuit_key 63 (Sakhir)', () => {
      const result = getCircuitLocation(63);
      expect(result).toBeDefined();
      expect(result?.key).toBe(63);
      expect(result?.name).toBe('Bahrain International Circuit');
    });

    test('returns undefined for unknown circuit_key', () => {
      expect(getCircuitLocation(99999)).toBeUndefined();
    });
  });

  describe('getApproximateCircuitCenterFromTrackCoordinates', () => {
    test('returns undefined when coordinates are empty', () => {
      expect(getApproximateCircuitCenterFromTrackCoordinates([])).toBeUndefined();
    });

    test('derives non-zero approximate center for unknown circuit data', () => {
      const result = getApproximateCircuitCenterFromTrackCoordinates([
        { x: 2000, y: 1000 },
        { x: 3000, y: 2000 },
        { x: 4000, y: 3000 },
      ]);
      expect(result).toBeDefined();
      expect(result?.lat).not.toBe(0);
      expect(result?.lng).not.toBe(0);
    });
  });

  describe('hasCircuitLocation', () => {
    test('returns true for known keys', () => {
      expect(hasCircuitLocation(63)).toBe(true);
      expect(hasCircuitLocation(10)).toBe(true);
      expect(hasCircuitLocation(77)).toBe(true);
    });

    test('returns false for unknown keys', () => {
      expect(hasCircuitLocation(99999)).toBe(false);
      expect(hasCircuitLocation(0)).toBe(false);
    });
  });

  describe('getAllCircuitLocations', () => {
    test('returns expanded coverage table', () => {
      const result = getAllCircuitLocations();
      expect(result.length).toBeGreaterThanOrEqual(29);
    });
  });
});
