/**
 * Circuit Lat/Lng Lookup Table
 *
 * Maps OpenF1 circuit_key values to approximate geographic coordinates.
 */

export interface CircuitLocation {
  key: number;
  name: string;
  lat: number;
  lng: number;
}

const CIRCUIT_LOCATIONS: Record<number, CircuitLocation> = {
  2: { key: 2, name: 'Silverstone Circuit', lat: 52.0786, lng: -1.0169 },
  4: { key: 4, name: 'Hungaroring', lat: 47.5789, lng: 19.2486 },
  6: { key: 6, name: 'Autodromo Enzo e Dino Ferrari', lat: 44.3439, lng: 11.7167 },
  7: { key: 7, name: 'Circuit de Spa-Francorchamps', lat: 50.4372, lng: 5.9714 },
  9: { key: 9, name: 'Circuit of the Americas', lat: 30.1328, lng: -97.6411 },
  10: { key: 10, name: 'Albert Park Circuit', lat: -37.8497, lng: 144.968 },
  14: { key: 14, name: 'Autódromo José Carlos Pace', lat: -23.7036, lng: -46.6997 },
  15: { key: 15, name: 'Circuit de Barcelona-Catalunya', lat: 41.57, lng: 2.2611 },
  19: { key: 19, name: 'Red Bull Ring', lat: 47.2197, lng: 14.7647 },
  22: { key: 22, name: 'Circuit de Monaco', lat: 43.7347, lng: 7.4206 },
  23: { key: 23, name: 'Circuit Gilles Villeneuve', lat: 45.5, lng: -73.5228 },
  39: { key: 39, name: 'Autodromo Nazionale Monza', lat: 45.6156, lng: 9.2811 },
  46: { key: 46, name: 'Suzuka International Racing Course', lat: 34.8431, lng: 136.541 },
  49: { key: 49, name: 'Shanghai International Circuit', lat: 31.3389, lng: 121.22 },
  55: { key: 55, name: 'Circuit Zandvoort', lat: 52.3888, lng: 4.5409 },
  61: { key: 61, name: 'Marina Bay Street Circuit', lat: 1.2914, lng: 103.864 },
  63: { key: 63, name: 'Bahrain International Circuit', lat: 26.0325, lng: 50.5106 },
  65: { key: 65, name: 'Autodromo Hermanos Rodríguez', lat: 19.4042, lng: -99.0907 },
  70: { key: 70, name: 'Yas Marina Circuit', lat: 24.4672, lng: 54.6031 },

  // Legacy/alternate OpenF1 keys seen across supported seasons.
  76: { key: 76, name: 'Baku City Circuit', lat: 40.3725, lng: 49.8533 },
  77: { key: 77, name: 'Jeddah Corniche Circuit', lat: 21.6319, lng: 39.1044 },
  78: { key: 78, name: 'Miami International Autodrome', lat: 25.9581, lng: -80.2389 },
  79: { key: 79, name: 'Las Vegas Strip Circuit', lat: 36.1147, lng: -115.1728 },
  80: { key: 80, name: 'Losail International Circuit', lat: 25.4861, lng: 51.4486 },

  // Newer OpenF1 keys used for the same venues.
  144: { key: 144, name: 'Baku City Circuit', lat: 40.3725, lng: 49.8533 },
  149: { key: 149, name: 'Jeddah Corniche Circuit', lat: 21.6319, lng: 39.1044 },
  150: { key: 150, name: 'Losail International Circuit', lat: 25.4861, lng: 51.4486 },
  151: { key: 151, name: 'Miami International Autodrome', lat: 25.9581, lng: -80.2389 },
  152: { key: 152, name: 'Las Vegas Strip Circuit', lat: 36.1147, lng: -115.1728 },
};

export function getCircuitLocation(circuitKey: number): CircuitLocation | undefined {
  return CIRCUIT_LOCATIONS[circuitKey];
}

export function getAllCircuitLocations(): CircuitLocation[] {
  return Object.values(CIRCUIT_LOCATIONS);
}

export function hasCircuitLocation(circuitKey: number): boolean {
  return circuitKey in CIRCUIT_LOCATIONS;
}


export function getApproximateCircuitCenterFromTrackCoordinates(
  trackCoordinates: { x: number; y: number }[]
): { lat: number; lng: number } | undefined {
  if (!trackCoordinates || trackCoordinates.length === 0) return undefined;

  // Calculate the bounding box of the track coordinates
  const xCoords = trackCoordinates.map(p => p.x).filter(x => !isNaN(x));
  const yCoords = trackCoordinates.map(p => p.y).filter(y => !isNaN(y));

  if (xCoords.length === 0 || yCoords.length === 0) return undefined;

  const minX = Math.min(...xCoords);
  const maxX = Math.max(...xCoords);
  const minY = Math.min(...yCoords);
  const maxY = Math.max(...yCoords);

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  // OpenF1 local coordinates are meter-based offsets from a venue origin.
  // Crucially, we DON'T know where that origin is geographically without a reference.
  // Returning (centerX/111320) as lat/lng is wrong because it assumes the origin is at (0,0) lat/lng (Null Island).
  
  // Since we can't determine the geographic center from local coordinates alone,
  // we return undefined here to signal that geographic placement failed.
  // This forces the caller to rely on the lookup table or show an error.
  console.warn('[circuit-lookup] Cannot determine geographic center from local coordinates alone. Need lookup reference.');
  return undefined;
}

