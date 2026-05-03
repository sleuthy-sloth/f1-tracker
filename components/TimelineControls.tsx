'use client';

import { useState, useCallback } from 'react';
import type { RaceControlData } from '@/lib/types';
import type { ReplayEngineState } from '@/hooks/useReplayEngine';
import { Button } from '@/components/ui/Button';

/**
 * cn() - Simple utility to merge classNames
 */
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * TimelineControlsProps
 */
interface TimelineControlsProps {
  engine: ReplayEngineState;
  safetyCarEvents?: RaceControlData[];
  flagEvents?: RaceControlData[];
}

/**
 * Valid speed options
 */
const SPEED_OPTIONS = [0.25, 0.5, 1, 2, 5, 10, 20] as const;

/**
 * Format timestamp to display time (HH:MM:SS)
 */
function formatTime(timestamp: number): string {
  const totalSeconds = Math.floor(timestamp / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;
}

/**
 * Get event markers from race control data
 */
interface EventMarker {
  position: number; // 0-1 progress
  type: 'safety-car' | 'yellow-flag' | 'red-flag' | 'green-flag';
  data: RaceControlData;
}

function getEventMarkers(
  safetyCarEvents: RaceControlData[] | undefined,
  flagEvents: RaceControlData[] | undefined,
  timeRange: { start: number; end: number } | null
): EventMarker[] {
  if (!timeRange) return [];

  const markers: EventMarker[] = [];
  const duration = timeRange.end - timeRange.start;

  // Process safety car events
  if (safetyCarEvents) {
    for (const event of safetyCarEvents) {
      const eventTime = new Date(event.date).getTime();
      const position = (eventTime - timeRange.start) / duration;
      if (position >= 0 && position <= 1) {
        markers.push({
          position,
          type: 'safety-car',
          data: event,
        });
      }
    }
  }

  // Process flag events
  if (flagEvents) {
    for (const event of flagEvents) {
      const eventTime = new Date(event.date).getTime();
      const position = (eventTime - timeRange.start) / duration;
      if (position >= 0 && position <= 1) {
        let type: EventMarker['type'];
        if (event.flag === 'yellow') {
          type = 'yellow-flag';
        } else if (event.flag === 'red') {
          type = 'red-flag';
        } else if (event.flag === 'green') {
          type = 'green-flag';
        } else {
          continue;
        }
        markers.push({
          position,
          type,
          data: event,
        });
      }
    }
  }

  // Sort by position
  return markers.sort((a, b) => a.position - b.position);
}

/**
 * Get marker color based on type
 */
function getMarkerColor(type: EventMarker['type']): string {
  switch (type) {
    case 'safety-car':
      return '#FFB300'; // Orange
    case 'yellow-flag':
      return '#FFD700'; // Yellow
    case 'red-flag':
      return '#DC2626'; // Red
    case 'green-flag':
      return '#22C55E'; // Green
    default:
      return '#9B9B9B';
  }
}

/**
 * TimelineControls - Bottom timeline bar with controls and event markers
 * Provides playback controls, progress bar, and event visualization
 *
 * @example
 * <TimelineControls
 *   engine={engineState}
 *   safetyCarEvents={scEvents}
 *   flagEvents={flagEvents}
 * />
 */
export function TimelineControls({
  engine,
  safetyCarEvents,
  flagEvents,
}: TimelineControlsProps) {
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [hoveredMarker, setHoveredMarker] = useState<EventMarker | null>(null);

  const {
    currentFrame,
    isPlaying,
    speed,
    currentIndex,
    totalFrames,
    timeRange,
    progress,
    togglePlay,
    stepForward,
    stepBack,
    setSpeed,
    seekToProgress,
  } = engine;

  // Handle timeline click for seeking
  const handleTimelineClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (totalFrames <= 1) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickProgress = clickX / rect.width;
      seekToProgress(clickProgress);
    },
    [totalFrames, seekToProgress]
  );

  // Handle speed change
  const handleSpeedChange = useCallback(
    (newSpeed: number) => {
      setSpeed(newSpeed);
      setShowSpeedMenu(false);
    },
    [setSpeed]
  );

  // Get event markers
  const eventMarkers = getEventMarkers(safetyCarEvents, flagEvents, timeRange);

  // Empty state
  if (totalFrames === 0) {
    return (
      <div className="fixed bottom-0 left-0 right-0 h-24 bg-surface border-t border-white/[0.10] flex items-center justify-center">
        <span className="text-f1-silver text-sm">No replay data</span>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 h-28 bg-surface-dim border-t border-white/[0.10] px-4 py-3">
      {/* Controls row */}
      <div className="flex items-center justify-between mb-3">
        {/* Left: Playback controls */}
        <div className="flex items-center gap-2">
          {/* Step back button */}
          <Button
            variant="outline"
            size="sm"
            onClick={stepBack}
            disabled={totalFrames <= 1}
            className="w-9 h-9 p-0"
            aria-label="Step back"
          >
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M6 6h2v12H6V6zm3.5 6l8.5 6V6l-8.5 6z" />
            </svg>
          </Button>

          {/* Play/Pause button */}
          <Button
            variant="primary"
            size="sm"
            onClick={togglePlay}
            className="w-10 h-9 p-0"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7L8 5z" />
              </svg>
            )}
          </Button>

          {/* Step forward button */}
          <Button
            variant="outline"
            size="sm"
            onClick={stepForward}
            disabled={totalFrames <= 1}
            className="w-9 h-9 p-0"
            aria-label="Step forward"
          >
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M6 18l8.5-6L6 6v12zm8.5 0h2V6h-2v12z" />
            </svg>
          </Button>

          {/* Speed selector */}
          <div className="relative ml-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              className="min-w-[60px] text-f1-white"
            >
              {speed}x
              <svg
                className="w-3 h-3 ml-1"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M7 10l5 5 5-5H7z" />
              </svg>
            </Button>

            {/* Speed dropdown menu */}
            {showSpeedMenu && (
              <div className="absolute bottom-full left-0 mb-2 bg-surface-container-high border border-white/[0.10] rounded-lg shadow-xl overflow-hidden z-50">
                {SPEED_OPTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSpeedChange(s)}
                    className={cn(
                      'block w-full px-4 py-2 text-sm text-left hover:bg-white/[0.10]',
                      speed === s
                        ? 'text-f1-red bg-f1-red/10'
                        : 'text-f1-white'
                    )}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center: Lap and time display */}
        <div className="flex items-center gap-6">
          {currentFrame && (
            <>
              <div className="text-center">
                <span className="text-xs text-f1-silver uppercase tracking-wider">
                  Lap
                </span>
                <div className="text-lg font-semibold text-f1-white font-mono">
                  {currentFrame.lap}
                </div>
              </div>

              <div className="text-center">
                <span className="text-xs text-f1-silver uppercase tracking-wider">
                  Time
                </span>
                <div className="text-lg font-semibold text-f1-white font-mono">
                  {currentFrame.timestamp
                    ? formatTime(currentFrame.timestamp)
                    : '--:--'}
                </div>
              </div>
            </>
          )}

          <div className="text-center">
            <span className="text-xs text-f1-silver uppercase tracking-wider">
              Frame
            </span>
            <div className="text-sm text-f1-silver font-mono">
              {currentIndex + 1} / {totalFrames}
            </div>
          </div>
        </div>

        {/* Right: Progress percentage */}
        <div className="text-sm text-f1-silver font-mono min-w-[60px] text-right">
          {Math.round(progress * 100)}%
        </div>
      </div>

      {/* Timeline bar */}
      <div
        className="relative h-3 bg-white/[0.10] rounded-full cursor-pointer group"
        onClick={handleTimelineClick}
      >
        {/* Progress fill */}
        <div
          className="absolute top-0 left-0 h-full bg-f1-red rounded-full transition-all duration-100"
          style={{ width: `${progress * 100}%` }}
        />

        {/* Event markers */}
        {eventMarkers.map((marker, idx) => (
          <div
            key={`${marker.type}-${idx}`}
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full cursor-pointer transform -translate-x-1/2 z-10 transition-transform hover:scale-150"
            style={{
              left: `${marker.position * 100}%`,
              backgroundColor: getMarkerColor(marker.type),
              boxShadow: `0 0 6px ${getMarkerColor(marker.type)}`,
            }}
            onMouseEnter={() => setHoveredMarker(marker)}
            onMouseLeave={() => setHoveredMarker(null)}
          >
            {/* Tooltip */}
            {hoveredMarker === marker && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-surface-container-high border border-white/[0.10] rounded-lg shadow-xl whitespace-nowrap z-50">
                <div className="text-xs text-f1-silver">
                  {marker.type === 'safety-car' && 'Safety Car'}
                  {marker.type === 'yellow-flag' && 'Yellow Flag'}
                  {marker.type === 'red-flag' && 'Red Flag'}
                  {marker.type === 'green-flag' && 'Green Flag'}
                </div>
                <div className="text-sm text-f1-white">{marker.data.message}</div>
                {marker.data.lap_number && (
                  <div className="text-xs text-f1-silver">
                    Lap {marker.data.lap_number}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Legend bar */}
      <div className="flex items-center justify-center gap-6 mt-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#FFB300]" />
          <span className="text-xs text-f1-silver">Safety Car</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#FFD700]" />
          <span className="text-xs text-f1-silver">Yellow Flag</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#22C55E]" />
          <span className="text-xs text-f1-silver">Green Flag</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#DC2626]" />
          <span className="text-xs text-f1-silver">Red Flag</span>
        </div>
      </div>
    </div>
  );
}

export default TimelineControls;