'use client';

import { Map, GeoJSONSource } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useRef, useEffect, useCallback, useMemo, useState } from 'react';
import {
  projectToLatLng,
  buildDriversGeoJSON,
  buildTrackGeoJSON,
} from '@/lib/circuit-projection';
import { getCircuitLocation } from '@/lib/circuit-lookup';
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
  onError?: () => void;
}

interface MapState {
  isLoading: boolean;
  hasError: boolean;
  errorMessage?: string;
}

function LoadingState() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-transparent rounded-xl z-20">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
        <span className="text-zinc-400 text-sm font-mono">Initializing Track Map...</span>
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-zinc-900/90 rounded-xl z-30">
      <div className="flex flex-col items-center gap-4 p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <h3 className="text-white font-bold">Map Loading Failed</h3>
          <p className="text-zinc-400 text-sm mt-1">{message}</p>
        </div>
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-medium transition-colors border border-white/10"
        >
          Retry Load
        </button>
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-transparent rounded-xl z-20">
      <div className="flex flex-col items-center gap-3 opacity-60">
        <svg className="w-10 h-10 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span className="text-zinc-500 text-sm font-mono">{message}</span>
      </div>
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
  onError,
}: SatelliteTrackMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapState, setMapState] = useState<MapState>({ isLoading: true, hasError: false });
  const onErrorRef = useRef(onError);
  useEffect(() => { onErrorRef.current = onError; }, [onError]);

  // Build driver lookup map for team color and name lookup
  const driverLookup = useMemo(() => {
    const lookup: Record<number, { teamColour: string; nameAcronym: string }> = {};
    for (const d of drivers) {
      lookup[d.driver_number] = {
        teamColour: d.team_colour ? (d.team_colour.startsWith('#') ? d.team_colour : `#${d.team_colour}`) : '#ffffff',
        nameAcronym: d.name_acronym || String(d.driver_number),
      };
    }
    return lookup;
  }, [drivers]);

  const getCircuitCenter = useCallback((): [number, number] | null => {
    if (circuitKey === 0) return null;
    const location = getCircuitLocation(circuitKey);
    if (location) return [location.lng, location.lat];
    return null;
  }, [circuitKey]);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || circuitKey === 0) return;

    const center = getCircuitCenter();
    if (!center) {
      setMapState({ 
        isLoading: false, 
        hasError: true, 
        errorMessage: `Reference coordinates not found for circuit #${circuitKey}` 
      });
      onErrorRef.current?.();
      return;
    }

    // Initialize map logic
    let mapInstance: Map | null = null;
    let tileTimeoutId: ReturnType<typeof setTimeout> | null = null;

    const initMap = () => {
      if (!mapContainerRef.current || mapRef.current || circuitKey === 0) return;

      // Check dimensions
      const width = mapContainerRef.current.clientWidth;
      const height = mapContainerRef.current.clientHeight;
      
      if (width === 0 || height === 0) {
        console.warn('[SatelliteTrackMap] Waiting for non-zero dimensions to initialize map...', { width, height });
        return;
      }

      console.log('[SatelliteTrackMap] Initializing MapLibre engine (Satellite Mode)', { width, height });
      
      try {
        mapInstance = new Map({
          container: mapContainerRef.current,
          style: {
            version: 8,
            sources: {},
            glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
            layers: [
              {
                id: 'background',
                type: 'background',
                paint: { 'background-color': 'rgba(0,0,0,0)' } // Transparent background initially
              }
            ],
          },
          center: center,
          zoom: 15,
          attributionControl: false,
          dragRotate: false,
          keyboard: false,
          interactive: true,
        });

        mapRef.current = mapInstance;

        // Use 'idle' event for full readiness (including tiles)
        mapInstance.on('idle', () => {
          if (!mapLoaded && mapInstance?.isStyleLoaded()) {
            console.log('[SatelliteTrackMap] Map idle (tiles loaded)');
            setMapLoaded(true);
            setMapState({ isLoading: false, hasError: false });
          }
        });

        mapInstance.on('load', () => {
          console.log('[SatelliteTrackMap] Map style loaded, starting tile fetch');
          
          if (!mapInstance) return;

          // Add ESRI World Imagery raster source
          mapInstance.addSource('esri-imagery', {
            type: 'raster',
            tiles: [
              'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            ],
            tileSize: 256,
            attribution: 'ESRI',
          });

          mapInstance.addLayer({
            id: 'esri-imagery-layer',
            type: 'raster',
            source: 'esri-imagery',
            paint: { 'raster-opacity': 0.8 },
          });

          // Add dark overlay
          mapInstance.addSource('dark-overlay', {
            type: 'raster',
            tiles: [
              'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
            ],
            tileSize: 256,
          });

          mapInstance.addLayer({
            id: 'dark-overlay-layer',
            type: 'raster',
            source: 'dark-overlay',
            paint: { 'raster-opacity': 0.2 },
          });

          // Force a resize check after load
          mapInstance.resize();

          // Set a shorter tile loading timeout (5s) for fallback switch
          tileTimeoutId = setTimeout(() => {
            if (!mapLoaded) {
              console.warn('[SatelliteTrackMap] Tile loading timeout (5s) — signaling fallback');
              onErrorRef.current?.();
            }
          }, 5000);
        });

        mapInstance.on('error', (e) => {
          console.error('[SatelliteTrackMap] MapLibre error:', e);
          if (!mapRef.current?.isStyleLoaded()) {
            setMapState({ isLoading: false, hasError: true, errorMessage: 'Failed to initialize map engine' });
            onErrorRef.current?.();
          }
        });
      } catch (err) {
        console.error('[SatelliteTrackMap] Map initialization failed:', err);
        setMapState({ isLoading: false, hasError: true, errorMessage: 'Map engine initialization failed' });
        onErrorRef.current?.();
      }
    };

    // Set up a resize observer to wait for dimensions if they are missing
    const resizeObserver = new ResizeObserver(() => {
      const currentMap = mapRef.current;
      if (!currentMap) {
        initMap();
      } else {
        currentMap.resize();
      }
    });

    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    // Initial attempt
    initMap();

    return () => {
      console.log('[SatelliteTrackMap] Cleaning up map instance');
      if (tileTimeoutId) clearTimeout(tileTimeoutId);
      if (mapInstance) mapInstance.remove();
      resizeObserver.disconnect();
      mapRef.current = null;
      setMapLoaded(false);
    };
  }, [circuitKey, getCircuitCenter]);

  // Update track layer
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded() || !trackCoordinates.length) return;

    const center = getCircuitCenter();
    if (!center) return;

    const trackGeoJSON = buildTrackGeoJSON(trackCoordinates, center[1], center[0]);

    if (map.getSource('circuit-track')) {
      (map.getSource('circuit-track') as GeoJSONSource).setData(trackGeoJSON as GeoJSON.Feature);
    } else {
      map.addSource('circuit-track', {
        type: 'geojson',
        data: trackGeoJSON as GeoJSON.Feature,
      });

      map.addLayer({
        id: 'track-base',
        type: 'line',
        source: 'circuit-track',
        paint: {
          'line-color': '#ffffff',
          'line-width': 3,
          'line-opacity': 0.4,
        },
      });

      map.addLayer({
        id: 'track-glow',
        type: 'line',
        source: 'circuit-track',
        paint: {
          'line-color': '#ffffff',
          'line-width': 10,
          'line-opacity': 0.1,
          'line-blur': 4,
        },
      });
    }
  }, [mapLoaded, trackCoordinates, getCircuitCenter]);

  // Update drivers layer
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const center = getCircuitCenter();
    if (!center) return;

    const enrichedPositions = driverPositions.map((dp) => {
      const info = driverLookup[dp.driver_number];
      return {
        ...dp,
        team_colour: info?.teamColour || '#ffffff',
        name_acronym: info?.nameAcronym || String(dp.driver_number),
      };
    });

    const driversGeoJSON = buildDriversGeoJSON(enrichedPositions, center[1], center[0]);

    if (map.getSource('drivers')) {
      (map.getSource('drivers') as GeoJSONSource).setData(driversGeoJSON as GeoJSON.FeatureCollection);
    } else {
      map.addSource('drivers', {
        type: 'geojson',
        data: driversGeoJSON as GeoJSON.FeatureCollection,
      });

      map.addLayer({
        id: 'driver-glow',
        type: 'circle',
        source: 'drivers',
        paint: {
          'circle-radius': 12,
          'circle-color': ['get', 'team_colour'],
          'circle-opacity': 0.3,
          'circle-blur': 0.8,
        },
      });

      map.addLayer({
        id: 'driver-dot',
        type: 'circle',
        source: 'drivers',
        paint: {
          'circle-radius': 6,
          'circle-color': ['get', 'team_colour'],
          'circle-stroke-color': '#000000',
          'circle-stroke-width': 1,
        },
      });

      map.addLayer({
        id: 'driver-labels',
        type: 'symbol',
        source: 'drivers',
        layout: {
          'text-field': ['get', 'name_acronym'],
          'text-size': 9,
          'text-offset': [0, -1.8],
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': '#000000',
          'text-halo-width': 1.5,
        },
      });
    }

    // Update selection filter
    if (map.getLayer('driver-selected')) {
       map.setFilter('driver-selected', ['==', ['get', 'driver_number'], selectedDriver ?? -1]);
    } else {
      map.addLayer({
        id: 'driver-selected',
        type: 'circle',
        source: 'drivers',
        filter: ['==', ['get', 'driver_number'], selectedDriver ?? -1],
        paint: {
          'circle-radius': 10,
          'circle-color': '#00F5FF',
          'circle-opacity': 0.4,
          'circle-stroke-color': '#00F5FF',
          'circle-stroke-width': 2,
        },
      });
    }
  }, [mapLoaded, driverPositions, selectedDriver, getCircuitCenter, driverLookup]);

  // Safety Car layer
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded() || !safetyCar || safetyCar.status === 'none') {
      if (map && map.getLayer('safety-car')) map.setLayoutProperty('safety-car', 'visibility', 'none');
      return;
    }

    const center = getCircuitCenter();
    if (!center || safetyCar.x === undefined || safetyCar.y === undefined) return;

    const [lng, lat] = projectToLatLng(safetyCar.x, safetyCar.y, center[1], center[0]);
    const geojson: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [lng, lat] },
        properties: {}
      }]
    };

    if (map.getSource('safety-car')) {
      (map.getSource('safety-car') as GeoJSONSource).setData(geojson);
      map.setLayoutProperty('safety-car', 'visibility', 'visible');
    } else {
      map.addSource('safety-car', { type: 'geojson', data: geojson });
      map.addLayer({
        id: 'safety-car',
        type: 'circle',
        source: 'safety-car',
        paint: {
          'circle-radius': 8,
          'circle-color': '#FFB300',
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 2,
        },
      });
    }
  }, [mapLoaded, safetyCar, getCircuitCenter]);

  // Resize handling
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapContainerRef.current) return;

    const resizeObserver = new ResizeObserver(() => map.resize());
    resizeObserver.observe(mapContainerRef.current);
    return () => resizeObserver.disconnect();
  }, [mapLoaded]);

  const showLoading = circuitKey === 0 || mapState.isLoading;

  return (
    <div 
      className={`relative rounded-xl overflow-hidden ${className}`}
      style={{ width, height }}
    >
      <div
        ref={mapContainerRef}
        className="absolute inset-0 z-10"
        style={{ 
          opacity: showLoading || mapState.hasError ? 0 : 1,
          transition: 'opacity 0.8s ease-in-out',
          backgroundColor: '#0a0a0a'
        }}
      />
      
      {/* 
         Note: Loading state removed from here as the 2D map will be visible behind.
         We only show an overlay if there is a fatal error or no circuit.
      */}
      
      {circuitKey === 0 && <LoadingState />}
      
      {mapState.hasError && (
        <ErrorState 
          message={mapState.errorMessage || 'An unknown error occurred'} 
          onRetry={() => window.location.reload()} 
        />
      )}
      
      {!showLoading && !mapState.hasError && !trackCoordinates.length && (
        <div className="absolute top-4 left-4 z-20">
          <div className="bg-amber-500/10 backdrop-blur-sm border border-amber-500/20 px-3 py-1.5 rounded-lg flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-[10px] font-mono text-amber-200/80 uppercase tracking-tight">Track Geometry Unavailable</span>
          </div>
        </div>
      )}
    </div>
  );
}