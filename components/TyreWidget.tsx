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
 * TyreWidgetProps - Props for TyreWidget component
 */
interface TyreWidgetProps {
  /** All available drivers */
  drivers: Driver[];
  /** Array of stint data from API */
  stints: StintData[];
  /** Current lap from ReplayFrame.lap */
  currentLap: number;
  /** Currently selected/active driver */
  selectedDriverNumber: number | null;
  /** Optional click handler for driver selection */
  onSelectDriver?: (driverNumber: number) => void;
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
 * DriverTyreInfo - Computed tyre information for a driver
 */
interface DriverTyreInfo {
  driver_number: number;
  name_acronym: string;
  team_colour: string;
  compound: string;
  compoundStyle: { bg: string; text: string; label: string };
  tyreAge: number;
  tyreLife: number;
  stintCount: number;
}

/**
 * getTyreStyle - Get tyre style for compound
 */
function getTyreStyle(compound: string | undefined) {
  if (!compound) return DEFAULT_TYRE;
  const upper = compound.toUpperCase() as keyof typeof TYRE_COLOURS;
  return TYRE_COLOURS[upper] || DEFAULT_TYRE;
}

/**
 * getTyreLifeColor - Get tyre life color based on remaining life percentage
 */
function getTyreLifeColor(life: number): string {
  if (life > 50) return 'bg-green-500';
  if (life >= 20) return 'bg-yellow-500';
  return 'bg-red-500';
}

/**
 * getCurrentStint - Find the current active stint for a driver
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
 * getStintCount - Count total stints for a driver
 */
function getStintCount(driverNumber: number, stints: StintData[]): number {
  const uniqueStints = new Set(
    stints.filter((s) => s.driver_number === driverNumber).map((s) => s.stint_number)
  );
  return uniqueStints.size;
}

/**
 * calculateTyreLife - Calculate remaining tyre life percentage
 */
function calculateTyreLife(tyeAge: number): number {
  return Math.max(0, 100 - Math.min(100, (tyeAge / TYPICAL_STINT_LENGTH) * 100));
}

/**
 * computeDriverTyreInfo - Compute tyre information for a single driver
 */
function computeDriverTyreInfo(
  driver: Driver,
  stints: StintData[],
  currentLap: number
): DriverTyreInfo {
  const currentStint = getCurrentStint(driver.driver_number, stints, currentLap);
  const compound = currentStint?.compound || 'UNKNOWN';
  const tyreAge = currentStint ? currentLap - currentStint.lap_start : 0;
  const tyreLife = calculateTyreLife(tyreAge);
  const stintCount = getStintCount(driver.driver_number, stints);

  return {
    driver_number: driver.driver_number,
    name_acronym: driver.name_acronym,
    team_colour: driver.team_colour,
    compound,
    compoundStyle: getTyreStyle(compound),
    tyreAge,
    tyreLife,
    stintCount,
  };
}

/**
 * TyreWidget - Tyre degradation heatmap/visualization for race replay
 * Displays tyre status for all drivers in a glassmorphic side panel
 */
export default function TyreWidget({
  drivers,
  stints,
  currentLap,
  selectedDriverNumber,
  onSelectDriver,
  className,
}: TyreWidgetProps) {
  // State 1: No drivers
  if (!drivers || drivers.length === 0) {
    return (
      <div
        className={cn(
          'w-[280px] bg-[#111418] border border-white/[0.07] rounded-xl p-4',
          className
        )}
      >
        <h3 className="text-[10px] uppercase tracking-widest text-f1-silver mb-4">
          Tyre Status
        </h3>
        <div className="flex items-center justify-center h-24 text-f1-silver/60 text-sm">
          No driver data
        </div>
      </div>
    );
  }

  // State 2: No stints data
  if (!stints || stints.length === 0) {
    return (
      <div
        className={cn(
          'w-[280px] bg-[#111418] border border-white/[0.07] rounded-xl p-4',
          className
        )}
      >
        <h3 className="text-[10px] uppercase tracking-widest text-f1-silver mb-4">
          Tyre Status
        </h3>
        <div className="flex items-center justify-center h-24 text-f1-silver/60 text-sm">
          Tyre data not available
        </div>
      </div>
    );
  }

  // Compute tyre info for all drivers
  const driverTyreInfos: DriverTyreInfo[] = drivers.map((driver) =>
    computeDriverTyreInfo(driver, stints, currentLap)
  );

  // Sort drivers: newer tyres first (higher tyre life), then by driver number
  const sortedDriverTyreInfos = [...driverTyreInfos].sort((a, b) => {
    if (a.tyreLife !== b.tyreLife) return b.tyreLife - a.tyreLife;
    return a.driver_number - b.driver_number;
  });

  return (
    <div
      className={cn(
        'w-[280px] bg-[#111418] border border-white/[0.07] rounded-xl p-4',
        className
      )}
    >
      <h3 className="text-[10px] uppercase tracking-widest text-f1-silver mb-4">
        Tyre Status
      </h3>

      <div className="space-y-1.5">
        {sortedDriverTyreInfos.map((info) => {
          const isSelected = selectedDriverNumber === info.driver_number;

          return (
            <div
              key={info.driver_number}
              className={cn(
                'flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors cursor-pointer',
                isSelected
                  ? 'bg-white/[0.08] border-l-2'
                  : 'hover:bg-white/[0.04]',
                isSelected && 'border-l-2'
              )}
              style={
                isSelected
                  ? { borderLeftColor: info.team_colour }
                  : undefined
              }
              onClick={() => onSelectDriver?.(info.driver_number)}
            >
              {/* Team color dot */}
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: info.team_colour }}
              />

              {/* Driver name acronym */}
              <span className="text-xs font-medium text-f1-white w-7 flex-shrink-0">
                {info.name_acronym}
              </span>

              {/* Compound badge */}
              <div
                className={cn(
                  'w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0',
                  info.compoundStyle.bg,
                  info.compoundStyle.text
                )}
              >
                {info.compoundStyle.label}
              </div>

              {/* Tyre life bar */}
              <div className="flex-1 h-3 bg-white/[0.1] rounded-full overflow-hidden min-w-[60px]">
                <div
                  className={cn('h-full rounded-full transition-all duration-300', getTyreLifeColor(info.tyreLife))}
                  style={{ width: `${info.tyreLife}%` }}
                />
              </div>

              {/* Tyre life percentage */}
              <span className="text-[10px] font-mono text-f1-silver w-8 flex-shrink-0 text-right">
                {Math.round(info.tyreLife)}%
              </span>

              {/* Tyre age (laps) */}
              <span className="text-[10px] text-f1-silver/70 w-8 flex-shrink-0 text-right">
                {info.tyreAge}L
              </span>

              {/* Stint count */}
              <span className="text-[10px] text-f1-silver/50 w-5 flex-shrink-0 text-center">
                {info.stintCount}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}