/**
 * Track Map Utilities
 * Coordinate normalization and helper functions for Canvas-based track rendering
 */

import type { TrackCoordinate } from './types';

/**
 * Bounding box for track coordinates
 */
interface CircuitBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  centerX: number;
  centerY: number;
}

/**
 * Sector coordinate range
 */
interface SectorCoordinates {
  start: number;
  end: number;
}

/**
 * Calculates the bounding box for a set of track coordinates
 * @param coordinates - Array of x,y coordinate points
 * @returns Bounding box with min/max values and center point
 */
export function getCircuitBounds(coordinates: TrackCoordinate[]): CircuitBounds {
  if (coordinates.length === 0) {
    return {
      minX: 0,
      minY: 0,
      maxX: 0,
      maxY: 0,
      centerX: 0,
      centerY: 0,
    };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const coord of coordinates) {
    if (coord.x < minX) minX = coord.x;
    if (coord.x > maxX) maxX = coord.x;
    if (coord.y < minY) minY = coord.y;
    if (coord.y > maxY) maxY = coord.y;
  }

  return {
    minX,
    minY,
    maxX,
    maxY,
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2,
  };
}

/**
 * Normalizes track coordinates to fit within a canvas of specified dimensions
 * 
 * This function takes raw X,Y coordinates from OpenF1 LocationData and transforms them
 * for Canvas rendering by:
 * 1. Finding the bounding box (min/max x and y) — or using a provided one
 * 2. Centering coordinates around the origin
 * 3. Flipping Y axis (SVG-style y-up to Canvas y-down)
 * 4. Scaling to fit within the target dimensions while maintaining aspect ratio
 * 
 * When normalizing driver positions or safety car positions alongside a track,
 * pass the track's pre-calculated bounds via the `bounds` parameter so all
 * elements share the same coordinate space.
 * 
 * @param coordinates - Raw track coordinates from OpenF1
 * @param width - Target canvas width in pixels
 * @param height - Target canvas height in pixels
 * @param padding - Padding around the edges (default: 40)
 * @param bounds - Optional pre-calculated circuit bounds. When provided, uses these
 *                 instead of computing bounds from the input coordinates. This ensures
 *                 driver dots and other markers align with the track's coordinate space.
 * @returns Normalized coordinates ready for Canvas rendering
 */
export function normalizeTrackCoordinates(
  coordinates: TrackCoordinate[],
  width: number,
  height: number,
  padding: number = 40,
  bounds?: CircuitBounds
): TrackCoordinate[] {
  if (coordinates.length === 0) {
    return [];
  }

  // Use provided bounds or calculate from input
  const circuitBounds = bounds ?? getCircuitBounds(coordinates);

  // Calculate available dimensions
  const availableWidth = width - 2 * padding;
  const availableHeight = height - 2 * padding;

  // Calculate track dimensions
  const trackWidth = circuitBounds.maxX - circuitBounds.minX;
  const trackHeight = circuitBounds.maxY - circuitBounds.minY;

  // Handle degenerate case (single point or line)
  if (trackWidth === 0 && trackHeight === 0) {
    return coordinates.map(() => ({
      x: width / 2,
      y: height / 2,
    }));
  }

  // Calculate scale factors for each dimension
  const scaleX = trackWidth > 0 ? availableWidth / trackWidth : 1;
  const scaleY = trackHeight > 0 ? availableHeight / trackHeight : 1;

  // Use the smaller scale to maintain aspect ratio
  const scale = Math.min(scaleX, scaleY);

  // Calculate the center offset to position track in canvas
  const centerX = width / 2;
  const centerY = height / 2;

  // Normalize each coordinate
  return coordinates.map(coord => {
    // Center around origin and flip Y axis (SVG y-up to Canvas y-down)
    const normalizedX = coord.x - circuitBounds.centerX;
    const normalizedY = -(coord.y - circuitBounds.centerY); // Flip Y

    // Scale and translate to canvas coordinates
    return {
      x: centerX + normalizedX * scale,
      y: centerY + normalizedY * scale,
    };
  });
}

/**
 * Returns the start and end indices for a given sector
 * 
 * Divides the coordinates array into 3 roughly equal segments for sector highlighting.
 * 
 * @param coordinates - Array of track coordinates
 * @param sector - Sector number (1, 2, or 3)
 * @returns Object with start and end indices for the sector
 */
export function getSectorCoordinates(
  coordinates: TrackCoordinate[],
  sector: 1 | 2 | 3
): SectorCoordinates {
  const totalCoords = coordinates.length;
  
  if (totalCoords === 0) {
    return { start: 0, end: 0 };
  }

  // Divide into 3 equal segments
  const segmentSize = Math.floor(totalCoords / 3);

  let start: number;
  let end: number;

  switch (sector) {
    case 1:
      start = 0;
      end = segmentSize;
      break;
    case 2:
      start = segmentSize;
      end = segmentSize * 2;
      break;
    case 3:
      start = segmentSize * 2;
      end = totalCoords;
      break;
    default:
      start = 0;
      end = totalCoords;
  }

  return { start, end };
}