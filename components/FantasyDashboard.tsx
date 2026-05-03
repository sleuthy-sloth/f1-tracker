'use client';

import { Card } from "@/components/ui/Card";
import { DataCard } from "@/components/DataCard";

/**
 * Fantasy driver interface
 */
interface FantasyDriver {
  driverNumber: number;
  nameAcronym: string;
  fullName: string;
  teamColour: string;
  cost: number;
  points: number;
}

/**
 * Fantasy constructor interface
 */
interface FantasyConstructor {
  name: string;
  cost: number;
  points: number;
  colour: string;
}

/**
 * Fantasy team interface
 */
interface FantasyTeam {
  teamName: string;
  totalPoints: number;
  budgetRemaining: number;
  drivers: FantasyDriver[];
  constructor: FantasyConstructor | null;
  pointsHistory: number[]; // Points per race weekend
}

/**
 * Fantasy dashboard props
 */
interface FantasyDashboardProps {
  team: FantasyTeam | null;
  isLoading?: boolean;
  totalBudget?: number; // Default 100
  className?: string;
}

/**
 * cn() - Simple utility to merge classNames
 */
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Loading skeleton for the fantasy dashboard
 */
function LoadingSkeleton() {
  return (
    <div className="bg-[#111418] border border-white/[0.07] rounded-xl p-4">
      {/* Team Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="animate-pulse h-8 w-48 bg-white/[0.1] rounded" />
        <div className="animate-pulse h-10 w-20 bg-white/[0.1] rounded" />
      </div>

      {/* Budget Bar */}
      <div className="mb-6">
        <div className="animate-pulse h-3 w-24 bg-white/[0.1] rounded mb-2" />
        <div className="animate-pulse h-2 w-full bg-white/[0.1] rounded-full" />
      </div>

      {/* Roster Grid */}
      <div className="mb-6">
        <div className="animate-pulse h-4 w-16 bg-white/[0.1] rounded mb-3" />
        <div className="flex gap-2 overflow-x-auto">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse w-[140px] h-24 bg-white/[0.05] rounded-lg" />
          ))}
        </div>
      </div>

      {/* Points History */}
      <div>
        <div className="animate-pulse h-4 w-32 bg-white/[0.1] rounded mb-3" />
        <div className="animate-pulse h-28 w-full bg-white/[0.05] rounded-lg" />
      </div>
    </div>
  );
}

/**
 * Empty state when no team data
 */
function EmptyTeamState({ onBuildTeam }: { onBuildTeam?: () => void }) {
  return (
    <div className="bg-[#111418] border border-white/[0.07] rounded-xl p-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-2xl font-bold text-f1-white">My Team</h2>
        <div className="flex items-center gap-2">
          <span className="text-3xl font-heading font-bold text-f1-silver">0</span>
          <span className="text-xs text-f1-silver uppercase tracking-wider">PTS</span>
        </div>
      </div>

      {/* Budget Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase tracking-widest text-f1-silver">BUDGET</span>
        </div>
        <div className="h-2 bg-white/[0.1] rounded-full overflow-hidden">
          <div className="h-full bg-green-500 rounded-full" style={{ width: '100%' }} />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-f1-silver">$100M remaining</span>
          <span className="text-xs text-f1-silver">$100M total</span>
        </div>
      </div>

      {/* Empty Roster Prompt */}
      <div className="border-t border-white/[0.1] pt-6 mt-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] uppercase tracking-widest text-f1-silver">ROSTER</span>
          <span className="text-xs text-f1-silver">0/5</span>
        </div>

        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-f1-silver text-sm mb-4">Build your fantasy team</p>
          {onBuildTeam && (
            <button
              onClick={onBuildTeam}
              className="px-4 py-2 bg-f1-red text-white rounded-lg text-sm font-medium hover:bg-f1-red/90 transition-colors"
            >
              Create Team
            </button>
          )}
        </div>
      </div>

      {/* Points History - Empty */}
      <div className="border-t border-white/[0.1] pt-6 mt-6">
        <span className="text-[10px] uppercase tracking-widest text-f1-silver block mb-3">
          POINTS HISTORY
        </span>
        <div className="h-28 bg-white/[0.03] rounded-lg flex items-center justify-center">
          <p className="text-f1-silver text-sm">No race data yet</p>
        </div>
      </div>
    </div>
  );
}

/**
 * DriverCard - Individual driver display in the roster
 */
function DriverCard({ driver }: { driver: FantasyDriver }) {
  return (
    <div className="min-w-[140px] bg-white/[0.03] rounded-lg p-3 border border-white/[0.05]">
      {/* Team color bar */}
      <div
        className="w-[3px] h-8 rounded-full mb-2"
        style={{ backgroundColor: driver.teamColour }}
      />

      {/* Name and info */}
      <div className="space-y-1">
        <p className="font-medium text-f1-white text-sm">{driver.nameAcronym}</p>
        <div className="flex items-center justify-between text-xs">
          <span className="text-f1-silver">${driver.cost}M</span>
          <span className="text-f1-white">{driver.points} PTS</span>
        </div>
      </div>
    </div>
  );
}

/**
 * ConstructorCard - Constructor display in the roster
 */
