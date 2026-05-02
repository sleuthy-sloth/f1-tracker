'use client';

import type { Driver, ReplayFrame } from '@/lib/types';

/**
 * cn() - Simple utility to merge classNames
 * Filters out falsy values for cleaner className strings
 */
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * GapChartProps - Props for GapChart component
 */
interface GapChartProps {
  /** Current replay frame with driver positions */
  currentFrame: ReplayFrame | null;
  /** All available drivers */
  drivers: Driver[];
  /** Selected driver numbers to display gaps for */
  selectedDriverNumbers: number[];
  /** Optional className for container */
  className?: string;
}

/**
 * ParsedGapData - parsed gap value with display info
 */
interface ParsedGapData {
  driver_number: number;
  name_acronym: string;
  team_colour: string;
  gap_value: number | null;
  display_text: string;
  is_lapped: boolean;
}

/**
 * parseGapValue - parses gap_to_leader value into display format
 */
function parseGapValue(gap: number | string | null | undefined): ParsedGapData['gap_value'] {
  if (gap === null || gap === undefined) {
    return null;
  }
  if (typeof gap === 'string') {
    // String values like "LAP" indicate lapped
    return null;
  }
  return gap;
}

/**
 * formatGap - formats gap value for display
 */
function formatGap(gap: number | null, isLapped: boolean): string {
  if (isLapped) {
    return 'LAP';
  }
  if (gap === null) {
    return '--';
  }
  if (gap < 1) {
    return gap.toFixed(3);
  }
  if (gap < 10) {
    return gap.toFixed(2);
  }
  return gap.toFixed(1);
}

/**
 * GapChart - Gap to leader visualization panel
 * Displays current gaps to leader for selected drivers as horizontal bars
 */
export default function GapChart({
  currentFrame,
  drivers,
  selectedDriverNumbers,
  className,
}: GapChartProps) {
  // State 1: No race data
  if (currentFrame === null) {
    return (
      <div
        className={cn(
          'w-[280px] bg-white/[0.05] backdrop-blur-xl border border-white/[0.1] rounded-xl p-4',
          className
        )}
      >
        <h3 className="text-[10px] uppercase tracking-widest text-f1-silver mb-4">
          Gap to Leader
        </h3>
        <div className="flex items-center justify-center h-24 text-f1-silver/60 text-sm">
          No race data
        </div>
      </div>
    );
  }

  // State 2: No drivers selected
  if (selectedDriverNumbers.length === 0) {
    return (
      <div
        className={cn(
          'w-[280px] bg-white/[0.05] backdrop-blur-xl border border-white/[0.1] rounded-xl p-4',
          className
        )}
      >
        <h3 className="text-[10px] uppercase tracking-widest text-f1-silver mb-4">
          Gap to Leader
        </h3>
        <div className="flex items-center justify-center h-24 text-f1-silver/60 text-sm">
          Select drivers to view gaps
        </div>
      </div>
    );
  }

  // Build driver lookup map
  const driverMap = new Map<number, Driver>();
  drivers.forEach((driver) => {
    driverMap.set(driver.driver_number, driver);
  });

  // Parse gap data for selected drivers
  const gapDataList: ParsedGapData[] = selectedDriverNumbers
    .map((driverNumber) => {
      const driver = driverMap.get(driverNumber);
      if (!driver) return null;

      const position = currentFrame.driver_positions.find(
        (p) => p.driver_number === driverNumber
      );
      const gap = position?.gap_to_leader;
      const parsedGap = parseGapValue(gap);
      const isLapped = typeof gap === 'string' && gap === 'LAP';

      return {
        driver_number: driverNumber,
        name_acronym: driver.name_acronym,
        team_colour: driver.team_colour,
        gap_value: parsedGap,
        display_text: formatGap(parsedGap, isLapped),
        is_lapped: isLapped,
      };
    })
    .filter((d): d is ParsedGapData => d !== null);

  // State 3: No gap data available
  const hasValidGapData = gapDataList.some((d) => d.gap_value !== null);
  if (!hasValidGapData) {
    return (
      <div
        className={cn(
          'w-[280px] bg-white/[0.05] backdrop-blur-xl border border-white/[0.1] rounded-xl p-4',
          className
        )}
      >
        <h3 className="text-[10px] uppercase tracking-widest text-f1-silver mb-4">
          Gap to Leader
        </h3>
        <div className="flex items-center justify-center h-24 text-f1-silver/60 text-sm">
          Gap data not available
        </div>
      </div>
    );
  }

  // Find max gap for normalization (exclude leader with 0 gap)
  const nonLeaderGaps = gapDataList
    .filter((d) => d.gap_value !== null && d.gap_value > 0)
    .map((d) => d.gap_value as number);
  const maxGap = nonLeaderGaps.length > 0 ? Math.max(...nonLeaderGaps) : 30;
  const normalizedMax = Math.max(maxGap, 5); // Minimum 5 seconds scale

  // Sort by gap value (leader first)
  const sortedGapData = [...gapDataList].sort((a, b) => {
    if (a.gap_value === null && b.gap_value === null) return 0;
    if (a.gap_value === null) return -1;
    if (b.gap_value === null) return 1;
    return a.gap_value - b.gap_value;
  });

  return (
    <div
      className={cn(
        'w-[280px] bg-white/[0.05] backdrop-blur-xl border border-white/[0.1] rounded-xl p-4',
        className
      )}
    >
      <h3 className="text-[10px] uppercase tracking-widest text-f1-silver mb-4">
        Gap to Leader
      </h3>

      <div className="space-y-2">
        {sortedGapData.map((data) => {
          // Calculate bar width (proportional to gap)
          const isLeader = data.gap_value === 0 || data.gap_value === null;
          const barWidthPercent = isLeader
            ? 0
            : Math.min(((data.gap_value as number) / normalizedMax) * 100, 100);

          return (
            <div
              key={data.driver_number}
              className={cn(
                'flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors',
                isLeader ? 'bg-white/[0.08]' : 'hover:bg-white/[0.04]',
                isLeader && 'border-l-2'
              )}
              style={
                isLeader
                  ? { borderLeftColor: data.team_colour }
                  : undefined
              }
            >
              {/* Team color dot */}
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: data.team_colour }}
              />

              {/* Driver name */}
              <span className="text-xs font-medium text-white w-8 flex-shrink-0">
                {data.name_acronym}
              </span>

              {/* Gap bar */}
              <div className="flex-1 h-4 bg-white/[0.1] rounded-full overflow-hidden">
                {barWidthPercent > 0 && (
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${barWidthPercent}%`,
                      backgroundColor: data.team_colour,
                    }}
                  />
                )}
              </div>

              {/* Gap value */}
              <span
                className={cn(
                  'text-xs font-mono tabular-nums flex-shrink-0 w-12 text-right',
                  data.is_lapped
                    ? 'text-red-500'
                    : isLeader
                    ? 'text-f1-green'
                    : 'text-white'
                )}
              >
                {data.display_text}
              </span>
            </div>
          );
        })}
      </div>

      {/* Scale indicator */}
      <div className="mt-3 pt-3 border-t border-white/[0.1]">
        <div className="flex items-center justify-between text-[10px] text-f1-silver/50">
          <span>0s</span>
          <span>{normalizedMax.toFixed(0)}s</span>
        </div>
        <div className="mt-1 h-1 bg-white/[0.1] rounded-full overflow-hidden">
          <div
            className="h-full bg-white/[0.2] rounded-full"
            style={{ width: '100%' }}
          />
        </div>
      </div>
    </div>
  );
}