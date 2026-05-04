'use client';

import { Map, GeoJSONSource } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useRef, useEffect, useCallback, useMemo, useState } from 'react';
import {
  projectToLatLng,
  buildDriversGeoJSON,
  buildTrackGeoJSON,
} from '@/lib/circuit-projection';
import { getCircuitLocation, getApproximateCircuitCenterFromTrackCoordinates } from '@/lib/circuit-lookup';
import type { Driver, DriverPosition, SafetyCarStatus } from '@/lib/types';

export interface SatelliteTrackMapProps {
  circuitKey: number;
  trackCoordinates: { x: number; y: number }[];
  driverPositions: DriverPosition[];
  drivers: Driver[];
  selectedDriver?: number;
  safetyCar?: SafetyCarStatus | null;
  className?: string;
  width?: number | string;
  height?: number | string;
}

interface MapState {
  isLoading: boolean;
  hasError: boolean;
  errorMessage?: string;
}

function LoadingState() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-zinc-900/50 rounded-xl">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
        <span className="text-zinc-400 text-sm font-mono">Loading track map...</span>
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-zinc-900/30 rounded-xl">
      <span className="text-zinc-500 text-sm font-mono">{message}</span>
    </div>
  );
}

export function SatelliteTrackMap({
  circuitKey,
  trackCoordinates,
  driverPositions,
  drivers,
  selectedDriver,
  safetyCar,
  className = '',
  width = '100%',
  height = 500,
}: SatelliteTrackMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<Map | null>(null);
  const [mapState, setMapState] = useState<MapState>({ isLoading: true, hasError: false });

  // Build driver lookup map for team color and name lookup
  const driverLookup = useMemo(() => {
    const lookup: Record<number, { teamColour: string; nameAcronym: string }> = {};
    for (const d of drivers) {
      lookup[d.driver_number] = {
        teamColour: d.team_colour || '#ffffff',
        nameAcronym: d.name_acronym || String(d.driver_number),
      };
    }
    return lookup;
  }, [drivers]);

  const [usesFallbackCenter, setUsesFallbackCenter] = useState(false);

  const getCircuitCenter = useCallback((): [number, number] => {
    if (circuitKey === 0) {
      setUsesFallbackCenter(false);
      return [0, 0];
    }

    const location = getCircuitLocation(circuitKey);
    if (location) {
      setUsesFallbackCenter(false);
      return [location.lng, location.lat];
    }

    if (trackCoordinates.length > 0) {
      const approximateCenter = getApproximateCircuitCenterFromTrackCoordinates(trackCoordinates);
      if (approximateCenter) {
        setUsesFallbackCenter(true);
        return [approximateCenter.lng, approximateCenter.lat];
      }
    }

    setUsesFallbackCenter(false);
    console.warn(`Circuit lookup: no location found for circuit_key=${circuitKey}, and no trackCoordinates available`);
    return [0, 0];
  }, [circuitKey, trackCoordinates]);

  // Initialize map - only when circuitKey is valid
  useEffect(() => {
    if (!mapContainerRef.current || circuitKey === 0) return;

    const [centerLng, centerLat] = getCircuitCenter();

    const mapInstance = new Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {},
        layers: [],
        glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
      },
      center: [centerLng, centerLat],
      zoom: 16,
      pitch: 0,
      bearing: 0,
      attributionControl: false,
      dragRotate: false,
      keyboard: false,
      interactive: false,
    });

    setMap(mapInstance);

    mapInstance.on('load', () => {
      // Add ESRI World Imagery raster source
      if (!mapInstance.getSource('esri-imagery')) {
        mapInstance.addSource('esri-imagery', {
          type: 'raster',
          tiles: [
            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          ],
          tileSize: 256,
          attribution: 'ESRI',
        });
      }

      // Add the raster layer
      if (!mapInstance.getLayer('esri-imagery-layer')) {
        mapInstance.addLayer({
          id: 'esri-imagery-layer',
          type: 'raster',
          source: 'esri-imagery',
          paint: {
            'raster-opacity': 0.85,
          },
        });
      }

      // Add dark overlay for better contrast with HUD
      if (!mapInstance.getSource('dark-overlay')) {
        mapInstance.addSource('dark-overlay', {
          type: 'raster',
          tiles: [
            'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
          ],
          tileSize: 256,
          attribution: 'ESRI',
        });
      }

      if (!mapInstance.getLayer('dark-overlay-layer')) {
        mapInstance.addLayer({
          id: 'dark-overlay-layer',
          type: 'raster',
          source: 'dark-overlay',
          paint: {
            'raster-opacity': 0.3,
          },
        });
      }

      setMapState({ isLoading: false, hasError: false });
    });

    mapInstance.on('error', (e) => {
      console.error('MapLibre error:', e);
      setMapState({ isLoading: false, hasError: true, errorMessage: 'Map failed to load' });
    });

    return () => {
      mapInstance.remove();
      setMap(null);
    };
  }, [circuitKey, getCircuitCenter]);

  // Add circuit track layer
  useEffect(() => {
    if (!map || !map.isStyleLoaded() || mapState.isLoading) return;
    if (!trackCoordinates.length) return;

    const [centerLng, centerLat] = getCircuitCenter();
    const trackGeoJSON = buildTrackGeoJSON(trackCoordinates, centerLat, centerLng);

    const existingSource = map.getSource('circuit-track') as GeoJSONSource;
    if (existingSource) {
      existingSource.setData(trackGeoJSON as GeoJSON.Feature);
    } else {
      map.addSource('circuit-track', {
        type: 'geojson',
        data: trackGeoJSON as GeoJSON.Feature,
      });

      // Track base layer
      map.addLayer({
        id: 'track-base',
        type: 'line',
        source: 'circuit-track',
        paint: {
          'line-color': 'rgba(255, 255, 255, 0.4)',
          'line-width': 3,
          'line-opacity': 0.5,
        },
      });

      // Track glow layer
      map.addLayer({
        id: 'track-glow',
        type: 'line',
        source: 'circuit-track',
        paint: {
          'line-color': 'rgba(255, 255, 255, 0.15)',
          'line-width': 8,
          'line-opacity': 0.15,
          'line-blur': 3,
        },
      });
    }
  }, [map, mapState.isLoading, trackCoordinates, getCircuitCenter]);

  // Add/update driver layers
  useEffect(() => {
    if (!map || !map.isStyleLoaded() || mapState.isLoading) return;

    const [centerLng, centerLat] = getCircuitCenter();
    // Enrich driver positions with team color and name acronym before building GeoJSON
    const enrichedDriverPositions = driverPositions.map((dp) => {
      const info = driverLookup[dp.driver_number];
      return {
        driver_number: dp.driver_number,
        x: dp.x,
        y: dp.y,
        speed: dp.speed,
        gear: dp.gear,
        drs: dp.drs,
        // Extra properties that buildDriversGeoJSON passes through to GeoJSON
        team_colour: info?.teamColour || '#ffffff',
        name_acronym: info?.nameAcronym || String(dp.driver_number),
      };
    });
    const driversGeoJSON = buildDriversGeoJSON(enrichedDriverPositions, centerLat, centerLng);

    const existingSource = map.getSource('drivers') as GeoJSONSource;
    if (existingSource) {
      existingSource.setData(driversGeoJSON as GeoJSON.FeatureCollection);
    } else {
      map.addSource('drivers', {
        type: 'geojson',
        data: driversGeoJSON as GeoJSON.FeatureCollection,
      });

      // Driver glow layer (behind)
      map.addLayer({
        id: 'driver-glow',
        type: 'circle',
        source: 'drivers',
        paint: {
          'circle-radius': 8,
          'circle-color': ['get', 'team_colour'],
          'circle-opacity': 0.3,
          'circle-blur': 1,
        },
      });

      // Driver dot layer
      map.addLayer({
        id: 'driver-dot',
        type: 'circle',
        source: 'drivers',
        paint: {
          'circle-radius': 5,
          'circle-color': ['get', 'team_colour'],
          'circle-stroke-color': ['get', 'team_colour'],
          'circle-stroke-width': 1.5,
        },
      });

      // Selected driver highlight layer
      map.addLayer({
        id: 'driver-selected',
        type: 'circle',
        source: 'drivers',
        filter: ['==', ['get', 'driver_number'], selectedDriver ?? -1],
        paint: {
          'circle-radius': 8,
          'circle-color': '#FFD700',
          'circle-opacity': 0.6,
          'circle-stroke-color': '#FFD700',
          'circle-stroke-width': 2,
        },
      });

      // Driver number label
      map.addLayer({
        id: 'driver-number',
        type: 'symbol',
        source: 'drivers',
        layout: {
          'text-field': ['get', 'name_acronym'],
          'text-size': 8,
          'text-offset': [0, -1.5],
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': '#000000',
          'text-halo-width': 1,
        },
      });
    }
  }, [map, mapState.isLoading, driverPositions, selectedDriver, getCircuitCenter, driverLookup]);

  // Update selected driver filter
  useEffect(() => {
    if (!map || !map.getLayer('driver-selected')) return;

    map.setFilter('driver-selected', [
      '==',
      ['get', 'driver_number'],
      selectedDriver ?? -1,
    ]);
  }, [map, selectedDriver]);

  // Safety car layer
  useEffect(() => {
    if (!map || !map.isStyleLoaded() || mapState.isLoading) return;

    // Remove existing safety car layer
    if (map.getLayer('safety-car')) {
      map.removeLayer('safety-car');
    }
    if (map.getSource('safety-car')) {
      map.removeSource('safety-car');
    }

    if (!safetyCar || safetyCar.status === 'none' || safetyCar.x === undefined || safetyCar.y === undefined) {
      return;
    }

    const [centerLng, centerLat] = getCircuitCenter();
    const [lng, lat] = projectToLatLng(safetyCar.x, safetyCar.y, centerLat, centerLng);

    map.addSource('safety-car', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [lng, lat],
            },
            properties: {},
          },
        ],
      },
    });

    map.addLayer({
      id: 'safety-car',
      type: 'circle',
      source: 'safety-car',
      paint: {
        'circle-radius': 7,
        'circle-color': '#FFB300',
        'circle-stroke-color': '#FFB300',
        'circle-stroke-width': 2,
      },
    });
  }, [map, mapState.isLoading, safetyCar, getCircuitCenter]);

  // Resize observer
  useEffect(() => {
    if (!map || !mapContainerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      map.resize();
    });

    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [map]);

  const showLoading = circuitKey === 0 || mapState.isLoading;
  const showEmpty = !showLoading && !trackCoordinates.length;

  return (
    <div
      className={`relative rounded-xl overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {/* Map container is always mounted so the ref is available for initialization */}
      <div
        ref={mapContainerRef}
        className="absolute inset-0 cursor-default"
        style={{ visibility: showLoading || showEmpty ? 'hidden' : 'visible' }}
      />
      {showLoading && (
        <div className="absolute inset-0">
          <LoadingState />
        </div>
      )}
      {showEmpty && (
        <div className="absolute inset-0">
          <EmptyState message="Track layout unavailable for this circuit" />
        </div>
      )}
      {usesFallbackCenter && !showLoading && !showEmpty && (
        <div className="absolute top-3 left-3 rounded-md bg-amber-500/20 border border-amber-300/30 px-2 py-1">
          <span className="text-[11px] text-amber-100 font-mono">Approximate map center</span>
        </div>
      )}
    </div>
  );
}