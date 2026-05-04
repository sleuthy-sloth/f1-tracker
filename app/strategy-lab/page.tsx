'use client';

import { useEffect, useState, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { 
  fetchSessionInfo, 
  fetchTrackCoordinates, 
  fetchDrivers, 
  fetchStints, 
  fetchPitStops, 
  fetchSafetyCarEvents, 
  fetchFlagEvents 
} from '@/lib/raceData';
import type { 
  SessionInfo, 
  TrackCoordinates, 
  Driver, 
  StintData, 
  PitStopEvent, 
  SafetyCarEvent, 
  FlagEvent 
} from '@/lib/types';
import { useReplayEngine } from '@/hooks/useReplayEngine';
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
import MapErrorBoundary from '@/components/MapErrorBoundary';
import Card from '@/components/ui/Card';
import CircuitPoster from '@/components/CircuitPoster';

// Loading states
const LoadingState = () => (
  <div className="flex flex-col items-center justify-center p-12 bg-black/20 backdrop-blur-md rounded-2xl border border-white/10">
    <div className="w-12 h-12 border-4 border-f1-red/30 border-t-f1-red rounded-full animate-spin mb-6" />
    <h2 className="text-f1-white font-heading font-bold text-xl mb-2">INITIALIZING STRATEGY LAB</h2>
    <p className="text-f1-silver font-mono text-sm animate-pulse">Synchronizing telemetry streams...</p>
  </div>
);

const ErrorState = ({ message, onRetry }: { message: string, onRetry: () => void }) => (
  <div className="flex flex-col items-center justify-center p-12 bg-red-950/20 backdrop-blur-md rounded-2xl border border-red-500/20">
    <div className="w-16 h-16 text-f1-red mb-6">
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    </div>
    <h2 className="text-f1-white font-heading font-bold text-xl mb-2">TELEMETRY ERROR</h2>
    <p className="text-red-200/60 font-mono text-sm mb-8 max-w-md text-center">{message}</p>
    <button 
      onClick={onRetry}
      className="px-6 py-2 bg-f1-red hover:bg-red-700 text-white font-bold rounded-lg transition-colors"
    >
      RETRY CONNECTION
    </button>
  </div>
);

// Dynamic import for MapLibre component
const SatelliteTrackMap = dynamic(
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
  const sessionKey = searchParams.get('session_key');
  const circuitKey = parseInt(searchParams.get('circuit_key') || '0', 10);

  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [trackCoordinates, setTrackCoordinates] = useState<TrackCoordinates[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [stints, setStints] = useState<StintData[]>([]);
  const [pitStops, setPitStops] = useState<PitStopEvent[]>([]);
  const [safetyCarEvents, setSafetyCarEvents] = useState<SafetyCarEvent[]>([]);
  const [flagEvents, setFlagEvents] = useState<FlagEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');
  const [mapError, setMapError] = useState(false);
  const [selectedDriverNumber, setSelectedDriverNumber] = useState<number | null>(null);

  // Replay engine instance
  const engine = useReplayEngine();

  // Load session metadata and coordinates
  useEffect(() => {
    if (!sessionKey || isNaN(circuitKey)) return;

    async function loadMetadata() {
      try {
        setIsLoading(true);
        const [sessionData, coordsData, driversData, stintsData, pitStopsData, scData, flagsData] = await Promise.all([
          fetchSessionInfo(sessionKey!),
          fetchTrackCoordinates(circuitKey),
          fetchDrivers(sessionKey!),
          fetchStints(sessionKey!),
          fetchPitStops(sessionKey!),
          fetchSafetyCarEvents(sessionKey!),
          fetchFlagEvents(sessionKey!)
        ]);

        setSessionInfo(sessionData);
        setTrackCoordinates(coordsData);
        setDrivers(driversData);
        setStints(stintsData);
        setPitStops(pitStopsData);
        setSafetyCarEvents(scData);
        setFlagEvents(flagsData);
        
        // Start replay engine once metadata is ready
        engine.init(sessionKey!, sessionData.totalLaps);
      } catch (error) {
        console.error('Failed to load strategy lab data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadMetadata();
  }, [sessionKey, circuitKey, engine]);

  // Handle engine events
  useEffect(() => {
    const unsubProcessing = engine.on('processing', (msg) => {
      setIsProcessing(true);
      setProcessingMessage(msg);
    });
    const unsubReady = engine.on('ready', () => {
      setIsProcessing(false);
      setProcessingMessage('');
    });

    return () => {
      unsubProcessing();
      unsubReady();
    };
  }, [engine]);

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
              {sessionInfo?.sessionName || 'Session'} • {sessionInfo?.year}
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
                <div className="w-1 h-3 bg-f1-red animate-pulse" />
                <div className="w-1 h-3 bg-f1-red animate-pulse delay-75" />
                <div className="w-1 h-3 bg-f1-red animate-pulse delay-150" />
              </div>
              <span className="text-[10px] font-mono text-f1-white/80 uppercase">
                {processingMessage || 'Buffering'}
              </span>
            </div>
          )}
        </div>
      </header>
      
      {/* Main content: 3-Column Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-[#0a0c0f]">
        {/* Left Sidebar: Leaderboard */}
        <div className="w-full lg:w-[320px] xl:w-[360px] bg-black/40 backdrop-blur-md border-r border-white/10 flex flex-col overflow-hidden order-2 lg:order-1">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-f1-white font-heading font-bold uppercase tracking-wider text-sm flex items-center gap-2">
              <svg className="w-4 h-4 text-f1-red" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 18h2v2H4v-2zm0-4h2v2H4v-2zm0-4h2v2H4v-2zm0-4h2v2H4V6zm4 12h12v2H8v-2zm0-4h12v2H8v-2zm0-4h12v2H8v-2zm0-4h12v2H8V6z" />
              </svg>
              Live Leaderboard
            </h2>
            <div className="text-[10px] font-mono text-f1-silver px-2 py-0.5 rounded bg-white/5 border border-white/10">
              LAP {engine.currentFrame?.lap || 1}/{sessionInfo?.totalLaps || '—'}
            </div>
          </div>
          <div className="flex-1 overflow-hidden flex flex-col">
            <Leaderboard
              drivers={drivers}
              currentFrame={engine.currentFrame}
              stints={stints}
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
          <div className="w-full h-full absolute inset-0 z-0">
            <TrackMap
              trackLayout={{
                circuit_key: circuitKey,
                circuit_name: sessionInfo?.sessionName || 'Circuit',
                coordinates: trackCoordinates,
              }}
              driverPositions={engine.currentFrame?.driver_positions || []}
              drivers={drivers}
              selectedDriver={selectedDriverNumber ?? undefined}
              safetyCar={engine.currentFrame?.safety_car ?? undefined}
              className="w-full h-full"
              width={800}
              height={500}
            />
          </div>

          {/* Satellite Map Overlay */}
          {!mapError && (
            <MapErrorBoundary fallback={null}>
              <SatelliteTrackMap
                circuitKey={circuitKey}
                trackCoordinates={trackCoordinates}
                driverPositions={engine.currentFrame?.driver_positions || []}
                drivers={drivers}
                selectedDriver={selectedDriverNumber ?? undefined}
                safetyCar={engine.currentFrame?.safety_car ?? null}
                className="absolute inset-0 z-10"
                height="100%"
                onError={() => setMapError(true)}
              />
            </MapErrorBoundary>
          )}
          
          {/* Badge overlays */}
          <div className="absolute bottom-4 left-4 flex flex-col gap-2 z-20">
            {engine.currentFrame && (
              <div className="bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs text-f1-silver font-mono border border-white/10">
                Frame {engine.currentIndex + 1}/{engine.totalFrames}
              </div>
            )}
          </div>
          
          {isProcessing && !isLoading && (
            <div className="absolute bottom-4 right-4 bg-cyan-500/10 backdrop-blur-sm border border-cyan-500/20 px-3 py-1.5 rounded-lg flex items-center gap-2 z-20">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
              <span className="text-[10px] font-mono text-cyan-200/80 uppercase tracking-tight">
                {processingMessage || 'Processing...'}
              </span>
            </div>
          )}
          
          <div className="absolute top-4 right-4 max-w-[calc(100%-2rem)] z-20">
            <TelemetryHUD
              drivers={drivers}
              currentFrame={engine.currentFrame}
              selectedDriverNumber={selectedDriverNumber}
            />
          </div>
        </div>

        {/* Right Column: Strategy Hub */}
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
                  totalLaps={sessionInfo?.totalLaps || 50}
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
                  pitStops={pitStops}
                  stints={stints}
                  currentLap={engine.currentFrame?.lap || 1}
                />
              </div>
              <PitWindowWidget
                drivers={drivers}
                stints={stints}
                currentLap={engine.currentFrame?.lap || 1}
                totalLaps={sessionInfo?.totalLaps || 50}
                selectedDriverNumber={selectedDriverNumber}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Timeline Controls */}
      <TimelineControls
        engine={engine}
        safetyCarEvents={safetyCarEvents}
        flagEvents={flagEvents}
      />
      
      <style jsx>{`
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