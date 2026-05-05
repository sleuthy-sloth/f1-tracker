'use client';

import { useEffect, useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  fetchSessionMetadata,
  fetchDriverLocations,
  fetchDriverCarData,
  deriveGridOrder,
} from '@/lib/raceData';
import { buildScriptedFrames } from '@/lib/scriptedReplay';
import { getSessions, getLaps } from '@/lib/api/openf1';
import type {
  Session,
  TrackCoordinate,
  Driver,
  StintData,
  SafetyCarStatus,
  LapData,
} from '@/lib/types';
import { useReplayEngine } from '@/hooks/useReplayEngine';
import { FrameBuffer } from '@/lib/frameBuffer';
import TrackMap from '@/components/TrackMap';
import TelemetryHUD from '@/components/TelemetryHUD';
import Leaderboard from '@/components/Leaderboard';
import GapChart from '@/components/GapChart';
import LapTimeDisplay from '@/components/LapTimeDisplay';
import TyreWidget from '@/components/TyreWidget';
import WeatherRadar from '@/components/WeatherRadar';
import RaceControlFeed from '@/components/RaceControlFeed';
import PitStopIndicator from '@/components/PitStopIndicator';
import SafetyCar from '@/components/SafetyCar';
import PitWindowWidget from '@/components/PitWindowWidget';
import TimelineControls from '@/components/TimelineControls';
import { MapErrorBoundary } from '@/components/MapErrorBoundary';
import { Card } from '@/components/ui/Card';
import CircuitPoster from '@/components/CircuitPoster';

// Loading states
const LoadingState = () => (
  <div className="flex flex-col items-center justify-center p-12 bg-black/20 backdrop-blur-md rounded-2xl border border-white/10">
    <div className="w-12 h-12 border-4 border-f1-red/30 border-t-f1-red rounded-full animate-spin mb-6" />
    <h2 className="text-f1-white font-heading font-bold text-xl mb-2">INITIALIZING STRATEGY LAB</h2>
    <p className="text-f1-silver font-mono text-sm animate-pulse">Synchronizing telemetry streams...</p>
  </div>
);

// Dynamic import for MapLibre component
const SatelliteTrackMap = dynamic<{
  circuitKey: number;
  trackCoordinates: TrackCoordinate[];
  driverPositions: any[];
  drivers: Driver[];
  selectedDriver?: number;
  safetyCar?: SafetyCarStatus | null;
  onError?: () => void;
}>(
  () => import('@/components/SatelliteTrackMap').then(mod => ({ default: mod.SatelliteTrackMap })),
  { 
    ssr: false,
    loading: () => <div className="absolute inset-0 bg-black/40 animate-pulse" />
  }
);

/**
 * Strategy Lab Content component
 */
