'use client';

import { Suspense, useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { fetchRaceData, fetchRawRaceData } from '@/lib/raceData';
import { getMeetings, getSessions, getStints, getPit } from '@/lib/api/openf1';
import type { Driver, RaceControlData, StintData, PitData } from '@/lib/types';
import dynamic from 'next/dynamic';
import { useReplayEngine } from '@/hooks/useReplayEngine';
import { FrameBuffer } from '@/lib/frameBuffer';
import { TelemetryHUD } from '@/components/TelemetryHUD';
import { Leaderboard } from '@/components/Leaderboard';
import { TimelineControls } from '@/components/TimelineControls';
import LapTimeDisplay from '@/components/LapTimeDisplay';
import GapChart from '@/components/GapChart';
import TyreWidget from '@/components/TyreWidget';
import WeatherRadar from '@/components/WeatherRadar';
import SafetyCar from '@/components/SafetyCar';
import RaceControlFeed from '@/components/RaceControlFeed';
import PitStopIndicator from '@/components/PitStopIndicator';
import PitWindowWidget from '@/components/PitWindowWidget';
import { Card } from '@/components/ui/Card';
import TrackMap from '@/components/TrackMap';
import { MapErrorBoundary } from '@/components/MapErrorBoundary';

const SatelliteTrackMap = dynamic(
  () => import('@/components/SatelliteTrackMap').then(mod => ({ default: mod.SatelliteTrackMap })),
  { ssr: false }
);

/**
 * Track coordinates from multiviewer API
 */
interface TrackCoordinates {
  x: number;
  y: number;
}

/**
 * Session info from URL params
 */
interface SessionInfo {
  sessionKey: number;
  meetingKey: number;
  sessionName: string;
  circuitKey: number;
  year: number;
  totalLaps: number;
}

/**
 * Loading state component
 */
function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <div className="w-12 h-12 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
      <span className="text-f1-silver font-mono text-sm">Loading race data...</span>
    </div>
  );
}

/**
 * Empty state when no session is selected
 */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <div className="w-16 h-16 rounded-full bg-white/[0.05] flex items-center justify-center">
        <svg className="w-8 h-8 text-f1-silver" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      </div>
      <h2 className="text-xl font-heading font-bold text-f1-white">Select a Session</h2>
      <p className="text-f1-silver text-center max-w-md">
        Choose a race session from the <Link href="/archive" className="text-f1-cyan hover:underline">archive</Link> to replay with full telemetry and strategy analysis.
      </p>
    </div>
  );
}

/**
 * Error state when session not found
 */
function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h2 className="text-xl font-heading font-bold text-f1-white">Session Not Found</h2>
      <p className="text-f1-silver text-center max-w-md">{message}</p>
      <div className="flex gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-4 px-4 py-2 bg-white/[0.08] text-f1-silver rounded-lg text-sm font-medium hover:bg-white/[0.12] transition-colors"
          >
            Try Again
          </button>
        )}
        <Link 
          href="/archive" 
          className="mt-4 px-4 py-2 bg-f1-red/20 text-f1-red rounded-lg text-sm font-medium hover:bg-f1-red/30 transition-colors"
        >
          Back to Archive
        </Link>
      </div>
    </div>
  );
}

/**
 * Format time from timestamp
 */
