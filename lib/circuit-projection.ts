/**
 * Circuit Coordinate Projection
 * Converts local circuit X/Y coordinates (meters) to lat/lng using equirectangular projection
 * 
 * F1 circuits are relatively small (<10km), making equirectangular projection accurate enough
 * for satellite map overlay. Uses a reference point (circuit center lat/lng) to position
 * the track geographically.
 */

import type { TrackCoordinate } from './types';

/**
 * Earth radius in meters (WGS84 equatorial radius)
 */
const EARTH_RADIUS = 6378137;

/**
 * Project a single local coordinate to [lng, lat] using equirectangular projection
 * 
 * @param x - Local X coordinate in meters
 * @param y - Local Y coordinate in meters
 * @param refLat - Reference latitude (circuit center) in degrees
 * @param refLng - Reference longitude (circuit center) in degrees
 * @returns [lng, lat] pair for MapLibre GeoJSON
 */
export function projectToLatLng(
  x: number,
  y: number,
  refLat: number,
  refLng: number
): [number, number] {
  // Convert reference lat to radians
  const refLatRad = (refLat * Math.PI) / 180;
  
  // Meters to radians at this latitude
  const radPerMeterLat = 1 / EARTH_RADIUS;
  const radPerMeterLng = 1 / (EARTH_RADIUS * Math.cos(refLatRad));
  
  // Offset in radians, then convert to degrees
  const latOffsetRad = y * radPerMeterLat;
  const lngOffsetRad = x * radPerMeterLng;
  
  const latOffset = (latOffsetRad * 180) / Math.PI;
  const lngOffset = (lngOffsetRad * 180) / Math.PI;
  
  return [
    refLng + lngOffset,
    refLat + latOffset,
  ];
}

/**
 * Project an array of TrackCoordinates to GeoJSON coordinate pairs
 * 
 * @param coords - Array of {x, y} local coordinates
 * @param refLat - Reference latitude (circuit center)
 * @param refLng - Reference longitude (circuit center)
 * @returns Array of [lng, lat] coordinate pairs for GeoJSON
 */
export function projectTrackToGeoJSON(
  coords: TrackCoordinate[],
  refLat: number,
  refLng: number
): [number, number][] {
  return coords.map((c) => projectToLatLng(c.x, c.y, refLat, refLng));
}

/**
 * Build a GeoJSON FeatureCollection for driver positions
 * 
 * @param drivers - Array of { driver_number, x, y, ... } objects from ReplayFrame
 * @param refLat - Reference latitude (circuit center)
 * @param refLng - Reference longitude (circuit center)
 * @returns GeoJSON FeatureCollection with Point features
 */
export function buildDriversGeoJSON(
  drivers: { driver_number: number; x: number; y: number; speed?: number; gear?: number; drs?: number; [key: string]: unknown }[],
  refLat: number,
  refLng: number
): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: drivers.map((d) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: projectToLatLng(d.x, d.y, refLat, refLng),
      },
      properties: {
        driver_number: d.driver_number,
        speed: d.speed || 0,
        gear: d.gear || 0,
        drs: d.drs || 0,
      },
    })),
  };
}

/**
 * Build a GeoJSON LineString for the circuit track layout
 * 
 * @param coords - Array of {x, y} track coordinates
 * @param refLat - Reference latitude (circuit center)
 * @param refLng - Reference longitude (circuit center)
 * @returns GeoJSON Feature for the track LineString
 */
export function buildTrackGeoJSON(
  coords: TrackCoordinate[],
  refLat: number,
  refLng: number
): GeoJSON.Feature {
  return {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: projectTrackToGeoJSON(coords, refLat, refLng),
    },
    properties: {},
  };
}