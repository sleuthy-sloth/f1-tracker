/**
 * Circuit Lat/Lng Lookup Table
 * 
 * Maps OpenF1 circuit_key values to approximate geographic coordinates.
 * These are reference points for projecting local X/Y coordinates onto satellite imagery.
 * 
 * Source: OpenF1 API circuit_key values from meetings endpoint (2023-2025 seasons)
 * Coordinates: Verified from OpenF1 API and public geographic data
 */

export interface CircuitLocation {
  key: number;
  name: string;
  lat: number;
  lng: number;
}

/**
 * Circuit reference locations mapped by circuit_key
 * Keys come from the OpenF1 API circuit_key field on Meeting objects
 */
const CIRCUIT_LOCATIONS: Record<number, CircuitLocation> = {
  // 2024-2025 F1 Calendar circuits (from OpenF1 API)
  
  // Bahrain International Circuit (Sakhir)
  63: { key: 63, name: 'Bahrain International Circuit', lat: 26.0325, lng: 50.5106 },
  
  // Jeddah Corniche Circuit
  149: { key: 149, name: 'Jeddah Corniche Circuit', lat: 21.6319, lng: 39.1044 },
  
  // Albert Park Circuit (Melbourne)
  10: { key: 10, name: 'Albert Park Circuit', lat: -37.8497, lng: 144.968 },
  
  // Suzuka International Racing Course
  46: { key: 46, name: 'Suzuka International Racing Course', lat: 34.8431, lng: 136.541 },
  
  // Shanghai International Circuit
  49: { key: 49, name: 'Shanghai International Circuit', lat: 31.3389, lng: 121.22 },
  
  // Miami International Autodrome
  151: { key: 151, name: 'Miami International Autodrome', lat: 25.9581, lng: -80.2389 },
  
  // Autodromo Enzo e Dino Ferrari (Imola)
  6: { key: 6, name: 'Autodromo Enzo e Dino Ferrari', lat: 44.3439, lng: 11.7167 },
  
  // Circuit de Monaco (Monte Carlo)
  22: { key: 22, name: 'Circuit de Monaco', lat: 43.7347, lng: 7.4206 },
  
  // Circuit Gilles Villeneuve (Montreal)
  23: { key: 23, name: 'Circuit Gilles Villeneuve', lat: 45.5, lng: -73.5228 },
  
  // Circuit de Barcelona-Catalunya
  15: { key: 15, name: 'Circuit de Barcelona-Catalunya', lat: 41.57, lng: 2.2611 },
  
  // Red Bull Ring (Spielberg)
  19: { key: 19, name: 'Red Bull Ring', lat: 47.2197, lng: 14.7647 },
  
  // Silverstone Circuit
  2: { key: 2, name: 'Silverstone Circuit', lat: 52.0786, lng: -1.0169 },
  
  // Hungaroring
  4: { key: 4, name: 'Hungaroring', lat: 47.5789, lng: 19.2486 },
  
  // Circuit de Spa-Francorchamps
  7: { key: 7, name: 'Circuit de Spa-Francorchamps', lat: 50.4372, lng: 5.9714 },
  
  // Circuit Zandvoort
  55: { key: 55, name: 'Circuit Zandvoort', lat: 52.3888, lng: 4.5409 },
  
  // Autodromo Nazionale Monza
  39: { key: 39, name: 'Autodromo Nazionale Monza', lat: 45.6156, lng: 9.2811 },
  
  // Baku City Circuit
  144: { key: 144, name: 'Baku City Circuit', lat: 40.3725, lng: 49.8533 },
  
  // Marina Bay Street Circuit
  61: { key: 61, name: 'Marina Bay Street Circuit', lat: 1.2914, lng: 103.864 },
  
  // Circuit of the Americas (Austin)
  9: { key: 9, name: 'Circuit of the Americas', lat: 30.1328, lng: -97.6411 },
  
  // Autodromo Hermanos Rodríguez (Mexico City)
  65: { key: 65, name: 'Autodromo Hermanos Rodríguez', lat: 19.4042, lng: -99.0907 },
  
  // Autódromo José Carlos Pace (Interlagos)
  14: { key: 14, name: 'Autódromo José Carlos Pace', lat: -23.7036, lng: -46.6997 },
  
  // Las Vegas Strip Circuit
  152: { key: 152, name: 'Las Vegas Strip Circuit', lat: 36.1147, lng: -115.1728 },
  
  // Losail International Circuit (Lusail)
  150: { key: 150, name: 'Losail International Circuit', lat: 25.4861, lng: 51.4486 },
  
  // Yas Marina Circuit
  70: { key: 70, name: 'Yas Marina Circuit', lat: 24.4672, lng: 54.6031 },
};

/**
 * Get the reference location for a circuit key
 * 
 * @param circuitKey - The OpenF1 circuit_key value
 * @returns The CircuitLocation or undefined if not found
 */
export function getCircuitLocation(circuitKey: number): CircuitLocation | undefined {
  return CIRCUIT_LOCATIONS[circuitKey];
}

/**
 * Get the reference location for a circuit key with a fallback
 * 
 * @param circuitKey - The OpenF1 circuit_key value
 * @returns The CircuitLocation (uses default 0,0 if not found)
 */
export function getCircuitLocationOrDefault(circuitKey: number): CircuitLocation {
  const location = CIRCUIT_LOCATIONS[circuitKey];
  if (location) return location;
  
  // Log warning for unknown circuits during development
  console.warn(`Circuit lookup: no location found for circuit_key=${circuitKey}, using default`);
  return { key: circuitKey, name: 'Unknown Circuit', lat: 0, lng: 0 };
}

/**
 * Get all known circuit locations
 * 
 * @returns Array of all CircuitLocation objects
 */
export function getAllCircuitLocations(): CircuitLocation[] {
  return Object.values(CIRCUIT_LOCATIONS);
}

/**
 * Check if a circuit key is known
 * 
 * @param circuitKey - The OpenF1 circuit_key value
 * @returns true if the circuit is in the lookup table
 */
export function hasCircuitLocation(circuitKey: number): boolean {
  return circuitKey in CIRCUIT_LOCATIONS;
}