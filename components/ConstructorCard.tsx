'use client';

import type { ChampionshipDriver, ChampionshipTeam, Driver } from '@/lib/types';

/**
 * cn() - Simple utility to merge classNames
 */
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Driver points contribution for display
 */
interface DriverContribution {
  driver: Driver;
  points: number;
  percentage: number;
  barWidth: number;
}

export interface ConstructorCardProps {
  teamStanding: ChampionshipTeam | null;
  drivers: Driver[];
  driverStandings: ChampionshipDriver[];
  isLoading?: boolean;
  className?: string;
}

/**
 * Loading skeleton for the constructor card
 */
function LoadingSkeleton() {
  return (
    <div className="bg-white/[0.05] backdrop-blur-xl border border-white/[0.1] rounded-xl p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="animate-pulse w-12 h-12 rounded-full bg-white/[0.1]" />
        <div className="flex-1">
          <div className="animate-pulse h-6 w-32 bg-white/[0.1] rounded mb-2" />
          <div className="animate-pulse h-4 w-20 bg-white/[0.1] rounded" />
        </div>
      </div>
      <div className="space-y-3 mt-6">
        <div className="animate-pulse h-10 bg-white/[0.1] rounded" />
        <div className="animate-pulse h-10 bg-white/[0.1] rounded" />
      </div>
    </div>
  );
}

/**
 * Empty state for no data
 */
function EmptyState() {
  return (
    <div className="bg-white/[0.05] backdrop-blur-xl border border-white/[0.1] rounded-xl p-6">
      <div className="flex items-center justify-center h-48">
        <p className="text-f1-silver text-sm">No championship data available</p>
      </div>
    </div>
  );
}

/**
 * Driver split bar row
 */
function DriverSplitBar({ contribution, teamColour }: { contribution: DriverContribution; teamColour: string }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: teamColour }} />
      <span className="text-xs font-medium text-f1-white w-8">
        {contribution.driver.name_acronym}
      </span>
      <div className="flex-1 flex items-center gap-2">
        <div className="flex-1 h-4 bg-white/[0.1] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              backgroundColor: teamColour,
              width: `${contribution.barWidth}%`,
            }}
          />
        </div>
        <span className="text-xs text-f1-white font-medium min-w-[40px] text-right">
          {contribution.points}
        </span>
        <span className="text-xs text-f1-silver min-w-[40px] text-right">
          {contribution.percentage.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}

/**
 * ConstructorCard - Leading constructor display with driver point split
 * 
 * Shows the championship-leading constructor with driver contribution visualization
 */
export default function ConstructorCard({
  teamStanding,
  drivers,
  driverStandings,
  isLoading = false,
  className,
}: ConstructorCardProps) {
  // Loading state
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  // Empty state
  if (!teamStanding) {
    return <EmptyState />;
  }

  // Find team drivers from the drivers list
  const teamDrivers = drivers.filter((d) => d.team_name === teamStanding.team_name);
  const teamColour = teamDrivers[0]?.team_colour || '#ffffff';

  // Calculate driver contributions
  const totalPoints = teamStanding.points_current;

  const contributions: DriverContribution[] = teamDrivers
    .map((driver) => {
      const driverStanding = driverStandings.find(
        (ds) => ds.driver_number === driver.driver_number
      );
      const points = driverStanding?.points_current || 0;
      const percentage = totalPoints > 0 ? (points / totalPoints) * 100 : 0;

      return {
        driver,
        points,
        percentage,
        barWidth: percentage,
      };
    })
    .sort((a, b) => b.points - a.points);

  const position = teamStanding.position_current;
  const isLeader = position === 1;

  return (
    <div
      className={cn(
        'bg-white/[0.05] backdrop-blur-xl border border-white/[0.1] rounded-xl p-6',
        isLeader && 'ring-1 ring-[#FFD700]/30',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        {/* Position badge */}
        <div
          className={cn(
            'w-12 h-12 rounded-full flex items-center justify-center font-heading font-bold text-sm',
            isLeader
              ? 'bg-[#FFD700] text-black'
              : 'bg-white/[0.1] text-f1-white'
          )}
        >
          P{position}
        </div>

        {/* Team info */}
        <div className="flex-1">
          <h3 className="font-heading text-xl font-bold text-f1-white">
            {teamStanding.team_name}
          </h3>
          <p className="text-sm text-f1-silver">
            {contributions.length} drivers
          </p>
        </div>

        {/* Total points */}
        <div className="text-right">
          <p className="text-3xl font-heading font-bold text-f1-white">
            {totalPoints}
          </p>
          <p className="text-xs text-f1-silver uppercase tracking-wider">pts</p>
        </div>
      </div>

      {/* Driver split bars */}
      <div className="border-t border-white/[0.1] pt-4 mt-4">
        <p className="text-[10px] uppercase tracking-widest text-f1-silver mb-3">
          Driver Points Split
        </p>

        {contributions.length > 0 ? (
          <div className="space-y-1">
            {contributions.map((contribution) => (
              <DriverSplitBar
                key={contribution.driver.driver_number}
                contribution={contribution}
                teamColour={teamColour}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-f1-silver">No driver data available</p>
        )}
      </div>
    </div>
  );
}