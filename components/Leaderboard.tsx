'use client';
import { useMemo, memo } from 'react';

import type { Driver, DriverPosition, ReplayFrame, StintData } from '@/lib/types';

/**
 * cn() - Simple utility to merge classNames
 */
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * LeaderboardProps
 */
interface LeaderboardProps {
  drivers: Driver[];
  currentFrame: ReplayFrame | null;
  stints?: StintData[];
  selectedDriverNumber: number | null;
  onSelectDriver: (driverNumber: number) => void;
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
 * Format gap to leader safely
 */
function formatGap(gap: number | string | null | undefined): string {
  if (gap === null || gap === undefined) {
    return '—';
  }
  if (typeof gap === 'string') {
    return gap;
  }
  if (typeof gap === 'number' && !isNaN(gap)) {
    return `${gap.toFixed(1)}s`;
  }
  return '—';
}

/**
 * Get tyre style for compound
 */
function getTyreStyle(compound: string | undefined) {
  if (!compound) return DEFAULT_TYRE;
  const upper = compound.toUpperCase() as keyof typeof TYRE_COLOURS;
  return TYRE_COLOURS[upper] || DEFAULT_TYRE;
}

/**
 * Calculate tyre life percentage
 */
function calculateTyreLife(
  stint: StintData | undefined,
  currentLap: number
): number | null {
  if (!stint) return null;
  const lapsOnTyre = currentLap - stint.lap_start;
  const typicalStintLength = 30;
  const life = Math.max(0, 100 - Math.min(100, (lapsOnTyre / typicalStintLength) * 100));
  return life;
}

/**
 * Get tyre life color based on remaining life
 */
function getTyreLifeColor(life: number): string {
  if (life > 50) return 'bg-green-500';
  if (life >= 20) return 'bg-yellow-500';
  return 'bg-red-500';
}

/**
 * Get current stint for a driver
 */
function getCurrentStint(
  driverNumber: number,
  stints: StintData[] | undefined,
  currentLap: number
): StintData | undefined {
  if (!stints || stints.length === 0) return undefined;
  return stints
    .filter(
      (s) =>
        s.driver_number === driverNumber &&
        s.lap_start <= currentLap &&
        (s.lap_end === -1 || s.lap_end >= currentLap)
    )
    .sort((a, b) => b.stint_number - a.stint_number)[0];
}

/**
 * Count total stints for a driver
 */
function countStints(
  driverNumber: number,
  stints: StintData[] | undefined
): number {
  if (!stints) return 0;
  return stints.filter((s) => s.driver_number === driverNumber).length;
}

/**
 * Check if driver is out of the race
 */
function isDriverOut(
  driverNumber: number,
  driverPositions: DriverPosition[]
): boolean {
  return !driverPositions.some((dp) => dp.driver_number === driverNumber);
}

/**
 * Sort drivers by position, with out drivers at the bottom
 */
function sortDrivers(
  drivers: Driver[],
  driverPositions: DriverPosition[]
): Driver[] {
  const positionMap = new Map<number, number>();
  for (const dp of driverPositions) {
    positionMap.set(dp.driver_number, dp.position);
  }

  return [...drivers].sort((a, b) => {
    const posA = positionMap.get(a.driver_number);
    const posB = positionMap.get(b.driver_number);

    // Both in race - sort by position
    if (posA !== undefined && posB !== undefined) {
      return posA - posB;
    }

    // Only A in race
    if (posA !== undefined) return -1;
    // Only B in race
    if (posB !== undefined) return 1;

    // Both out - sort by driver number
    return a.driver_number - b.driver_number;
  });
}

/**
 * Leaderboard - Scrollable leaderboard component for F1 race replay
 */
export const Leaderboard = memo(function Leaderboard({
  drivers,
  currentFrame,
  stints,
  selectedDriverNumber,
  onSelectDriver,
}: LeaderboardProps) {
  // Empty state - no drivers
  if (!drivers || drivers.length === 0) {
    return (
      <div className="w-full min-w-[280px] bg-[#111418] border border-white/[0.07] rounded-xl p-4">
        <div className="text-f1-silver text-sm text-center py-8">
          No driver data
        </div>
      </div>
    );
  }

  // Loading state - no frame data
  if (!currentFrame) {
    return (
      <div className="w-full min-w-[280px] bg-[#111418] border border-white/[0.07] rounded-xl p-4">
        <div className="flex items-center justify-center gap-2 py-8">
          <svg
            className="animate-spin h-4 w-4 text-f1-silver"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="text-f1-silver text-sm">Waiting for replay data...</span>
        </div>
      </div>
    );
  }

  const { driver_positions: driverPositions, lap: currentLap } = currentFrame;
  const sortedDrivers = useMemo(() => sortDrivers(drivers, driverPositions), [drivers, driverPositions]);

  const handleKeyDown = (e: React.KeyboardEvent, driverNumber: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelectDriver(driverNumber);
    }
  };

  return (
    <div className="w-full min-w-[280px] bg-[#111418] border border-white/[0.07] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-surface-dim border-b border-white/[0.1]">
        <div className="grid grid-cols-[40px_1fr_60px_50px_40px_50px] gap-2 px-3 py-2">
          <div className="text-xs uppercase tracking-wider text-f1-silver font-medium text-center">
            Pos
          </div>
          <div className="text-xs uppercase tracking-wider text-f1-silver font-medium">
            Driver
          </div>
          <div className="text-xs uppercase tracking-wider text-f1-silver font-medium text-right">
            Gap
          </div>
          <div className="text-xs uppercase tracking-wider text-f1-silver font-medium text-center">
            Tyre
          </div>
          <div className="text-xs uppercase tracking-wider text-f1-silver font-medium text-center">
            Stints
          </div>
          <div className="text-xs uppercase tracking-wider text-f1-silver font-medium text-center">
            Status
          </div>
        </div>
      </div>

      {/* Driver rows */}
      <div className="overflow-y-auto max-h-[400px]">
        {sortedDrivers.map((driver) => {
          const positionData = driverPositions.find(
            (dp) => dp.driver_number === driver.driver_number
          );
          const isOut = isDriverOut(driver.driver_number, driverPositions);
          const position = positionData?.position ?? null;
          const gap = positionData?.gap_to_leader;
          const currentStint = getCurrentStint(
            driver.driver_number,
            stints,
            currentLap
          );
          const stintCount = countStints(driver.driver_number, stints);
          const tyreLife = calculateTyreLife(currentStint, currentLap);
          const tyreStyle = getTyreStyle(currentStint?.compound);
          const teamColor = driver.team_colour || '#888888';
          const isSelected = selectedDriverNumber === driver.driver_number;

          return (
            <div
              key={driver.driver_number}
              role="button"
              tabIndex={0}
              onClick={() => onSelectDriver(driver.driver_number)}
              onKeyDown={(e) => handleKeyDown(e, driver.driver_number)}
              aria-current={isSelected ? "true" : undefined}
              aria-pressed={isSelected}
              className={cn(
                'relative grid grid-cols-[40px_1fr_60px_50px_40px_50px] gap-2 px-3 py-3 cursor-pointer transition-colors duration-150',
                isSelected
                  ? 'bg-white/[0.08] border-l-2 border-l-f1-red'
                  : 'hover:bg-white/[0.04]',
                isOut && 'opacity-60'
              )}
            >
              {/* Team color bar */}
              <div
                className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                style={{ backgroundColor: `#${teamColor.replace('#', '')}` }}
              />

              {/* Position */}
              <div className="flex items-center justify-center">
                <span className="font-mono font-bold text-f1-white text-sm">
                  {position !== null ? position : '—'}
                </span>
              </div>

              {/* Driver info */}
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-bold text-f1-white text-sm whitespace-nowrap">
                  {driver.name_acronym}
                </span>
                <span className="text-f1-silver text-xs truncate">
                  {driver.last_name}
                </span>
              </div>

              {/* Gap to leader */}
              <div className="flex items-center justify-end">
                <span className="font-mono text-f1-white text-sm">
                  {formatGap(gap)}
                </span>
              </div>

              {/* Tyre compound */}
              <div className="flex flex-col items-center gap-1">
                <span
                  className={cn(
                    'inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold',
                    tyreStyle.bg,
                    tyreStyle.text
                  )}
                >
                  {tyreStyle.label}
                </span>
                {/* Tyre life bar */}
                {tyreLife !== null && (
                  <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all', getTyreLifeColor(tyreLife))}
                      style={{ width: `${ tyreLife}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Stint count */}
              <div className="flex items-center justify-center">
                <span className="text-f1-silver text-sm">
                  {stintCount > 0 ? stintCount : '—'}
                </span>
              </div>

              {/* Status */}
              <div className="flex items-center justify-center">
                {isOut && (
                  <span className="bg-red-900/60 text-red-300 rounded-full px-2 py-0.5 text-xs">
                    OUT
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default Leaderboard;