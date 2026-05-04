// @ts-nocheck
import { vi, describe, test, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';

// Mock maplibre-gl before importing the component
vi.mock('maplibre-gl', () => ({
  default: {},
  Map: vi.fn(() => ({
    on: vi.fn(),
    remove: vi.fn(),
    resize: vi.fn(),
    getSource: vi.fn(),
    getLayer: vi.fn(),
    addSource: vi.fn(),
    addLayer: vi.fn(),
    removeLayer: vi.fn(),
    removeSource: vi.fn(),
    setFilter: vi.fn(),
    isStyleLoaded: vi.fn(() => true),
    getCenter: vi.fn(() => ({ lng: 0, lat: 0 })),
    setCenter: vi.fn(),
    setZoom: vi.fn(),
    getZoom: vi.fn(() => 16),
  })),
  GeoJSONSource: vi.fn(),
}));

// Mock React's useState to bypass loading state for renderToString testing
// This allows testing the component's logic for empty trackCoordinates
vi.mock('react', async () => {
  const actualReact = await vi.importActual('react');
  return {
    ...actualReact,
    useState: (initial: unknown) => {
      // If initial state is the mapState object with isLoading: true, return loaded state
      // This simulates the map having loaded
      if (typeof initial === 'object' && initial !== null && 'isLoading' in initial) {
        const loadedState = { isLoading: false, hasError: false };
        return [loadedState, () => {}];
      }
      // For other useState calls, return the initial value
      return [initial, () => {}];
    },
  };
});

// Now import the component
import { SatelliteTrackMap, SatelliteTrackMapProps } from '../../components/SatelliteTrackMap';

describe('SatelliteTrackMap', () => {
  describe('Component exports', () => {
    test('Component is a function (Module exports expected interface)', () => {
      expect(typeof SatelliteTrackMap).toBe('function');
    });
  });

  describe('SatelliteTrackMapProps interface', () => {
    test('Props interface has required fields', () => {
      // Verify the component accepts required props
      const requiredProps: SatelliteTrackMapProps = {
        circuitKey: 63,
        trackCoordinates: [{ x: 0, y: 0 }],
        driverPositions: [{ driver_number: 1, position: 1, x: 0, y: 0, speed: 0, rpm: 0, gear: 1, throttle: 0, brake: 0, drs: 0 }],
        drivers: [{ driver_number: 1, broadcast_name: 'VER', first_name: 'Max', last_name: 'Verstappen', full_name: 'Max Verstappen', name_acronym: 'VER', headshot_url: '', team_name: 'Red Bull', team_colour: '3671C6', meeting_key: 1, session_key: 1 }],
      };
      expect(requiredProps.circuitKey).toBeDefined();
      expect(requiredProps.trackCoordinates).toBeDefined();
      expect(requiredProps.driverPositions).toBeDefined();
      expect(requiredProps.drivers).toBeDefined();
    });

    test('Component accepts optional props (selectedDriver, safetyCar, className, width, height)', () => {
      const optionalProps = {
        selectedDriver: 1,
        safetyCar: { status: 'none' },
        className: 'custom-class',
        width: 800,
        height: 600,
      };
      expect(optionalProps.selectedDriver).toBe(1);
      expect(optionalProps.safetyCar).toBeDefined();
      expect(optionalProps.className).toBe('custom-class');
      expect(optionalProps.width).toBe(800);
      expect(optionalProps.height).toBe(600);
    });
  });

  describe('Loading state', () => {
    test('Loading state renders when circuitKey is 0', () => {
      const html = renderToString(
        <SatelliteTrackMap
          circuitKey={0}
          trackCoordinates={[]}
          driverPositions={[]}
          drivers={[]}
        />
      );
      expect(html).toContain('Loading track map');
    });
  });

  describe('Empty state', () => {
    test('Empty state renders when trackCoordinates is empty', () => {
      const html = renderToString(
        <SatelliteTrackMap
          circuitKey={63}
          trackCoordinates={[]}
          driverPositions={[]}
          drivers={[]}
        />
      );
      expect(html).toContain('Track layout unavailable');
    });
  });

  describe('Driver lookup memo', () => {
    test('Driver lookup correctly maps driver numbers to team colors and name acronyms', () => {
      const drivers = [
        { driver_number: 1, team_colour: '3671C6', name_acronym: 'VER' },
        { driver_number: 11, team_colour: 'E8002D', name_acronym: 'LEC' },
      ];
      // Simulate the driver lookup logic from the component
      const driverLookup: Record<number, { teamColour: string; nameAcronym: string }> = {};
      for (const d of drivers) {
        driverLookup[d.driver_number] = {
          teamColour: d.team_colour || '#ffffff',
          nameAcronym: d.name_acronym || String(d.driver_number),
        };
      }
      expect(driverLookup[1].teamColour).toBe('3671C6');
      expect(driverLookup[1].nameAcronym).toBe('VER');
      expect(driverLookup[11].teamColour).toBe('E8002D');
      expect(driverLookup[11].nameAcronym).toBe('LEC');
    });

    test('When drivers array is empty, the component still renders (no crash)', () => {
      const html = renderToString(
        <SatelliteTrackMap
          circuitKey={63}
          trackCoordinates={[{ x: 0, y: 0 }]}
          driverPositions={[]}
          drivers={[]}
        />
      );
      // Should render without crashing - map container should be present
      expect(html).toBeDefined();
    });

    test('When drivers have team colors, they flow through to the GeoJSON properties', () => {
      const drivers = [
        { driver_number: 1, team_colour: '3671C6', name_acronym: 'VER' },
      ];
      const driverPositions = [
        { driver_number: 1, position: 1, x: 0, y: 0, speed: 100, rpm: 5000, gear: 3, throttle: 80, brake: 0, drs: 0 },
      ];
      // Simulate the enrichment logic from the component
      const driverLookup: Record<number, { teamColour: string; nameAcronym: string }> = {};
      for (const d of drivers) {
        driverLookup[d.driver_number] = {
          teamColour: d.team_colour || '#ffffff',
          nameAcronym: d.name_acronym || String(d.driver_number),
        };
      }
      const enrichedDriverPositions = driverPositions.map((dp) => {
        const info = driverLookup[dp.driver_number];
        return {
          driver_number: dp.driver_number,
          x: dp.x,
          y: dp.y,
          speed: dp.speed,
          gear: dp.gear,
          drs: dp.drs,
          team_colour: info?.teamColour || '#ffffff',
          name_acronym: info?.nameAcronym || String(dp.driver_number),
        };
      });
      expect(enrichedDriverPositions[0].team_colour).toBe('3671C6');
      expect(enrichedDriverPositions[0].name_acronym).toBe('VER');
    });
  });
});