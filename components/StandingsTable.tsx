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
    <div className="flex flex-col gap-2 p-4">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="animate-pulse bg-white/[0.03] rounded-lg h-14 w-full"
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
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-f1-silver/30">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      </div>
      <p className="text-f1-silver/60 font-medium">{message}</p>
    </div>
  );
}

interface StandingsTableProps {
  driverStandings: ChampionshipDriver[];
  teamStandings: ChampionshipTeam[];
  drivers: Driver[];
  isLoading?: boolean;
  view: 'drivers' | 'constructors';
  className?: string;
}

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
    return driver?.team_colour || '#333';
  };

  const renderDriverRow = (standing: ChampionshipDriver) => {
    const driverInfo = getDriverInfo(standing.driver_number);
    const position = standing.position_current;
    const positionColor = POSITION_COLORS[position];

    return (
      <div
        key={standing.driver_number}
        className={cn(
          'group relative grid grid-cols-[60px_1fr_100px_80px_80px] items-center',
          'px-6 py-4 hover:bg-white/[0.03] transition-all duration-200 border-b border-white/[0.03]'
        )}
      >
        {/* Team Color Accent Line */}
        <div
          className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r-sm"
          style={{ backgroundColor: driverInfo?.team_colour || '#333' }}
        />
        
        {/* Position */}
        <div className="flex justify-start">
          <div
            className={cn(
              "w-8 h-8 rounded-md flex items-center justify-center font-bold text-sm transition-all",
              positionColor ? "bg-opacity-20 shadow-lg" : "bg-white/5"
            )}
            style={{ 
              backgroundColor: positionColor ? `${positionColor}20` : undefined,
              color: positionColor || '#fff',
              border: positionColor ? `1px solid ${positionColor}40` : '1px solid rgba(255,255,255,0.05)'
            }}
          >
            {position}
          </div>
        </div>

        {/* Driver Info */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-heading text-sm font-bold text-f1-white tracking-wide">
              {driverInfo?.full_name || driverInfo?.broadcast_name || `Driver #${standing.driver_number}`}
            </span>
            <span className="text-[10px] font-mono text-f1-silver/40 uppercase tracking-widest border border-white/5 px-1.5 rounded">
              {driverInfo?.name_acronym || standing.driver_number}
            </span>
          </div>
          <span className="text-xs text-f1-silver/60 font-medium">
            {driverInfo?.team_name || 'Independent'}
          </span>
        </div>

        {/* Points */}
        <div className="text-right">
          <span className="text-data text-xl font-bold text-f1-white tracking-tighter">
            {standing.points_current}
          </span>
        </div>

        {/* Placeholder Stats */}
        <div className="text-center text-data text-xs text-f1-silver/40">—</div>
        <div className="text-center text-data text-xs text-f1-silver/40">—</div>
      </div>
    );
  };

  const renderConstructorRow = (standing: ChampionshipTeam) => {
    const position = standing.position_current;
    const positionColor = POSITION_COLORS[position];
    const pointsChange = standing.points_current - standing.points_start;

    return (
      <div
        key={standing.team_name}
        className={cn(
          'group relative grid grid-cols-[60px_1fr_120px] items-center',
          'px-6 py-5 hover:bg-white/[0.03] transition-all duration-200 border-b border-white/[0.03]'
        )}
      >
        <div
          className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r-sm"
          style={{ backgroundColor: getTeamColor(standing.team_name) }}
        />

        <div className="flex justify-start">
          <div
            className={cn(
              "w-8 h-8 rounded-md flex items-center justify-center font-bold text-sm transition-all",
              positionColor ? "bg-opacity-20 shadow-lg" : "bg-white/5"
            )}
            style={{ 
              backgroundColor: positionColor ? `${positionColor}20` : undefined,
              color: positionColor || '#fff',
              border: positionColor ? `1px solid ${positionColor}40` : '1px solid rgba(255,255,255,0.05)'
            }}
          >
            {position}
          </div>
        </div>

        <div className="flex flex-col">
          <span className="text-heading text-base font-bold text-f1-white tracking-tight">
            {standing.team_name}
          </span>
        </div>

        <div className="flex flex-col items-end">
          <span className="text-data text-2xl font-black text-f1-white tracking-tighter leading-none">
            {standing.points_current}
          </span>
          {pointsChange !== 0 && (
            <div
              className={cn(
                'text-[10px] font-mono font-bold mt-1 px-1.5 rounded',
                pointsChange > 0 ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'
              )}
            >
              {pointsChange > 0 ? '▲' : '▼'} {Math.abs(pointsChange)} PTS
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={cn('glass-panel rounded-2xl overflow-hidden', className)}>
      {/* Table Header */}
      <div className="px-6 py-5 border-b border-white/[0.05] bg-white/[0.02] flex items-center justify-between">
        <h2 className="panel-header text-base">
          {view === 'drivers' ? 'Driver Standings' : 'Constructor Standings'}
        </h2>
        <div className="text-[10px] font-mono text-f1-silver/30 uppercase tracking-[0.2em]">
          Live Data Stream
        </div>
      </div>

      {/* Table Column Headers */}
      {view === 'drivers' && (
        <div className="grid grid-cols-[60px_1fr_100px_80px_80px] px-6 py-3 bg-white/[0.01] border-b border-white/[0.03] text-[10px] text-f1-silver/40 font-bold uppercase tracking-widest">
          <span>Pos</span>
          <span>Competitor</span>
          <span className="text-right">Points</span>
          <span className="text-center">Wins</span>
          <span className="text-center">Podiums</span>
        </div>
      )}

      {view === 'constructors' && (
        <div className="grid grid-cols-[60px_1fr_120px] px-6 py-3 bg-white/[0.01] border-b border-white/[0.03] text-[10px] text-f1-silver/40 font-bold uppercase tracking-widest">
          <span>Pos</span>
          <span>Constructor / Team</span>
          <span className="text-right">Total Points</span>
        </div>
      )}

      {/* Table Content */}
      <div className="relative">
        {isLoading ? (
          <LoadingSkeleton />
        ) : view === 'drivers' ? (
          sortedDriverStandings.length === 0 ? (
            <EmptyState message="No championship data available" />
          ) : (
            <div className="flex flex-col min-h-[400px]">
              {sortedDriverStandings.map((standing) => renderDriverRow(standing))}
            </div>
          )
        ) : (
          sortedTeamStandings.length === 0 ? (
            <EmptyState message="No championship data available" />
          ) : (
            <div className="flex flex-col min-h-[400px]">
              {sortedTeamStandings.map((standing) => renderConstructorRow(standing))}
            </div>
          )
        )}
      </div>

      {/* Table Footer */}
      <div className="px-6 py-3 bg-white/[0.02] border-t border-white/[0.05] flex justify-between items-center">
        <span className="data-label">Data via OpenF1 API</span>
        <div className="w-1.5 h-1.5 rounded-full bg-green-500/60" />
      </div>
    </div>
  );
}
