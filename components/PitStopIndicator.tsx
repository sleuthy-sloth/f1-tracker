'use client';

import type { Driver, PitData, StintData } from '@/lib/types';

/**
 * cn() - Simple utility to merge classNames
 */
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * PitStopIndicatorProps
 */
interface PitStopIndicatorProps {
  drivers: Driver[];
  pitStops: PitData[];
  stints: StintData[];
  currentLap: number;
  maxEvents?: number;
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
 * Get tyre style for compound
 */
function getTyreStyle(compound: string | undefined) {
  if (!compound) return DEFAULT_TYRE;
  const upper = compound.toUpperCase() as keyof typeof TYRE_COLOURS;
  return TYRE_COLOURS[upper] || DEFAULT_TYRE;
}

/**
 * Get driver by number
 */
function getDriverByNumber(
  driverNumber: number,
  drivers: Driver[]
): Driver | undefined {
  return drivers.find((d) => d.driver_number === driverNumber);
}

/**
 * Get tyre compound fitting for a driver at a specific lap
 * Looks up the stint that started at approximately the pit exit lap
 */
function getTyreCompoundFitted(
  driverNumber: number,
  pitLap: number,
  stints: StintData[]
): string | undefined {
  if (!stints || stints.length === 0) return undefined;

  const driverStints = stints.filter((s) => s.driver_number === driverNumber);
  if (driverStints.length === 0) return undefined;

  // Find the stint that starts at or after the pit lap
  // The tyre is fitted at pit exit, which corresponds to the stint starting at that lap
  const matchingStint = driverStints.find((s) => s.lap_start === pitLap);

  if (matchingStint) {
    return matchingStint.compound;
  }

  // If no exact match, find the next stint after the pit lap
  const nextStint = driverStints.find((s) => s.lap_start > pitLap);
  if (nextStint) {
    return nextStint.compound;
  }

  // Otherwise, return the compound from the current/active stint
  const activeStint = driverStints.find(
    (s) => s.lap_start <= pitLap && (s.lap_end === null || s.lap_end >= pitLap)
  );
  return activeStint?.compound;
}

/**
 * Format stop duration safely
 */
function formatStopDuration(duration: number | null | undefined): string {
  if (duration === null || duration === undefined) {
    return '--';
  }
  if (typeof duration === 'number' && !isNaN(duration)) {
    return `${duration.toFixed(1)}s`;
  }
  return '--';
}

/**
 * Check if a pit stop is recent (within currentLap ± 3)
 */
function isRecentPitStop(pitLap: number, currentLap: number): boolean {
  return Math.abs(pitLap - currentLap) <= 3;
}

/**
 * Sort pit stops by lap number descending (newest first)
 */
function sortPitStopsByLapDesc(pitStops: PitData[]): PitData[] {
  return [...pitStops].sort((a, b) => b.lap_number - a.lap_number);
}

/**
 * Get team color as RGB string
 */
function getTeamColorHex(teamColour: string | undefined): string {
  if (!teamColour) return '#888888';
  // Convert team_colour to hex if it's a hex string already
  if (teamColour.startsWith('#')) return teamColour;
  return teamColour;
}

/**
 * PitStopIndicator - Glassmorphic side panel for pit stop events
 */
export default function PitStopIndicator({
  drivers,
  pitStops,
  stints,
  currentLap,
  maxEvents = 20,
  className,
}: PitStopIndicatorProps) {
  // Empty state: no driver data
  if (!drivers || drivers.length === 0) {
    return (
      <div
        className={cn(
          'bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4',
          className
        )}
      >
        <h3 className="text-[10px] uppercase tracking-widest text-f1-silver mb-4">
          PIT STOPS
        </h3>
        <div className="flex items-center justify-center h-24 text-f1-silver text-sm">
          No driver data
        </div>
      </div>
    );
  }

  // Empty state: no pit stops yet
  if (!pitStops || pitStops.length === 0) {
    return (
      <div
        className={cn(
          'bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4',
          className
        )}
      >
        <h3 className="text-[10px] uppercase tracking-widest text-f1-silver mb-4">
          PIT STOPS
        </h3>
        <div className="flex items-center justify-center h-24 text-f1-silver text-sm">
          No pit stops yet
        </div>
      </div>
    );
  }

  // Sort and limit pit stops (newest first)
  const sortedPitStops = sortPitStopsByLapDesc(pitStops).slice(0, maxEvents);

  return (
    <div
      className={cn(
        'bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4',
        className
      )}
    >
      <h3 className="text-[10px] uppercase tracking-widest text-f1-silver mb-4">
        PIT STOPS
      </h3>

      <div className="max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
        {sortedPitStops.map((pitStop) => {
          const driver = getDriverByNumber(pitStop.driver_number, drivers);
          const tyreCompound = getTyreCompoundFitted(
            pitStop.driver_number,
            pitStop.lap_number,
            stints
          );
          const tyreStyle = getTyreStyle(tyreCompound);
          const isRecent = isRecentPitStop(pitStop.lap_number, currentLap);

          const teamColor = getTeamColorHex(driver?.team_colour);

          return (
            <div
              key={`${pitStop.driver_number}-${pitStop.lap_number}-${pitStop.date}`}
              className={cn(
                'flex items-center gap-2 py-2 border-b border-white/10 last:border-b-0',
                isRecent && 'bg-white/5'
              )}
            >
              {/* Team color dot */}
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: teamColor }}
              />

              {/* Driver name acronym */}
              <span className="text-xs text-f1-white font-medium w-8 truncate">
                {driver?.name_acronym || '--'}
              </span>

              {/* PIT badge */}
              <span className="bg-f1-red/20 text-f1-red text-[10px] rounded px-1.5 flex-shrink-0">
                PIT
              </span>

              {/* Lap number */}
              <span className="text-xs text-f1-silver flex-shrink-0">
                Lap {pitStop.lap_number}
              </span>

              {/* Spacer */}
              <div className="flex-1" />

              {/* Tyre compound badge */}
              <div
                className={cn(
                  'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0',
                  tyreStyle.bg,
                  tyreStyle.text
                )}
              >
                {tyreStyle.label}
              </div>

              {/* Stop duration */}
              <span className="text-xs text-f1-silver w-12 text-right flex-shrink-0">
                {formatStopDuration(pitStop.stop_duration)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}