function ConstructorCard({ constructor: constr }: { constructor: FantasyConstructor }) {
  return (
    <div className="bg-white/[0.03] rounded-lg p-3 border border-white/[0.05]">
      {/* Team color bar */}
      <div
        className="w-[3px] h-6 rounded-full mb-2"
        style={{ backgroundColor: constr.colour }}
      />

      {/* Name and info */}
      <div className="space-y-1">
        <p className="font-medium text-f1-white text-sm">{constr.name}</p>
        <div className="flex items-center justify-between text-xs">
          <span className="text-f1-silver">${constr.cost}M</span>
          <span className="text-f1-white">{constr.points} PTS</span>
        </div>
      </div>
    </div>
  );
}

/**
 * PointsHistoryChart - SVG bar chart for points history
 */
function PointsHistoryChart({ pointsHistory }: { pointsHistory: number[] }) {
  const width = 300;
  const height = 120;
  const barWidth = 24;
  const padding = 8;
  const maxPoints = Math.max(...pointsHistory, 1);
  const chartHeight = height - 30;
  const barSpacing = (width - padding * 2) / pointsHistory.length;

  if (pointsHistory.length === 0) {
    return (
      <div className="h-28 bg-white/[0.03] rounded-lg flex items-center justify-center">
        <p className="text-f1-silver text-sm">No points data</p>
      </div>
    );
  }

  return (
    <div className="h-[120px] w-full">
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        {/* Y-axis grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = chartHeight * (1 - ratio);
          return (
            <line
              key={`grid-${i}`}
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              stroke="rgba(255,255,255,0.1)"
              strokeDasharray="4"
            />
          );
        })}

        {/* Bars */}
        {pointsHistory.map((points, i) => {
          const barHeight = (points / maxPoints) * chartHeight;
          const x = padding + i * barSpacing + (barSpacing - barWidth) / 2;
          const y = chartHeight - barHeight;

          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill="#E10600"
                rx="2"
              />
              {/* Round number */}
              <text
                x={x + barWidth / 2}
                y={height - 2}
                textAnchor="middle"
                fill="#9b9b9b"
                fontSize="8"
              >
                R{i + 1}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/**
 * FantasyDashboard - Main fantasy F1 team dashboard component
 *
 * Displays team name, points, budget, roster, and points history in a glassmorphic card
 */
export default function FantasyDashboard({
  team,
  isLoading = false,
  totalBudget = 100,
  className,
}: FantasyDashboardProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className={cn('max-w-2xl', className)}>
        <LoadingSkeleton />
      </div>
    );
  }

  // No team data
  if (!team) {
    return (
      <div className={cn('max-w-2xl', className)}>
        <EmptyTeamState />
      </div>
    );
  }

  // Calculate budget percentage
  const budgetPercentage = (team.budgetRemaining / totalBudget) * 100;

  // Driver count
  const driverCount = team.drivers?.length || 0;

  // Empty roster state
  const hasEmptyRoster = driverCount === 0 && !team.constructor;

  return (
    <Card glow="cyan" className={cn('p-4 max-w-2xl', className)}>
      {/* SECTION 1: Team Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-heading text-2xl font-bold text-f1-white">
            {team.teamName}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-3xl font-heading font-bold text-f1-white">
            {team.totalPoints}
          </span>
          <span className="text-xs text-f1-silver uppercase tracking-wider">PTS</span>
        </div>
      </div>

      {/* SECTION 2: Budget */}
      <DataCard
        label="Budget Remaining"
        value={`$${team.budgetRemaining}M`}
        unit={`of $${totalBudget}M`}
        trend={budgetPercentage > 50 ? "up" : budgetPercentage > 25 ? "neutral" : "down"}
        trendLabel={`${budgetPercentage.toFixed(0)}% remaining`}
        className="mb-6"
      />

      {/* SECTION 3: Roster Grid */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] uppercase tracking-widest text-f1-silver">ROSTER</span>
          <span className="text-xs text-f1-silver">
            {driverCount}/5
          </span>
        </div>

        {hasEmptyRoster ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-f1-silver text-sm mb-4">Build your team</p>
            <p className="text-f1-silver text-xs">Add drivers to start scoring points</p>
          </div>
        ) : (
          <>
            {/* Driver row */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {team.drivers?.map((driver) => (
                <DriverCard key={driver.driverNumber} driver={driver} />
              ))}
              {/* Empty driver slots */}
              {Array.from({ length: 5 - driverCount }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="min-w-[140px] h-24 bg-white/[0.02] rounded-lg border border-dashed border-white/[0.1] flex items-center justify-center"
                >
                  <span className="text-f1-silver text-xs">Empty</span>
                </div>
              ))}
            </div>

            {/* Constructor */}
            {team.constructor && (
              <div className="mt-3">
                <ConstructorCard constructor={team.constructor} />
              </div>
            )}
          </>
        )}
      </div>

      {/* SECTION 4: Points History */}
      <div className="border-t border-white/[0.1] pt-6">
        <span className="text-[10px] uppercase tracking-widest text-f1-silver block mb-3">
          POINTS HISTORY
        </span>
        <PointsHistoryChart pointsHistory={team.pointsHistory || []} />
      </div>
    </Card>
  );
}

export type { FantasyDriver, FantasyConstructor, FantasyTeam, FantasyDashboardProps };