function formatTime(timestamp: number): string {
  const totalSeconds = Math.floor(timestamp / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Main content component that uses useSearchParams
 */
function StrategyLabContent() {
  const searchParams = useSearchParams();
  
  // URL params
  const sessionParam = searchParams.get('session');
  const driverParam = searchParams.get('driver');
  
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('Initializing...');
  const [error, setError] = useState<string | null>(null);
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [frameBuffer, setFrameBuffer] = useState<FrameBuffer | null>(null);
  const [selectedDriverNumber, setSelectedDriverNumber] = useState<number | null>(null);
  const [circuitKey, setCircuitKey] = useState<number>(0);
  const [trackCoordinates, setTrackCoordinates] = useState<TrackCoordinates[]>([]);
  const [stints, setStints] = useState<StintData[]>([]);
  const [pitStops, setPitStops] = useState<PitData[]>([]);
  const [safetyCarEvents, setSafetyCarEvents] = useState<RaceControlData[]>([]);
  const [flagEvents, setFlagEvents] = useState<RaceControlData[]>([]);
  const [mapError, setMapError] = useState(false);
  
  // Initialize replay engine (will be updated when frameBuffer is ready)
  const engine = useReplayEngine({ 
    frameBuffer: frameBuffer || new FrameBuffer(), 
    initialSpeed: 1 
  });
  
  // Handle driver selection
  const handleSelectDriver = useCallback((driverNumber: number) => {
    setSelectedDriverNumber(driverNumber);
  }, []);
  
  // Fetch meeting and session data
  useEffect(() => {
    async function fetchSessionInfo() {
      if (!sessionParam) {
        setIsLoading(false);
        return;
      }
      
      const sessionKey = parseInt(sessionParam, 10);
      if (isNaN(sessionKey)) {
        setError('Invalid session key');
        setIsLoading(false);
        return;
      }
      
      try {
        // Get session info to find meeting_key
        // Note: session_key can be number or 'latest' string
        // @ts-expect-error - Type issue with openf1 types, this works at runtime
        const sessions = await getSessions({ session_key: String(sessionKey) });
        if (sessions.length === 0) {
          setError('Session not found');
          setIsLoading(false);
          return;
        }
        
        const session = sessions[0];
        const meetingKey = session.meeting_key;
        const year = session.year;
        
        // Get meeting for circuit_key
        const meetings = await getMeetings({ meeting_key: meetingKey });
        if (meetings.length === 0) {
          setError('Meeting not found');
          setIsLoading(false);
          return;
        }
        
        const meeting = meetings[0];
        const circuitKeyValue = meeting.circuit_key;
        
        // Fetch stints and pit stops for strategy widgets
        const [stintsData, pitData] = await Promise.all([
          getStints({ session_key: sessionKey }).catch(() => []),
          getPit({ session_key: sessionKey }).catch(() => [])
        ]);
        
        setStints(stintsData);
        setPitStops(pitData);
        
        // Fetch track coordinates from multiviewer API
        try {
          const trackResponse = await fetch(
            `https://api.multiviewer.app/api/v1/circuits/${circuitKeyValue}/${year}`,
            { signal: AbortSignal.timeout(5000) }
          );
          
          if (trackResponse.ok) {
            const trackData = await trackResponse.json();
            if (trackData.x && trackData.y) {
              const coords: TrackCoordinates[] = trackData.x.map((x: number, i: number) => ({
                x,
                y: trackData.y[i]
              }));
              setTrackCoordinates(coords);
            }
          }
        } catch (trackError) {
          console.warn('Failed to fetch track coordinates:', trackError);
          // Continue without track coordinates - the map will show empty state
        }
        
        setSessionInfo({
          sessionKey,
          meetingKey,
          sessionName: session.session_name,
          circuitKey: circuitKeyValue,
          year,
          totalLaps: 57 // Default F1 race laps, will be updated with actual data
        });
        setCircuitKey(circuitKeyValue);
        
        // Mark initial metadata as loaded so map can start
        setIsLoading(false);
        setIsProcessing(true);
        
        console.log(`Initial session info loaded for ${session.session_name}. Fetching telemetry...`);
        
        // Step 3: Fetch raw race data components
        const rawData = await fetchRawRaceData(sessionKey, (msg) => {
          setProcessingMessage(msg);
        });
        
        if (!rawData || rawData.drivers.length === 0) {
          setError('No replay data available for this session');
          setIsProcessing(false);
          return;
        }
        
        setDrivers(rawData.drivers);
        
        // Step 4: Offload heavy processing to Web Worker
        setProcessingMessage('Synchronizing timeline...');
        console.log('Offloading race data processing to worker...');
        const worker = new Worker('/workers/race-data-worker.js');
        
        // Convert Map data to plain objects for structured cloning
        const locationObj: Record<number, any[]> = {};
        const carObj: Record<number, any[]> = {};
        rawData.locationByDriver.forEach((val, key) => { locationObj[key] = val; });
        rawData.carDataByDriver.forEach((val, key) => { carObj[key] = val; });

        // Set up handlers BEFORE postMessage to avoid race condition
        worker.onerror = (e) => {
          console.error('[StrategyLab] Worker load/runtime error:', e.message, e);
          e.preventDefault();
          setError('Telemetry processing failed: worker error');
          setIsProcessing(false);
          worker.terminate();
        };

        worker.onmessageerror = () => {
          console.error('[StrategyLab] Worker message error (structured clone failure)');
          setError('Telemetry processing failed: data transfer error');
          setIsProcessing(false);
          worker.terminate();
        };

        worker.onmessage = (e) => {
          if (e.data.type === 'SUCCESS') {
            const { replayFrames } = e.data.result;
            
            // Handle empty replay frames gracefully
            if (!replayFrames || replayFrames.length === 0) {
              console.warn('[StrategyLab] Worker produced 0 replay frames');
              setError('No replay data available — no valid frames could be generated from this session');
              setIsProcessing(false);
              worker.terminate();
              return;
            }
            
            const newFrameBuffer = new FrameBuffer(replayFrames);
            setFrameBuffer(newFrameBuffer);
            
            // Extract safety car and flag events from processed frames
            const allMessages: RaceControlData[] = [];
            for (const frame of replayFrames) {
              if (frame.race_control_messages) {
                allMessages.push(...frame.race_control_messages);
              }
            }
            
            const seen = new Set<string>();
            const uniqueMessages: RaceControlData[] = [];
            for (const msg of allMessages) {
              const key = `${msg.date}-${msg.message}`;
              if (!seen.has(key)) {
                seen.add(key);
                uniqueMessages.push(msg);
              }
            }
            
            const scEvents: RaceControlData[] = [];
            const flEvents: RaceControlData[] = [];
            for (const msg of uniqueMessages) {
              const category = (msg.category || '').toUpperCase();
              const flag = (msg.flag || '').toUpperCase();
              if (category.includes('SAFETY CAR') || flag.includes('SCD') || flag.includes('SCR')) {
                scEvents.push(msg);
              } else if (flag === 'YELLOW' || flag === 'RED' || flag === 'GREEN') {
                flEvents.push(msg);
              }
            }
            setSafetyCarEvents(scEvents);
            setFlagEvents(flEvents);
            
            setIsProcessing(false);
            worker.terminate();
          } else if (e.data.type === 'ERROR') {
            console.error('[StrategyLab] Worker processing error:', e.data.error);
            setError('Telemetry processing failed');
            setIsProcessing(false);
            worker.terminate();
          }
        };

        worker.postMessage({
          type: 'PROCESS_RACE_DATA',
          data: {
            drivers: rawData.drivers,
            locationByDriver: locationObj,
            carDataByDriver: carObj,
            weatherData: rawData.weatherData,
            raceControlData: rawData.raceControlData,
            frameIntervalMs: 200
          }
        });
        
        // Set initial driver from URL param
        if (driverParam) {
          const driverNum = parseInt(driverParam, 10);
          if (!isNaN(driverNum)) {
            setSelectedDriverNumber(driverNum);
          }
        }
      } catch (err) {
        console.error('Error loading session:', err);
        setError('Failed to load session data');
        setIsLoading(false);
        setIsProcessing(false);
      }
    }
    
    fetchSessionInfo();
  }, [sessionParam, driverParam]);

  // Keyboard shortcuts for playback control
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't capture if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          engine.togglePlay();
          break;
        case 'ArrowRight':
          e.preventDefault();
          engine.stepForward();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          engine.stepBack();
          break;
      }
    }
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [engine]);
  
  // Compute selected driver numbers for GapChart
  const selectedDriverNumbers = useMemo(() => {
    if (selectedDriverNumber !== null) {
      return [selectedDriverNumber];
    }
    // Default: top 3 drivers
    if (engine.currentFrame && drivers.length > 0) {
      return engine.currentFrame.driver_positions
        .slice(0, 3)
        .map((dp: { driver_number: number }) => dp.driver_number);
    }
    return [];
  }, [selectedDriverNumber, engine.currentFrame, drivers]);
  
  // Compute total laps
  const totalLaps = useMemo(() => {
    if (engine.currentFrame) {
      return Math.max(engine.currentFrame.lap * 2, 57); // Estimate based on current lap
    }
    return 57;
  }, [engine.currentFrame]);
  
  // Render states
  if (!sessionParam && !isLoading) {
    return (
      <div className="min-h-screen bg-f1-carbon flex flex-col">
        {/* Header */}
        <header className="h-16 bg-surface border-b border-white/[0.07] flex items-center px-6">
          <h1 className="text-lg font-heading font-bold text-f1-white tracking-wider">
            STRATEGY LAB
          </h1>
        </header>
        
        {/* Main content */}
        <main className="flex-1 flex items-center justify-center p-8">
          <EmptyState />
        </main>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-f1-carbon flex flex-col">
        {/* Header */}
        <header className="h-16 bg-surface border-b border-white/[0.07] flex items-center px-6">
          <h1 className="text-lg font-heading font-bold text-f1-white tracking-wider">
            STRATEGY LAB
          </h1>
        </header>
        
        {/* Main content */}
        <main className="flex-1 flex items-center justify-center p-8">
          <LoadingState />
        </main>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-f1-carbon flex flex-col">
        {/* Header */}
        <header className="h-16 bg-surface border-b border-white/[0.07] flex items-center px-6">
          <Link href="/archive" className="text-f1-silver hover:text-f1-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="ml-4 text-lg font-heading font-bold text-f1-white tracking-wider">
            STRATEGY LAB
          </h1>
        </header>
        
        {/* Main content */}
        <main className="flex-1 flex items-center justify-center p-8">
          <ErrorState message={error} onRetry={() => window.location.reload()} />
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-f1-carbon flex flex-col animate-fade-in">
      {/* Header */}
      <header className="h-16 bg-surface border-b border-white/[0.07] flex flex-col lg:flex-row items-start lg:items-center justify-between px-4 lg:px-6 py-2 lg:py-0">
        <div className="flex items-center gap-4">
          <Link href="/archive" className="text-f1-silver hover:text-f1-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-lg font-heading font-bold text-f1-white tracking-wider">
            STRATEGY LAB
          </h1>
          {sessionInfo && (
            <span className="text-f1-silver text-sm">
              {sessionInfo.sessionName} {sessionInfo.year}
            </span>
          )}
        </div>
        
        {/* Session metrics */}
        <div className="flex flex-wrap items-center gap-2 lg:gap-6 mt-1 lg:mt-0">
          <Card variant="glass" padding="sm" className="py-2 px-4">
            <div className="text-[10px] uppercase tracking-wider text-f1-silver">Drivers</div>
            <div className="text-lg font-heading font-bold text-f1-white">{drivers.length}</div>
          </Card>
          <Card variant="glass" padding="sm" className="py-2 px-4">
            <div className="text-[10px] uppercase tracking-wider text-f1-silver">Frames</div>
            <div className="text-lg font-heading font-bold text-f1-white">{engine.totalFrames}</div>
          </Card>
          {engine.timeRange && (
            <Card variant="glass" padding="sm" className="py-2 px-4">
              <div className="text-[10px] uppercase tracking-wider text-f1-silver">Duration</div>
              <div className="text-lg font-heading font-bold text-f1-white">
                {formatTime(engine.timeRange.end - engine.timeRange.start)}
              </div>
            </Card>
          )}
        </div>
      </header>
      
      {/* Main content: Map + Side panels */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Map area */}
        <div className="flex-1 relative min-h-[40vh] lg:min-h-0">
          {isLoading && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-30 backdrop-blur-sm">
              <div className="w-10 h-10 border-4 border-f1-cyan/30 border-t-f1-cyan rounded-full animate-spin mb-4" />
              <span className="text-f1-white font-heading font-bold text-lg mb-2">Initializing Map</span>
              <span className="text-f1-silver font-mono text-sm h-5">Loading session data...</span>
            </div>
          )}
          {/* Base 2D Map (Guaranteed Fallback) */}
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

          {/* Satellite Map (Fades in over 2D map when ready) */}
          {!mapError && (
            <MapErrorBoundary
              fallback={null} // Error handled by parent mapError state
            >
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
          
          {/* Frame counter badge */}
          {engine.currentFrame && (
            <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs text-f1-silver font-mono z-20">
              Frame {engine.currentIndex + 1}/{engine.totalFrames}
            </div>
          )}
          
          {/* Processing status badge */}
          {isProcessing && !isLoading && (
            <div className="absolute bottom-4 right-4 bg-cyan-500/10 backdrop-blur-sm border border-cyan-500/20 px-3 py-1.5 rounded-lg flex items-center gap-2 z-20">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
              <span className="text-[10px] font-mono text-cyan-200/80 uppercase tracking-tight">
                {processingMessage || 'Processing telemetry...'}
              </span>
            </div>
          )}
          
          {/* Telemetry HUD floating over map */}
          <div className="absolute top-4 right-4 max-w-[calc(100%-2rem)] z-20">
            <TelemetryHUD
              drivers={drivers}
              currentFrame={engine.currentFrame}
              selectedDriverNumber={selectedDriverNumber}
            />
          </div>
        </div>
        
        {/* Side panel */}
        <div className="w-full lg:w-96 max-h-[50vh] lg:max-h-none border-t lg:border-t-0 lg:border-l border-white/[0.07] overflow-y-auto custom-scrollbar">
          <div className="p-3 space-y-2 lg:space-y-3">
            {/* Leaderboard */}
            <Leaderboard
              drivers={drivers}
              currentFrame={engine.currentFrame}
              stints={stints}
              selectedDriverNumber={selectedDriverNumber}
              onSelectDriver={handleSelectDriver}
            />
            
            {/* Gap Chart */}
            <GapChart
              currentFrame={engine.currentFrame}
              drivers={drivers}
              selectedDriverNumbers={selectedDriverNumbers}
            />
            
            {/* Lap Time Display */}
            <LapTimeDisplay
              currentFrame={engine.currentFrame}
              totalLaps={totalLaps}
              sessionStartTimestamp={engine.timeRange?.start || null}
            />
            
            {/* Tyre Widget */}
            <TyreWidget
              drivers={drivers}
              stints={stints}
              currentLap={engine.currentFrame?.lap || 1}
              selectedDriverNumber={selectedDriverNumber}
              onSelectDriver={handleSelectDriver}
            />
            
            {/* Weather Radar */}
            <WeatherRadar currentFrame={engine.currentFrame} />
            
            {/* Race Control Feed */}
            <RaceControlFeed currentFrame={engine.currentFrame} maxMessages={30} />
            
            {/* Pit Stop Indicator */}
            <PitStopIndicator
              drivers={drivers}
              pitStops={pitStops}
              stints={stints}
              currentLap={engine.currentFrame?.lap || 1}
              maxEvents={20}
            />
            
            {/* Safety Car */}
            <SafetyCar currentFrame={engine.currentFrame} />
            
            {/* Pit Window Widget */}
            <PitWindowWidget
              drivers={drivers}
              stints={stints}
              currentLap={engine.currentFrame?.lap || 1}
              totalLaps={totalLaps}
              selectedDriverNumber={selectedDriverNumber}
            />
          </div>
        </div>
      </div>
      
      {/* Timeline Controls at bottom */}
      <TimelineControls
        engine={engine}
        safetyCarEvents={safetyCarEvents}
        flagEvents={flagEvents}
      />
      
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(225, 6, 0, 0.8);
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
          <h1 className="text-lg font-heading font-bold text-f1-white tracking-wider">
            STRATEGY LAB
          </h1>
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