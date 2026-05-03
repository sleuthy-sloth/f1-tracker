'use client';

import { useMemo } from 'react';

/**
 * PU component usage limits per F1 regulations
 */
const COMPONENT_LIMITS = {
  ice: 4,
  turbo: 4,
  mguh: 4,
  mguk: 4,
  es: 2,
  ce: 2,
  exhaust: 8,
} as const;

/**
 * PuComponentCounts - PU component usage counts per driver
 */
export interface PuComponentCounts {
  ice: number;
  turbo: number;
  mguh: number;
  mguk: number;
  es: number;
  ce: number;
  exhaust: number;
}

/**
 * PuUsageEntry - Single driver's PU component usage
 */
export interface PuUsageEntry {
  driverNumber: number;
  driverAcronym: string;
  teamColour: string;
  components: PuComponentCounts;
}

/**
 * PuUsageTableProps
 */
export interface PuUsageTableProps {
  entries: PuUsageEntry[];
  isLoading?: boolean;
  className?: string;
}

/**
 * cn() - Simple utility to merge classNames
 */
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Get color class based on count vs limit
 */
function getComponentColor(count: number, limit: number): {
  bgClass: string;
  textClass: string;
} {
  if (count <= limit - 1) {
    return { bgClass: 'bg-green-500/15', textClass: 'text-green-400' };
  }
  if (count <= limit) {
    return { bgClass: 'bg-yellow-500/15', textClass: 'text-yellow-400' };
  }
  return { bgClass: 'bg-red-500/15', textClass: 'text-red-400' };
}

/**
 * Get overall status for a driver
 */
function getDriverStatus(components: PuComponentCounts): {
  status: 'OK' | 'WARN' | 'PENALTY';
  textClass: string;
} {
  let hasPenalty = false;
  let hasWarning = false;

  for (const [key, limit] of Object.entries(COMPONENT_LIMITS)) {
    const count = components[key as keyof PuComponentCounts];
    if (count > limit) {
      hasPenalty = true;
    } else if (count >= limit) {
      hasWarning = true;
    }
  }

  if (hasPenalty) {
    return { status: 'PENALTY', textClass: 'text-red-400' };
  }
  if (hasWarning) {
    return { status: 'WARN', textClass: 'text-yellow-400' };
  }
  return { status: 'OK', textClass: 'text-green-400' };
}

/**
 * Loading skeleton
 */
function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="animate-pulse bg-white/[0.05] rounded h-12 w-full"
        />
      ))}
    </div>
  );
}

/**
 * Empty state
 */
function EmptyState() {
  return (
    <div className="flex items-center justify-center py-12">
      <p className="text-f1-silver text-sm">No PU component data available</p>
    </div>
  );
}

/**
 * PuUsageTable - Displays PU component usage per driver
 * Shows ICE, Turbo, MGU-H, MGU-K, ES, CE, Exhaust usage with color-coded indicators
 */
export default function PuUsageTable({
  entries,
  isLoading = false,
  className,
}: PuUsageTableProps) {
  const sortedEntries = useMemo(() => {
    return [...entries].sort((a, b) => a.driverNumber - b.driverNumber);
  }, [entries]);

  const componentKeys: (keyof PuComponentCounts)[] = [
    'ice',
    'turbo',
    'mguh',
    'mguk',
    'es',
    'ce',
    'exhaust',
  ];

  const componentLabels: Record<keyof PuComponentCounts, string> = {
    ice: 'ICE',
    turbo: 'Turbo',
    mguh: 'MGU-H',
    mguk: 'MGU-K',
    es: 'ES',
    ce: 'CE',
    exhaust: 'Exhaust',
  };

  return (
    <div
      className={cn(
        'bg-white/[0.05] backdrop-blur-xl border border-white/[0.1] rounded-xl overflow-hidden',
        className
      )}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/[0.1]">
        <h2 className="text-xs uppercase tracking-widest text-f1-silver font-medium">
          POWER UNIT USAGE
        </h2>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-[60px_1fr_repeat(7,60px)_80px] px-4 py-2 bg-surface/80 backdrop-blur-md border-b border-white/[0.1] text-xs text-f1-silver uppercase">
        <span>#</span>
        <span>Driver</span>
        {componentKeys.map((key) => (
          <span key={key} className="text-center">
            {componentLabels[key]}
          </span>
        ))}
        <span className="text-center">Status</span>
      </div>

      {/* Data Rows */}
      <div className="relative">
        {isLoading ? (
          <div className="p-4">
            <LoadingSkeleton />
          </div>
        ) : sortedEntries.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="flex flex-col">
            {sortedEntries.map((entry) => {
              const status = getDriverStatus(entry.components);

              return (
                <div
                  key={entry.driverNumber}
                  className={cn(
                    'relative grid grid-cols-[60px_1fr_repeat(7,60px)_80px] items-center',
                    'px-4 py-3 hover:bg-white/[0.04] transition border-b border-white/[0.05]'
                  )}
                >
                  {/* Team color bar */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                    style={{ backgroundColor: entry.teamColour }}
                  />

                  {/* Driver number */}
                  <span className="text-f1-silver text-sm font-medium">
                    {entry.driverNumber}
                  </span>

                  {/* Driver acronym */}
                  <span className="font-bold text-f1-white text-sm">
                    {entry.driverAcronym}
                  </span>

                  {/* Component counts */}
                  {componentKeys.map((key) => {
                    const count = entry.components[key];
                    const limit = COMPONENT_LIMITS[key];
                    const color = getComponentColor(count, limit);

                    return (
                      <div
                        key={key}
                        className={cn(
                          'flex items-center justify-center rounded px-2 py-1',
                          color.bgClass
                        )}
                      >
                        <span className={cn('text-xs font-medium', color.textClass)}>
                          {count}/{limit}
                        </span>
                      </div>
                    );
                  })}

                  {/* Status */}
                  <div className="flex justify-center">
                    <span
                      className={cn(
                        'text-xs font-bold px-2 py-1 rounded',
                        status.textClass,
                        status.status === 'OK' && 'bg-green-500/15',
                        status.status === 'WARN' && 'bg-yellow-500/15',
                        status.status === 'PENALTY' && 'bg-red-500/15'
                      )}
                    >
                      {status.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}