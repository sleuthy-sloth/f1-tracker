'use client';

import type { Driver, StintData } from '@/lib/types';

/**
 * cn() - Simple utility to merge classNames
 * Filters out falsy values for cleaner className strings
 */
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * PitWindowWidgetProps - Props for PitWindowWidget component
 */
interface PitWindowWidgetProps {
  /** All available drivers */
  drivers: Driver[];
  /** Array of stint data from API */
  stints: StintData[];
  /** Current lap during replay */
  currentLap: number;
  /** Total race laps */
  totalLaps: number;
  /** Which driver to show prediction for */
  selectedDriverNumber: number | null;
  /** Optional className for container */
  className?: string;
}

/**
 * Tyre compound colors matching FIA standards
 */
const TYRE_COLOURS: Record<string, { bg: string; text: string; label: string }> = {
  SOFT: { bg: 'bg-[#e10600]', text: 'text-white', label: 'S' },
  MEDIUM: { bg: 'bg-[#ffd700]', text: 'text-black', label: 'M' },
  HARD: { bg: 'bg-[#e5e2e1]', text: 'text-black', label: 'H' },
  INTERMEDIATE: { bg: 'bg-[#00d2be]', text: 'text-black', label: 'I' },
  WET: { bg: 'bg-[#3671C6]', text: 'text-white', label: 'W' },
};

/**
 * Default tyre style for unknown compounds
 */
const DEFAULT_TYRE = { bg: 'bg-white/10', text: 'text-f1-silver', label: '—' };

/**
 * Typical stint length for tyre life calculation
 */
const TYPICAL_STINT_LENGTH = 30;

/**
 * getTyreStyle - Get tyre style for compound
 */
function getTyreStyle(compound: string | undefined) {
  if (!compound) return DEFAULT_TYRE;
  const upper = compound.toUpperCase() as keyof typeof TYRE_COLOURS;
  return TYRE_COLOURS[upper] || DEFAULT_TYRE;
}

/**
 * getCurrentStint - Find the current active stint for a driver
 * Same logic as TyreWidget component
 */
function getCurrentStint(
  driverNumber: number,
  stints: StintData[],
  currentLap: number
): StintData | undefined {
  if (stints.length === 0) return undefined;

  const driverStints = stints.filter((s) => s.driver_number === driverNumber);

  // Find stint where lap_start <= currentLap AND (lap_end === -1 OR lap_end >= currentLap)
  // Sort by stint_number descending to get the most recent stint
  const sortedStints = [...driverStints].sort((a, b) => b.stint_number - a.stint_number);

  return sortedStints.find(
    (s) => s.lap_start <= currentLap && (s.lap_end === -1 || s.lap_end >= currentLap)
  );
}

/**
 * calculateTyreLife - Calculate remaining tyre life percentage
 */
function calculateTyreLife(age: number): number {
  return Math.max(0, 100 - Math.min(100, (age / TYPICAL_STINT_LENGTH) * 100));
}

/**
 * calculateOptimalPitWindow - Calculate optimal pit window based on tyre life
 */
function calculateOptimalPitWindow(
  currentLap: number,
  tyrLife: number,
  totalLaps: number
): { start: number; end: number } {
  // Calculate when to start pit window
  const lapsUntilRecommendation = Math.max(1, Math.round(tyrLife / 20));
  let start = currentLap + lapsUntilRecommendation;
  let end = start + 5;

  // Clamp to total laps
  start = Math.min(start, totalLaps);
  end = Math.min(end, totalLaps);

  return { start, end };
}

/**
 * calculateTimeLostPerLap - Estimate time lost per lap based on tyre age
 * Older tyres lose more performance
 */
function calculateTimeLostPerLap(tyrAge: number): string {
  if (tyrAge < 10) return '~0.1s';
  if (tyrAge < 20) return '~0.2s';
  if (tyrAge < 30) return '~0.3s';
  return '~0.4s+';
}

/**
 * getStrategyRecommendation - Get strategy recommendation based on tyre life
 */
function getStrategyRecommendation(tyrLife: number): string {
  if (tyrLife > 60) {
    return 'Current tyres have good life remaining. Consider extending.';
  }
  if (tyrLife > 20) {
    return 'Approaching pit window. Monitor tyre degradation.';
  }
  return 'PIT NOW - Tyres at critical degradation level.';
}

/**
 * Empty state when no driver is selected
 */
function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-24 text-f1-silver/60 text-sm">
      {message}
    </div>
  );
}

/**
 * PitWindowWidget - Strategic pit window predictor for race replay
 * Displays estimated optimal pit window, pit loss time, and undercut estimation
 */
