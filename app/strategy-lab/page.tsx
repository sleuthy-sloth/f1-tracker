'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { fetchRaceData } from '@/lib/raceData';
import { getSessions, getStints } from '@/lib/api/openf1';
import type {
  Session,
  TrackCoordinate,
  Driver,
  StintData,
  SafetyCarStatus,
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

  // Resolve circuit key: URL parameter wins, then session metadata once it loads.
  const circuitKey = circuitKeyParam || sessionInfo?.circuit_key || 0;

  // Replay engine instance
  const engine = useReplayEngine({ frameBuffer });

  // Load session metadata and frames
  useEffect(() => {
    if (!sessionKey) return;

    let cancelled = false;

    async function loadData() {
      try {
        setIsLoading(true);
        setIsProcessing(true);
        setProcessingMessage('Fetching session info...');

        // 1. Fetch session info + stints in parallel; race-control comes from
        // fetchRaceData, so we don't redundantly request it here.
        const [sessions, stintsData] = await Promise.all([
          getSessions({ session_key: sessionKey }),
          getStints({ session_key: sessionKey }).catch(() => [] as StintData[]),
        ]);
        if (cancelled) return;

        const session = sessions[0] || null;
        setSessionInfo(session);
        setStints(stintsData);

        // 2. Fetch Full Race Data (Telemetry + GPS) with progress tracking
        setProcessingMessage('Synchronizing telemetry streams...');
        const result = await fetchRaceData({
          sessionKey,
          onProgress: (msg) => {
            if (!cancelled) setProcessingMessage(msg);
          },
        });
        if (cancelled) return;

        setDrivers(result.drivers);
        setFrameBuffer(result.frameBuffer);

        // 3. Build Track Layout from synchronized data using the first driver's
        // location stream as a representative trace of the circuit.
        if (result.frameBuffer.length > 0) {
          const allFrames = result.frameBuffer.getAll();
          const firstDriver = result.drivers[0]?.driver_number;
          if (firstDriver) {
            const trackPoints = allFrames
              .map((frame) => frame.driver_positions.find((dp) => dp.driver_number === firstDriver))
              .filter(Boolean)
              .map((dp) => ({ x: dp!.x, y: dp!.y }));

            if (trackPoints.length > 0) {
              setTrackCoordinates(trackPoints);
            }
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

  const handleSelectDriver = (driverNumber: number) => {
    setSelectedDriverNumber(driverNumber === selectedDriverNumber ? null : driverNumber);
  };

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
            <Card variant="glass" padding="sm" className="py-1 px-3">
              <div className="text-[9px] uppercase tracking-wider text-f1-silver">Frames</div>
              <div className="text-sm font-heading font-bold text-f1-white leading-tight">{engine.totalFrames}</div>
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
        {/* Left Sidebar: Leaderboard */}
        <div className="w-full lg:w-[320px] bg-black/40 backdrop-blur-md border-r border-white/10 flex flex-col overflow-hidden order-2 lg:order-1">
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
        <div className="flex-1 relative min-h-[40vh] lg:min-h-0 order-1 lg:order-2 border-b lg:border-b-0 border-white/10 overflow-hidden">
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
              driverPositions={engine.currentFrame?.driver_positions || []}
              drivers={drivers}
              selectedDriver={selectedDriverNumber || undefined}
              safetyCar={engine.currentFrame?.safety_car || undefined}
            />
          </div>

          {/* High-Fidelity Satellite Layer — only when we have a known circuit */}
          {!mapError && circuitKey > 0 && (
            <div className="absolute inset-0 z-10 pointer-events-auto">
              <MapErrorBoundary fallback={<div className="absolute inset-0 bg-black/20 flex items-center justify-center text-f1-silver text-xs">Satellite Map Unavailable</div>}>
                <SatelliteTrackMap
                  circuitKey={circuitKey}
                  trackCoordinates={trackCoordinates}
                  driverPositions={engine.currentFrame?.driver_positions || []}
                  drivers={drivers}
                  selectedDriver={selectedDriverNumber || undefined}
                  safetyCar={engine.currentFrame?.safety_car || undefined}
                  onError={() => setMapError(true)}
                />
              </MapErrorBoundary>
            </div>
          )}

          {/* Tactical Overlay */}
          <div className="absolute top-6 left-6 z-30 pointer-events-none">
            <TelemetryHUD
              currentFrame={engine.currentFrame}
              drivers={drivers}
              selectedDriverNumber={selectedDriverNumber}
            />
          </div>
        </div>

        {/* Right Sidebar: Strategy Hub */}
        <div className="w-full lg:w-[360px] xl:w-[400px] bg-black/40 backdrop-blur-md border-l border-white/10 flex flex-col overflow-hidden order-3">
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
                  totalLaps={50}
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
                totalLaps={50}
                selectedDriverNumber={selectedDriverNumber}
              />
            </div>
          </div>
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