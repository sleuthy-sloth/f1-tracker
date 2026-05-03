'use client';

import { useMemo } from 'react';
import type { ChampionshipDriver, ChampionshipTeam, Driver } from '@/lib/types';

/**
 * cn() - Simple utility to merge classNames
 */
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Podium medal colors for top 3 positions
 */
const POSITION_COLORS: Record<number, string> = {
  1: '#FFD700',
  2: '#C0C0C0',
  3: '#CD7F32',
};

/**
 * Loading skeleton rows
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
 * Empty state message
 */
function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center py-12">
      <p className="text-f1-silver text-sm">{message}</p>
    </div>
  );
}

/**
 * StandingsTableProps
 */
interface StandingsTableProps {
  driverStandings: ChampionshipDriver[];
  teamStandings: ChampionshipTeam[];
  drivers: Driver[];
  isLoading?: boolean;
  view: 'drivers' | 'constructors';
  className?: string;
}

/**
 * StandingsTable - Championship standings display component
 * Displays driver or constructor championship standings in a glassmorphic card
 */
export default function StandingsTable({
  driverStandings,
  teamStandings,
  drivers,
  isLoading = false,
  view,
  className,
}: StandingsTableProps) {
  const sortedDriverStandings = useMemo(() => {
    return [...driverStandings].sort((a, b) => a.position_current - b.position_current);
  }, [driverStandings]);

  const sortedTeamStandings = useMemo(() => {
    return [...teamStandings].sort((a, b) => a.position_current - b.position_current);
  }, [teamStandings]);

  const getDriverInfo = (driverNumber: number): Driver | undefined => {
    return drivers.find((d) => d.driver_number === driverNumber);
  };

  const getTeamColor = (teamName: string): string => {
    const driver = drivers.find((d) => d.team_name === teamName);
    return driver?.team_colour || '#666';
  };

  const renderDriverRow = (standing: ChampionshipDriver) => {
    const driverInfo = getDriverInfo(standing.driver_number);
    const position = standing.position_current;
    const positionColor = POSITION_COLORS[position] || 'rgba(255,255,255,0.2)';

    return (
      <div
        key={standing.driver_number}
        className={cn(
          'relative grid grid-cols-[40px_1fr_80px_60px_60px] items-center',
          'px-4 py-3 hover:bg-white/[0.04] transition border-b border-white/[0.05]'
        )}
      >
        <div
          className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
          style={{ backgroundColor: driverInfo?.team_colour || '#666' }}
        />
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
          style={{ backgroundColor: positionColor, color: position <= 3 ? '#000' : '#fff' }}
        >
          {position}
        </div>
        <div className="pl-2">
          <span className="font-bold text-f1-white text-sm">
            {driverInfo?.name_acronym || `#${standing.driver_number}`}
          </span>
          <div className="text-xs text-f1-silver">
            {driverInfo?.full_name || driverInfo?.broadcast_name || `Driver #${standing.driver_number}`}
          </div>
        </div>
        <div className="text-lg font-bold text-f1-white text-right">
          {standing.points_current}
        </div>
        <div className="text-center text-f1-silver text-sm">—</div>
        <div className="text-center text-f1-silver text-sm">—</div>
      </div>
    );
  };

  const renderConstructorRow = (standing: ChampionshipTeam) => {
    const position = standing.position_current;
    const positionColor = POSITION_COLORS[position] || 'rgba(255,255,255,0.2)';
    const pointsChange = standing.points_current - standing.points_start;

    return (
      <div
        key={standing.team_name}
        className={cn(
          'relative grid grid-cols-[40px_1fr_100px] items-center',
          'px-4 py-3 hover:bg-white/[0.04] transition border-b border-white/[0.05]'
        )}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
          style={{ backgroundColor: positionColor, color: position <= 3 ? '#000' : '#fff' }}
        >
          {position}
        </div>
        <div className="pl-2 flex items-center gap-3">
          <div
            className="w-1 h-10 rounded-full"
            style={{ backgroundColor: getTeamColor(standing.team_name) }}
          />
          <span className="font-bold text-f1-white">{standing.team_name}</span>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-f1-white">
            {standing.points_current}
          </div>
          {pointsChange !== 0 && (
            <div
              className={cn(
                'text-xs font-medium',
                pointsChange > 0 ? 'text-green-400' : 'text-red-400'
              )}
            >
              {pointsChange > 0 ? '+' : ''}{pointsChange}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className={cn(
        'bg-white/[0.05] backdrop-blur-xl border border-white/[0.1] rounded-xl overflow-hidden',
        className
      )}
    >
      <div className="px-4 py-3 border-b border-white/[0.1]">
        <h2 className="text-xs uppercase tracking-widest text-f1-silver font-medium">
          {view === 'drivers' ? 'DRIVER STANDINGS' : 'CONSTRUCTOR STANDINGS'}
        </h2>
      </div>

      {view === 'drivers' && (
        <div className="grid grid-cols-[40px_1fr_80px_60px_60px] px-4 py-2 bg-surface/80 backdrop-blur-md border-b border-white/[0.1] text-xs text-f1-silver uppercase">
          <span>Pos</span>
          <span>Driver</span>
          <span className="text-right">Pts</span>
          <span className="text-center">Wins</span>
          <span className="text-center">Podiums</span>
        </div>
      )}

      {view === 'constructors' && (
        <div className="grid grid-cols-[40px_1fr_100px] px-4 py-2 bg-surface/80 backdrop-blur-md border-b border-white/[0.1] text-xs text-f1-silver uppercase">
          <span>Pos</span>
          <span>Team</span>
          <span className="text-right">Pts</span>
        </div>
      )}

      <div className="relative">
        {isLoading ? (
          <div className="p-4">
            <LoadingSkeleton />
          </div>
        ) : view === 'drivers' ? (
          sortedDriverStandings.length === 0 ? (
            <EmptyState message="No championship data" />
          ) : (
            <div className="flex flex-col">
              {sortedDriverStandings.map((standing) => renderDriverRow(standing))}
            </div>
          )
        ) : (
          sortedTeamStandings.length === 0 ? (
            <EmptyState message="No championship data" />
          ) : (
            <div className="flex flex-col">
              {sortedTeamStandings.map((standing) => renderConstructorRow(standing))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
