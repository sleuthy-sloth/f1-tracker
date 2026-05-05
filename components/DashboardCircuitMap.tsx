'use client';

import { useEffect, useState } from 'react';
import TrackMap from '@/components/TrackMap';
import { CircuitOutline } from '@/components/CircuitOutline';
import { resolveCircuitKey } from '@/lib/circuits';
import { getCached, setCache } from '@/lib/api-cache';
import { fetchDriverLocations, deriveGridOrder } from '@/lib/raceData';
import { getSessionResult, getDrivers } from '@/lib/api/openf1';
import type { TrackCoordinate } from '@/lib/types';

interface DashboardCircuitMapProps {
  /** Most recent completed session at the same circuit, used as a GPS source. */
  historicSessionKey: number | null;
  /** Plain-language circuit short name (used for the SVG fallback). */
  fallbackCircuitName: string;
  /** Square render size in px. */
  size?: number;
}

// Historic GPS data is immutable — keep it cached for a long time.
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Fetch a representative track path for a session, using whichever driver
 * has usable GPS data. Result is cached in localStorage.
 */
async function loadTrackPath(sessionKey: number): Promise<TrackCoordinate[] | null> {
  const cacheKey = `track-path-${sessionKey}`;
  const cached = getCached<TrackCoordinate[]>(cacheKey);
  if (cached?.data && cached.data.length > 0) return cached.data;

  // Resolve grid order so we try the leader first, then fall back.
  const [results, drivers] = await Promise.all([
    getSessionResult({ session_key: sessionKey }).catch(() => []),
    getDrivers({ session_key: sessionKey }).catch(() => []),
  ]);
  const ordering = deriveGridOrder(results, drivers);
  if (ordering.length === 0) return null;

  for (const dn of ordering.slice(0, 5)) {
    try {
      const locs = await fetchDriverLocations(sessionKey, dn);
      const path: TrackCoordinate[] = locs
        .filter((l) => Number.isFinite(l.x) && Number.isFinite(l.y))
        .map((l) => ({ x: l.x, y: l.y }));
      if (path.length > 0) {
        setCache(cacheKey, path, CACHE_TTL_MS);
        return path;
      }
    } catch {
      /* try next driver */
    }
  }
  return null;
}

/**
 * DashboardCircuitMap — static GPS-traced track preview for the dashboard.
 *
 * Seeds from the most recent completed session at the upcoming race's circuit
 * (passed in by the server component). Falls back to the SVG outline if no
 * GPS data is available or fetching fails.
 */
export function DashboardCircuitMap({
  historicSessionKey,
  fallbackCircuitName,
  size = 90,
}: DashboardCircuitMapProps) {
  const [coordinates, setCoordinates] = useState<TrackCoordinate[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!historicSessionKey) {
      setFailed(true);
      return;
    }

    let cancelled = false;
    loadTrackPath(historicSessionKey)
      .then((path) => {
        if (cancelled) return;
        if (path && path.length > 0) setCoordinates(path);
        else setFailed(true);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [historicSessionKey]);

  if (failed || coordinates === null) {
    // Loading skeleton or fallback. We use the SVG outline as both the
    // pre-load placeholder (it's cheap) and the failure fallback.
    return (
      <CircuitOutline
        circuitName={resolveCircuitKey(fallbackCircuitName)}
        glowColor="rgba(255,255,255,0.5)"
        size={size}
        strokeWidth={2}
      />
    );
  }

  return (
    <div style={{ width: size, height: size }}>
      <TrackMap
        trackLayout={{
          circuit_key: 0,
          circuit_name: fallbackCircuitName,
          coordinates,
        }}
        driverPositions={[]}
        drivers={[]}
        width={size}
        height={size}
      />
    </div>
  );
}

export default DashboardCircuitMap;
