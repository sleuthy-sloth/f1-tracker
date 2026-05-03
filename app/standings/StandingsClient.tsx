'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import StandingsTable from '@/components/StandingsTable';
import type { ChampionshipDriver, ChampionshipTeam, Driver } from '@/lib/types';

/**
 * ViewToggle - Client-side toggle between Drivers and Constructors views
 */
function ViewToggle({
  view,
  onChange,
}: {
  view: 'drivers' | 'constructors';
  onChange: (v: 'drivers' | 'constructors') => void;
}) {
  return (
    <div className="flex gap-2 mb-6">
      <button
        onClick={() => onChange('drivers')}
        className={`px-4 py-2 rounded-lg font-medium transition-all ${
          view === 'drivers'
            ? 'bg-f1-red/20 text-f1-red border border-f1-red/30'
            : 'bg-white/[0.05] text-f1-silver hover:bg-white/[0.1] hover:text-f1-white'
        }`}
      >
        Drivers
      </button>
      <button
        onClick={() => onChange('constructors')}
        className={`px-4 py-2 rounded-lg font-medium transition-all ${
          view === 'constructors'
            ? 'bg-f1-red/20 text-f1-red border border-f1-red/30'
            : 'bg-white/[0.05] text-f1-silver hover:bg-white/[0.1] hover:text-f1-white'
        }`}
      >
        Constructors
      </button>
    </div>
  );
}

/**
 * StandingsClient - Client wrapper for interactive toggle
 */
function StandingsClient({
  driverStandings,
  teamStandings,
  drivers,
}: {
  driverStandings: ChampionshipDriver[];
  teamStandings: ChampionshipTeam[];
  drivers: Driver[];
}) {
  const [view, setView] = useState<'drivers' | 'constructors'>('drivers');

  return (
    <Card glow="cyan" variant="glass" padding="none" className="max-w-4xl mx-auto">
      <ViewToggle view={view} onChange={setView} />
      <StandingsTable
        driverStandings={driverStandings}
        teamStandings={teamStandings}
        drivers={drivers}
        view={view}
      />
    </Card>
  );
}

export default StandingsClient;