export default function PitWindowWidget({
  drivers,
  stints,
  currentLap,
  totalLaps,
  selectedDriverNumber,
  className,
}: PitWindowWidgetProps) {
  // State 1: No drivers data
  if (!drivers || drivers.length === 0) {
    return (
      <div
        className={cn(
          'w-[280px] bg-white/[0.05] backdrop-blur-xl border border-white/[0.1] rounded-xl p-4',
          className
        )}
      >
        <h3 className="text-[10px] uppercase tracking-widest text-f1-silver mb-4">
          Pit Strategy
        </h3>
        <EmptyState message="No driver data" />
      </div>
    );
  }

  // State 2: No stint data
  if (!stints || stints.length === 0) {
    return (
      <div
        className={cn(
          'w-[280px] bg-white/[0.05] backdrop-blur-xl border border-white/[0.1] rounded-xl p-4',
          className
        )}
      >
        <h3 className="text-[10px] uppercase tracking-widest text-f1-silver mb-4">
          Pit Strategy
        </h3>
        <EmptyState message="Stint data not available" />
      </div>
    );
  }

  // State 3: No driver selected
  if (!selectedDriverNumber) {
    return (
      <div
        className={cn(
          'w-[280px] bg-white/[0.05] backdrop-blur-xl border border-white/[0.1] rounded-xl p-4',
          className
        )}
      >
        <h3 className="text-[10px] uppercase tracking-widest text-f1-silver mb-4">
          Pit Strategy
        </h3>
        <EmptyState message="Select a driver to view pit strategy" />
      </div>
    );
  }

  // State 4: No race data (currentLap not available)
  if (!currentLap || currentLap === 0) {
    return (
      <div
        className={cn(
          'w-[280px] bg-white/[0.05] backdrop-blur-xl border border-white/[0.1] rounded-xl p-4',
          className
        )}
      >
        <h3 className="text-[10px] uppercase tracking-widest text-f1-silver mb-4">
          Pit Strategy
        </h3>
        <EmptyState message="No race data" />
      </div>
    );
  }

  // Get current stint for selected driver
  const currentStint = getCurrentStint(selectedDriverNumber, stints, currentLap);
  const compound = currentStint?.compound || 'UNKNOWN';
  const compoundStyle = getTyreStyle(compound);
  const tyrAge = currentStint ? currentLap - currentStint.lap_start : 0;
  const tyrLife = calculateTyreLife(tyrAge);

  // Calculate optimal pit window
  const optimalWindow = calculateOptimalPitWindow(currentLap, tyrLife, totalLaps);
  const isPitNow = tyrLife < 20;

  // Calculate progress within optimal window
  const windowSize = optimalWindow.end - optimalWindow.start;
  const progressInWindow = windowSize > 0
    ? Math.max(0, Math.min(100, ((currentLap - optimalWindow.start) / windowSize) * 100))
    : 0;

  // Get strategy recommendation
  const recommendation = getStrategyRecommendation(tyrLife);

  return (
    <div
      className={cn(
        'w-[280px] bg-white/[0.05] backdrop-blur-xl border border-white/[0.1] rounded-xl p-4',
        className
      )}
    >
      <h3 className="text-[10px] uppercase tracking-widest text-f1-silver mb-4">
        Pit Strategy
      </h3>

      {/* Section 1 - Current Tyre Status */}
      <div className="mb-3">
        <div className="text-xs text-f1-silver/60 mb-1">Current Tyre</div>
        <div className="flex items-center gap-2">
          <span
            className={cn('px-2 py-0.5 rounded text-xs font-medium', compoundStyle.bg, compoundStyle.text)}
          >
            {compoundStyle.label}
          </span>
          <span className="text-sm text-white">{compound}</span>
        </div>
        <div className="flex items-center gap-3 mt-2 text-xs">
          <div>
            <span className="text-f1-silver/60">Laps: </span>
            <span className="text-white">{tyrAge}</span>
          </div>
          <div>
            <span className="text-f1-silver/60">Life: </span>
            <span className={cn(
              tyrLife > 50 ? 'text-green-400' : tyrLife > 20 ? 'text-yellow-400' : 'text-red-400'
            )}>
              {tyrLife}%
            </span>
          </div>
        </div>
      </div>

      {/* Separator */}
      <div className="border-t border-white/[0.1] my-3" />

      {/* Section 2 - Optimal Pit Window */}
      <div className="mb-3">
        <div className="text-xs text-f1-silver/60 mb-1">Optimal Pit Window</div>
        {isPitNow ? (
          <div className="text-lg font-bold text-red-400">NOW</div>
        ) : (
          <div className="text-lg font-medium text-white">
            Laps {optimalWindow.start} - {optimalWindow.end}
          </div>
        )}
        {/* Progress indicator */}
        {!isPitNow && (
          <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-f1-yellow rounded-full transition-all duration-300"
              style={{ width: `${progressInWindow}%` }}
            />
          </div>
        )}
      </div>

      {/* Separator */}
      <div className="border-t border-white/[0.1] my-3" />

      {/* Section 3 - Time Estimates */}
      <div className="mb-3">
        <div className="text-xs text-f1-silver/60 mb-2">Time Estimates</div>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-f1-silver/60">Pit loss</span>
            <span className="text-white">~22s</span>
          </div>
          <div className="flex justify-between">
            <span className="text-f1-silver/60">Undercut delta</span>
            <span className="text-white">~1.5 - 2.5s</span>
          </div>
          <div className="flex justify-between">
            <span className="text-f1-silver/60">Time lost/lap</span>
            <span className="text-white">{calculateTimeLostPerLap(tyrAge)}</span>
          </div>
        </div>
      </div>

      {/* Separator */}
      <div className="border-t border-white/[0.1] my-3" />

      {/* Section 4 - Strategy Recommendation */}
      <div className="bg-f1-red/10 border-l-2 border-f1-red p-2 rounded">
        <div className="text-[10px] uppercase tracking-widest text-f1-silver mb-1">
          Recommendation
        </div>
        <div className={cn(
          'text-xs',
          isPitNow ? 'text-red-400 font-medium' : 'text-f1-silver'
        )}>
          {recommendation}
        </div>
      </div>
    </div>
  );
}