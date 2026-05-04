// @ts-nocheck
import { describe, test, expect } from 'vitest';
import {
  projectToLatLng,
  projectTrackToGeoJSON,
  buildTrackGeoJSON,
  buildDriversGeoJSON,
} from '../../lib/circuit-projection';

// Reference point: Silverstone (lat: 52.0786, lng: -1.0169)
const SILVERSTONE_LAT = 52.0786;
const SILVERSTONE_LNG = -1.0169;

describe('circuit-projection', () => {
  describe('projectToLatLng', () => {
    test('known x,y at equator returns expected offset', () => {
      // At equator (lat=0), 1 degree of longitude ≈ 111km
      // 1000m should be approximately 0.009 degrees
      const result = projectToLatLng(1000, 1000, 0, 0);
      // x=1000m → ~0.009 degrees lng offset
      // y=1000m → ~0.009 degrees lat offset
      expect(result[0]).toBeCloseTo(0.009, 3);
      expect(result[1]).toBeCloseTo(0.009, 3);
    });

    test('handles negative coordinates', () => {
      const result = projectToLatLng(-500, -500, SILVERSTONE_LAT, SILVERSTONE_LNG);
      // Should return coordinates less than reference point
      expect(result[0]).toBeLessThan(SILVERSTONE_LNG);
      expect(result[1]).toBeLessThan(SILVERSTONE_LAT);
    });

    test('handles zero coordinate (should return ref point)', () => {
      const result = projectToLatLng(0, 0, SILVERSTONE_LAT, SILVERSTONE_LNG);
      expect(result[0]).toBe(SILVERSTONE_LNG);
      expect(result[1]).toBe(SILVERSTONE_LAT);
    });
  });

  describe('projectTrackToGeoJSON', () => {
    test('returns array of [lng, lat] pairs matching input length', () => {
      const coords = [
        { x: 0, y: 0 },
        { x: 100, y: 100 },
        { x: 200, y: 200 },
      ];
      const result = projectTrackToGeoJSON(coords, SILVERSTONE_LAT, SILVERSTONE_LNG);
      expect(result).toHaveLength(3);
      expect(result[0]).toHaveLength(2);
      expect(result[1]).toHaveLength(2);
      expect(result[2]).toHaveLength(2);
    });
  });

  describe('buildTrackGeoJSON', () => {
    test('returns GeoJSON Feature with LineString geometry', () => {
      const coords = [
        { x: 0, y: 0 },
        { x: 100, y: 100 },
      ];
      const result = buildTrackGeoJSON(coords, SILVERSTONE_LAT, SILVERSTONE_LNG);
      expect(result.type).toBe('Feature');
      expect(result.geometry.type).toBe('LineString');
      expect(result.geometry.coordinates).toBeDefined();
    });

    test('coordinates are [lng, lat] order (not lat, lng)', () => {
      const coords = [{ x: 0, y: 0 }];
      const result = buildTrackGeoJSON(coords, SILVERSTONE_LAT, SILVERSTONE_LNG);
      const coord = result.geometry.coordinates[0];
      // First element should be longitude (close to -1.0169)
      // Second element should be latitude (close to 52.0786)
      expect(coord[0]).toBeCloseTo(SILVERSTONE_LNG, 5);
      expect(coord[1]).toBeCloseTo(SILVERSTONE_LAT, 5);
    });
  });

  describe('buildDriversGeoJSON', () => {
    test('returns FeatureCollection with correct number of features', () => {
      const drivers = [
        { driver_number: 1, x: 0, y: 0 },
        { driver_number: 11, x: 100, y: 100 },
        { driver_number: 44, x: 200, y: 200 },
      ];
      const result = buildDriversGeoJSON(drivers, SILVERSTONE_LAT, SILVERSTONE_LNG);
      expect(result.type).toBe('FeatureCollection');
      expect(result.features).toHaveLength(3);
    });

    test('each feature has driver_number in properties', () => {
      const drivers = [
        { driver_number: 1, x: 0, y: 0 },
        { driver_number: 11, x: 100, y: 100 },
      ];
      const result = buildDriversGeoJSON(drivers, SILVERSTONE_LAT, SILVERSTONE_LNG);
      expect(result.features[0].properties.driver_number).toBe(1);
      expect(result.features[1].properties.driver_number).toBe(11);
    });

    test('extra properties pass through to GeoJSON properties', () => {
      const drivers = [
        { driver_number: 1, x: 0, y: 0, speed: 200, gear: 5, drs: 1 },
      ];
      const result = buildDriversGeoJSON(drivers, SILVERSTONE_LAT, SILVERSTONE_LNG);
      expect(result.features[0].properties.speed).toBe(200);
      expect(result.features[0].properties.gear).toBe(5);
      expect(result.features[0].properties.drs).toBe(1);
    });
  });
});