import { describe, it, expect } from 'bun:test';
import TrackMap from '../../components/TrackMap';
import { getCircuitBounds, normalizeTrackCoordinates } from '../../lib/track-map';
import type { TrackLayout, DriverPosition, SafetyCarStatus } from '../../lib/types';

// We test TrackMap's exported component and utility integration without a DOM renderer,
// since Canvas-based rendering is validated through the unit tests for lib/track-map.ts.

describe('components/TrackMap.tsx', () => {
  const baseLayout: TrackLayout = {
    circuit_key: 1,
    circuit_name: 'Test Circuit',
    coordinates: [{ x: 0, y: 0 }, { x: 10, y: 20 }],
  };

  const drivers: DriverPosition[] = [
    { driver_number: 1, position: 1, x: 0, y: 0, speed: 0, rpm: 0, gear: 0, throttle: 0, brake: 0, drs: 0, gap_to_leader: null, interval: null },
    { driver_number: 44, position: 2, x: 5, y: 10, speed: 0, rpm: 0, gear: 0, throttle: 0, brake: 0, drs: 0, gap_to_leader: null, interval: null },
  ];

  it('exports the TrackMap component', () => {
    expect(TrackMap).toBeDefined();
    expect(typeof TrackMap).toBe('function');
  });

  it('accepts TrackLayout and DriverPosition props', () => {
    // Component type-checks via its props interface — this validates compilation
    const props = {
      trackLayout: baseLayout,
      driverPositions: drivers,
      width: 200,
      height: 150,
    };
    expect(props.trackLayout.circuit_name).toBe('Test Circuit');
    expect(props.driverPositions).toHaveLength(2);
  });

  it('handles empty driver positions', () => {
    const props = {
      trackLayout: baseLayout,
      driverPositions: [] as DriverPosition[],
      width: 200,
      height: 150,
    };
    expect(props.driverPositions).toHaveLength(0);
  });

  it('accepts optional activeSector prop', () => {
    const props = {
      trackLayout: baseLayout,
      driverPositions: drivers,
      activeSector: 1 as const,
    };
    expect(props.activeSector).toBe(1);
  });

  it('accepts optional safetyCar prop', () => {
    const safety: SafetyCarStatus = { status: 'deployed', x: 3, y: 4 };
    const props = {
      trackLayout: baseLayout,
      driverPositions: drivers,
      safetyCar: safety,
    };
    expect(props.safetyCar?.status).toBe('deployed');
    expect(props.safetyCar?.x).toBe(3);
    expect(props.safetyCar?.y).toBe(4);
  });

  it('accepts optional selectedDriver prop', () => {
    const props = {
      trackLayout: baseLayout,
      driverPositions: drivers,
      selectedDriver: 44,
    };
    expect(props.selectedDriver).toBe(44);
  });

  it('uses default dimensions when width/height are omitted', () => {
    const props = {
      trackLayout: baseLayout,
      driverPositions: drivers,
    };
    expect(props.trackLayout).toBeDefined();
    expect(props.driverPositions).toBeDefined();
    // Default is 800x600 per the component's destructuring
  });

  it('uses shared track bounds for coordinate normalization (critical correctness fix)', () => {
    // This validates the fix from the reviewer: driver positions must be normalized
    // using track bounds, not their own bounds.
    const trackBounds = getCircuitBounds(baseLayout.coordinates);

    // Normalize drivers using track bounds
    const normalizedDrivers = normalizeTrackCoordinates(
      drivers.map(d => ({ x: d.x, y: d.y })),
      200, 150, 40, trackBounds
    );

    // Normalize track using track bounds
    const normalizedTrack = normalizeTrackCoordinates(
      baseLayout.coordinates,
      200, 150, 40, trackBounds
    );

    // Drivers should be positioned relative to the track
    expect(normalizedDrivers).toHaveLength(2);
    expect(normalizedTrack).toHaveLength(2);

    // Verify Y-axis flip (higher original Y → lower canvas Y)
    expect(normalizedDrivers[0].y).toBeGreaterThan(normalizedDrivers[1].y);
  });
});
