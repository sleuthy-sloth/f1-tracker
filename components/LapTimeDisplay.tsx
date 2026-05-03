'use client';

import type { ReplayFrame } from '@/lib/types';

/**
 * cn() - Simple utility to merge classNames
 */
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * LapTimeDisplayProps
 */
interface LapTimeDisplayProps {
  currentFrame: ReplayFrame | null;
  totalLaps: number;
  sessionStartTimestamp: number | null;
  className?: string;
}

/**
 * Format elapsed time from milliseconds to MM:SS
 */
function formatElapsed(ms: number): string {
  if (isNaN(ms) || ms < 0) return '--:--';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * LapTimeDisplay - Glassmorphic card showing current lap and elapsed race time
 */
export default function LapTimeDisplay({
  currentFrame,
  totalLaps,
  sessionStartTimestamp,
  className,
}: LapTimeDisplayProps) {
  // Compute current lap from frame
  const currentLap =
    currentFrame && !isNaN(currentFrame.lap) ? currentFrame.lap : NaN;

  // Compute elapsed time
  let elapsedMs: number;
  if (!currentFrame) {
    elapsedMs = NaN;
  } else if (sessionStartTimestamp && sessionStartTimestamp > 0) {
    elapsedMs = currentFrame.timestamp - sessionStartTimestamp;
  } else {
    // No session start time available, cannot compute elapsed
    elapsedMs = NaN;
  }

  // Format displays
  const lapDisplay = isNaN(currentLap) ? '--' : currentLap.toString();
  const timeDisplay = isNaN(elapsedMs) ? '--:--' : formatElapsed(elapsedMs);

  // Progress percentage
  const progressPercent =
    !isNaN(currentLap) && totalLaps > 0 ? (currentLap / totalLaps) * 100 : 0;

  return (
    <div
      className={cn(
        'glass-panel w-[200px] p-4 rounded-xl',
        'bg-[#111418]',
        'border border-[rgba(255,255,255,0.1)]',
        className
      )}
    >
      {/* Header */}
      <div className="text-[10px] uppercase tracking-widest text-f1-silver mb-3">
        LAP &amp; TIME
      </div>

      {/* Lap and Time Row */}
      <div className="flex justify-between items-start mb-3">
        {/* Left: Lap */}
        <div>
          <div className="text-[10px] uppercase tracking-wider text-f1-silver mb-1">
            LAP
          </div>
          <div className="font-heading text-3xl font-bold text-f1-white leading-none">
            {lapDisplay}
            <span className="text-lg text-f1-silver">/{totalLaps}</span>
          </div>
        </div>

        {/* Right: Elapsed Time */}
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-wider text-f1-silver mb-1">
            ELAPSED
          </div>
          <div className="font-heading text-2xl font-bold text-f1-white leading-none">
            {timeDisplay}
          </div>
        </div>
      </div>

      {/* Separator */}
      <div className="h-px bg-white/10 mb-3" />

      {/* Progress Bar */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-[10px] uppercase tracking-wider text-f1-silver">
            PROGRESS
          </span>
          <span className="text-[10px] text-f1-silver">
            {Math.round(progressPercent)}%
          </span>
        </div>
        <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
          <div
            className="h-full bg-f1-red rounded-full transition-all duration-300"
            style={{ width: `${Math.min(progressPercent, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}