function StrategyLabContent() {
  const searchParams = useSearchParams();
  const sessionKeyStr = searchParams.get('session') || searchParams.get('session_key');
  const sessionKey = parseInt(sessionKeyStr || '0', 10);
  const circuitKeyParam = parseInt(searchParams.get('circuit_key') || '0', 10);

  const [sessionInfo, setSessionInfo] = useState<Session | null>(null);
  const [trackCoordinates, setTrackCoordinates] = useState<TrackCoordinate[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [stints, setStints] = useState<StintData[]>([]);
  const [frameBuffer, setFrameBuffer] = useState<FrameBuffer>(new FrameBuffer());

  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');
  const [mapError, setMapError] = useState(false);
  const [selectedDriverNumber, setSelectedDriverNumber] = useState<number | null>(null);
  const [totalRaceLaps, setTotalRaceLaps] = useState<number>(0);

  // Tracks which driver_numbers have real GPS positions loaded (T4 streaming).
  // Unloaded drivers are hidden from the TrackMap to avoid showing scripted
  // positions that would appear to move at incorrect speeds.
  const [loadedDriverNumbers, setLoadedDriverNumbers] = useState<Set<number>>(new Set());

  // Mobile tab state: MAP | STANDINGS | STRATEGY — toggles which panel is visible
  // below the map on small screens.
  const [mobileTab, setMobileTab] = useState<'map' | 'standings' | 'strategy'>('map');

  // Resolve circuit key: URL parameter wins, then session metadata once it loads.
  const circuitKey = circuitKeyParam || sessionInfo?.circuit_key || 0;

  // Replay engine instance
  const engine = useReplayEngine({ frameBuffer });

  // Tracks which driver_numbers have already had car-telemetry fetched (T5).
  const [carDataLoaded, setCarDataLoaded] = useState<Set<number>>(new Set());

  // Tiered Load: T1 metadata → T2 seed driver location → T3 scripted frames
  // → T4 background-stream remaining drivers' locations.  T5 (car telemetry)
  // happens in a separate effect when the user selects a driver.
  useEffect(() => {
    if (!sessionKey) return;

    let cancelled = false;
    let buffer: FrameBuffer | null = null;

    async function loadData() {
      try {
        setIsLoading(true);
        setIsProcessing(true);
        setProcessingMessage('Fetching session info...');

        // ── T1: session info + lightweight metadata in parallel ──────────
        const [sessions, meta] = await Promise.all([
          getSessions({ session_key: sessionKey }),
          fetchSessionMetadata(sessionKey),
        ]);
        if (cancelled) return;

        const session = sessions[0] || null;
        setSessionInfo(session);
        setStints(meta.stints);
        setDrivers(meta.drivers);

        if (meta.drivers.length === 0) {
          setIsLoading(false);
          setIsProcessing(false);
          return;
        }

        // ── T2: pick a seed driver and fetch their location ──────────────
        const gridOrder = deriveGridOrder(meta.sessionResult, meta.drivers);

        // ── T2b: fetch the race leader's lap data for accurate lap counts ──
        let leaderLaps: LapData[] = [];
        let raceLeaderLaps = 0;
        const raceLeader = meta.sessionResult
          .filter((r) => r.position === 1)
          .sort((a, b) => a.driver_number - b.driver_number)[0];
        if (raceLeader) {
          raceLeaderLaps = raceLeader.number_of_laps || 0;
          try {
            leaderLaps = await getLaps({ session_key: sessionKey, driver_number: raceLeader.driver_number });
          } catch {
            /* non-fatal; scripted frames use time-based fallback */
          }
        }

        let seedLocations: Awaited<ReturnType<typeof fetchDriverLocations>> = [];
        let seedDriver: number | null = null;

        setProcessingMessage('Tracing circuit...');
        for (const candidate of gridOrder.slice(0, 3)) {
          try {
            const locs = await fetchDriverLocations(sessionKey, candidate);
            if (cancelled) return;
            if (locs.length > 0) {
              seedLocations = locs;
              seedDriver = candidate;
              break;
            }
          } catch {
            /* try next candidate */
          }
        }

        if (!seedDriver || seedLocations.length === 0) {
          // No driver data at all — bail out cleanly.
          setIsLoading(false);
          setIsProcessing(false);
          return;
        }

        // ── T3: build scripted frames so the UI is interactive immediately ──
        const trackPath = seedLocations
          .filter((l) => Number.isFinite(l.x) && Number.isFinite(l.y))
          .map((l) => ({ x: l.x, y: l.y }));

        setTrackCoordinates(trackPath);

        const seedTimestamps = seedLocations.map((l) => new Date(l.date).getTime());
        const startTs = Math.min(...seedTimestamps);
        const endTs = Math.max(...seedTimestamps);

        const scriptedFrames = buildScriptedFrames({
          trackPath,
          drivers: meta.drivers,
          gridOrder,
          startTimestamp: startTs,
          endTimestamp: endTs,
          frameIntervalMs: 200,
          lapData: leaderLaps,
          totalRaceLaps: raceLeaderLaps,
          weather: meta.weather,
          raceControl: meta.raceControl,
        });

        buffer = new FrameBuffer(scriptedFrames);
        if (raceLeaderLaps > 0) setTotalRaceLaps(raceLeaderLaps);
        // Seed driver: replace scripted positions with real positions immediately.
        buffer.replaceDriverLocations(seedDriver, seedLocations);
        setLoadedDriverNumbers(new Set([seedDriver]));
        setFrameBuffer(buffer);

        // UI is now interactive. Drop the loading screen.
        setIsLoading(false);
        setProcessingMessage('Streaming driver positions…');

        // ── T4: background-stream remaining drivers' locations ──────────
        const remaining = gridOrder.filter((dn) => dn !== seedDriver);
        const CHUNK_SIZE = 3;
        // Accumulator for batch-updating loadedDriverNumbers — one state set
        // per chunk instead of per-driver to avoid cascading re-renders.
        const totalLoaded = new Set([seedDriver]);
        for (let i = 0; i < remaining.length; i += CHUNK_SIZE) {
          if (cancelled) return;
          const chunk = remaining.slice(i, i + CHUNK_SIZE);
          await Promise.all(
            chunk.map(async (dn) => {
              try {
                const locs = await fetchDriverLocations(sessionKey, dn);
                if (cancelled || !buffer) return;
                if (locs.length > 0) {
                  buffer.replaceDriverLocations(dn, locs);
                  totalLoaded.add(dn);
                }
              } catch {
                /* silently skip drivers whose data fails */
              }
            })
          );
          // Batch state update — one re-render per chunk.
          setLoadedDriverNumbers(new Set(totalLoaded));
          if (!cancelled) {
            const done = Math.min(i + CHUNK_SIZE, remaining.length);
            setProcessingMessage(`Synchronizing drivers ${done}/${remaining.length}…`);
          }
        }
      } catch (error) {
        console.error('Failed to load strategy lab data:', error);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          setIsProcessing(false);
          setProcessingMessage('');
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [sessionKey]);

  // ── T5: lazy-load car telemetry for the selected driver only ──────────
  useEffect(() => {
    if (selectedDriverNumber === null) return;
    if (!sessionKey) return;
    if (carDataLoaded.has(selectedDriverNumber)) return;

    let cancelled = false;
    const driver = selectedDriverNumber;

    fetchDriverCarData(sessionKey, driver)
      .then((carData) => {
        if (cancelled) return;
        if (carData.length > 0) {
          frameBuffer.replaceDriverCarData(driver, carData);
        }
        setCarDataLoaded((prev) => {
          const next = new Set(prev);
          next.add(driver);
          return next;
        });
      })
      .catch(() => {
        /* non-fatal; HUD just shows zeros */
      });

    return () => {
      cancelled = true;
    };
  }, [selectedDriverNumber, sessionKey, frameBuffer, carDataLoaded]);

  const handleSelectDriver = (driverNumber: number) => {
    setSelectedDriverNumber(driverNumber === selectedDriverNumber ? null : driverNumber);
  };

  // Compute visible driver positions: only show drivers whose real GPS data
  // has been loaded. Unloaded drivers' scripted positions are hidden to
  // prevent the "insane speeds" visual artifact during progressive streaming.
  const visibleDriverPositions = useMemo(() => {
    return engine.currentFrame?.driver_positions?.filter(
      (dp) => loadedDriverNumbers.has(dp.driver_number)
    ) || [];
  }, [engine.currentFrame?.driver_positions, loadedDriverNumbers]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-f1-carbon flex flex-col">
        <header className="h-16 bg-surface border-b border-white/[0.07] flex items-center px-6">
          <h1 className="text-lg font-heading font-bold text-f1-white tracking-wider">STRATEGY LAB</h1>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <LoadingState />
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-f1-carbon overflow-hidden">
      {/* Header */}
      <header className="h-16 flex-shrink-0 bg-surface border-b border-white/[0.07] flex items-center justify-between px-6 z-40">
        <div className="flex items-center gap-4">
          <Link
            href="/archive"
            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-f1-silver hover:text-f1-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="h-8 w-px bg-white/10" />
          <div>
            <h1 className="text-lg font-heading font-bold text-f1-white tracking-wider flex items-center gap-2">
              <span className="text-f1-red">STRATEGY</span> LAB
            </h1>
            <p className="text-[10px] text-f1-silver font-mono uppercase tracking-tighter">
              {sessionInfo?.session_name || 'Session'} • {sessionInfo?.year}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-3">
            <Card variant="glass" padding="sm" className="py-1 px-3">
              <div className="text-[9px] uppercase tracking-wider text-f1-silver">Drivers</div>
              <div className="text-sm font-heading font-bold text-f1-white leading-tight">{drivers.length}</div>
            </Card>
          </div>

          {isProcessing && (
            <div className="flex items-center gap-3 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
              <div className="flex gap-1">
                <div className="w-1 h-1 bg-f1-red rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1 h-1 bg-f1-red rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1 h-1 bg-f1-red rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-[10px] font-mono text-f1-silver uppercase tracking-tight">{processingMessage}</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Dashboard Grid */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Left Sidebar: Leaderboard — hidden on mobile (shown via tab) */}
        <div className="hidden lg:flex w-full lg:w-[320px] bg-black/40 backdrop-blur-md border-r border-white/10 flex-col overflow-hidden order-2 lg:order-1">
          <div className="p-4 border-b border-white/10">
            <h2 className="text-f1-white font-heading font-bold uppercase tracking-wider text-sm flex items-center gap-2">
              <span className="w-2 h-2 bg-f1-red rounded-full animate-pulse" />
              Live Standings
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <Leaderboard 
              currentFrame={engine.currentFrame} 
              drivers={drivers}
              selectedDriverNumber={selectedDriverNumber}
              onSelectDriver={handleSelectDriver}
            />
          </div>
        </div>

        {/* Center Column: Main Map */}
        <div className="flex-1 relative min-h-[40vh] lg:min-h-0 order-1 lg:order-2 overflow-hidden">
          {/* Circuit Poster Background Layer */}
          <CircuitPoster circuitKey={circuitKey} opacity={0.6} />

          {/* Base 2D Map */}
          <div className="absolute inset-0 z-0">
            <TrackMap
              trackLayout={{
                circuit_key: circuitKey,
                circuit_name: sessionInfo?.circuit_short_name || 'Circuit',
                coordinates: trackCoordinates
              }}
              driverPositions={visibleDriverPositions}
              drivers={drivers}
              selectedDriver={selectedDriverNumber || undefined}
              safetyCar={engine.currentFrame?.safety_car || undefined}
            />
          </div>

          {/* High-Fidelity Satellite Layer */}
          {!mapError && circuitKey > 0 && (
            <div className="absolute inset-0 z-10 pointer-events-auto">
              <MapErrorBoundary fallback={<div className="absolute inset-0 bg-black/20 flex items-center justify-center text-f1-silver text-xs">Satellite Map Unavailable</div>}>
                <SatelliteTrackMap
                  circuitKey={circuitKey}
                  trackCoordinates={trackCoordinates}
                  driverPositions={visibleDriverPositions}
                  drivers={drivers}
                  selectedDriver={selectedDriverNumber || undefined}
                  safetyCar={engine.currentFrame?.safety_car || undefined}
                  onError={() => setMapError(true)}
                />
              </MapErrorBoundary>
            </div>
          )}

          {/* Streaming progress badge */}
          {loadedDriverNumbers.size > 0 && loadedDriverNumbers.size < drivers.length && (
            <div className="absolute top-6 right-6 z-30 pointer-events-none">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-full border border-white/10">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-f1-red rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-f1-red rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-f1-red rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-[10px] font-mono text-f1-silver uppercase tracking-tight whitespace-nowrap">
                  SYNC {loadedDriverNumbers.size}/{drivers.length}
                </span>
              </div>
            </div>
          )}

          {/* Tactical Overlay — hidden when no driver selected */}
          <div className="absolute top-6 left-6 z-30 pointer-events-none">
            <TelemetryHUD
              currentFrame={engine.currentFrame}
              drivers={drivers}
              selectedDriverNumber={selectedDriverNumber}
              onClose={() => setSelectedDriverNumber(null)}
            />
          </div>
        </div>

        {/* Right Sidebar: Strategy Hub — hidden on mobile (shown via tab) */}
        <div className="hidden lg:flex w-full lg:w-[360px] xl:w-[400px] bg-black/40 backdrop-blur-md border-l border-white/10 flex-col overflow-hidden order-3">
          <div className="p-4 border-b border-white/10">
            <h2 className="text-f1-white font-heading font-bold uppercase tracking-wider text-sm flex items-center gap-2">
              <svg className="w-4 h-4 text-f1-cyan" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z" />
              </svg>
              Strategy Hub
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
            <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
              <div className="px-4 py-2 border-b border-white/10 bg-white/5">
                <h3 className="text-[10px] font-bold text-f1-silver uppercase tracking-widest">Interval Analysis</h3>
              </div>
              <div className="p-2">
                <GapChart
                  currentFrame={engine.currentFrame}
                  drivers={drivers}
                  selectedDriverNumbers={selectedDriverNumber ? [selectedDriverNumber] : []}
                />
              </div>
            </div>

            <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
              <div className="px-4 py-2 border-b border-white/10 bg-white/5">
                <h3 className="text-[10px] font-bold text-f1-silver uppercase tracking-widest">Race Progress</h3>
              </div>
              <div className="p-2">
                <LapTimeDisplay
                  currentFrame={engine.currentFrame}
                  totalLaps={totalRaceLaps}
                  sessionStartTimestamp={engine.timeRange?.start || null}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <TyreWidget 
                drivers={drivers}
                stints={stints} 
                currentLap={engine.currentFrame?.lap || 1}
                selectedDriverNumber={selectedDriverNumber}
                onSelectDriver={handleSelectDriver}
              />
              <div className="grid grid-cols-2 gap-4">
                <WeatherRadar currentFrame={engine.currentFrame} />
                <SafetyCar currentFrame={engine.currentFrame} />
              </div>
            </div>

            <div className="space-y-4">
              <RaceControlFeed currentFrame={engine.currentFrame} />
              <div className="grid grid-cols-1 gap-4">
                <PitStopIndicator
                  drivers={drivers}
                  pitStops={[]}
                  stints={stints}
                  currentLap={engine.currentFrame?.lap || 1}
                />
              </div>
              <PitWindowWidget
                drivers={drivers}
                stints={stints}
                currentLap={engine.currentFrame?.lap || 1}
                totalLaps={totalRaceLaps}
                selectedDriverNumber={selectedDriverNumber}
              />
            </div>
          </div>
        </div>

        {/* Mobile tab panel — shown below map on mobile when standings or strategy tab is active */}
        {mobileTab !== 'map' && (
          <div className="lg:hidden border-t border-white/10 bg-black/60 backdrop-blur-md max-h-[45vh] overflow-y-auto order-2">
            {mobileTab === 'standings' && (
              <div className="p-4">
                <Leaderboard 
                  currentFrame={engine.currentFrame} 
                  drivers={drivers}
                  selectedDriverNumber={selectedDriverNumber}
                  onSelectDriver={handleSelectDriver}
                />
              </div>
            )}
            {mobileTab === 'strategy' && (
              <div className="p-4 space-y-4">
                <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                  <div className="px-4 py-2 border-b border-white/10 bg-white/5">
                    <h3 className="text-[10px] font-bold text-f1-silver uppercase tracking-widest">Interval Analysis</h3>
                  </div>
                  <div className="p-2">
                    <GapChart
                      currentFrame={engine.currentFrame}
                      drivers={drivers}
                      selectedDriverNumbers={selectedDriverNumber ? [selectedDriverNumber] : []}
                    />
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                  <div className="px-4 py-2 border-b border-white/10 bg-white/5">
                    <h3 className="text-[10px] font-bold text-f1-silver uppercase tracking-widest">Race Progress</h3>
                  </div>
                  <div className="p-2">
                    <LapTimeDisplay
                      currentFrame={engine.currentFrame}
                      totalLaps={totalRaceLaps}
                      sessionStartTimestamp={engine.timeRange?.start || null}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <TyreWidget 
                    drivers={drivers}
                    stints={stints} 
                    currentLap={engine.currentFrame?.lap || 1}
                    selectedDriverNumber={selectedDriverNumber}
                    onSelectDriver={handleSelectDriver}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <WeatherRadar currentFrame={engine.currentFrame} />
                    <SafetyCar currentFrame={engine.currentFrame} />
                  </div>
                </div>

                <div className="space-y-4">
                  <RaceControlFeed currentFrame={engine.currentFrame} />
                  <div className="grid grid-cols-1 gap-4">
                    <PitStopIndicator
                      drivers={drivers}
                      pitStops={[]}
                      stints={stints}
                      currentLap={engine.currentFrame?.lap || 1}
                    />
                  </div>
                  <PitWindowWidget
                    drivers={drivers}
                    stints={stints}
                    currentLap={engine.currentFrame?.lap || 1}
                    totalLaps={totalRaceLaps}
                    selectedDriverNumber={selectedDriverNumber}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile Tab Bar — only visible on small screens */}
      <div className="block lg:hidden flex-shrink-0 border-t border-white/10 bg-surface">
        <div className="flex h-11">
          {(['map', 'standings', 'strategy'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setMobileTab(tab)}
              className={`flex-1 flex items-center justify-center text-[10px] font-bold uppercase tracking-widest transition-colors ${
                mobileTab === tab
                  ? 'text-f1-white bg-white/5 border-t-2 border-f1-red'
                  : 'text-f1-silver hover:text-f1-white hover:bg-white/5'
              }`}
            >
              {tab === 'map' ? 'Map' : tab === 'standings' ? 'Standings' : 'Strategy'}
            </button>
          ))}
        </div>
      </div>
      
      {/* Timeline Controls */}
      <TimelineControls
        engine={engine}
        safetyCarEvents={[]}
        flagEvents={[]}
      />
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(225, 6, 0, 0.5);
        }
      `}</style>
    </div>
  );
}

/**
 * Main Strategy Lab page component with Suspense boundary
 */
export default function StrategyLabPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-f1-carbon flex flex-col">
        <header className="h-16 bg-surface border-b border-white/[0.07] flex items-center px-6">
          <h1 className="text-lg font-heading font-bold text-f1-white tracking-wider">STRATEGY LAB</h1>
        </header>
        <main className="flex-1 flex items-center justify-center p-8">
          <LoadingState />
        </main>
      </div>
    }>
      <StrategyLabContent />
    </Suspense>
  );
}