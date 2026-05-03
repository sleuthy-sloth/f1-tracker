import { getSessions, getDrivers, getChampionshipDrivers, getChampionshipTeams, getAvailableYears } from '@/lib/api/openf1';
import StandingsClient from './StandingsClient';
import type { Driver, ChampionshipDriver, ChampionshipTeam, Session } from '@/lib/types';

interface StandingsPageProps {
  searchParams: Promise<{ year?: string }>;
}

export default async function StandingsPage({ searchParams }: StandingsPageProps) {
  const params = await searchParams;

  // Step 1: Get available years
  let availableYears: number[] = [];
  try {
    availableYears = await getAvailableYears();
  } catch {
    availableYears = [];
  }

  const currentYear = new Date().getFullYear();
  const parsedYear = params.year ? parseInt(params.year) : undefined;
  const selectedYear = parsedYear !== undefined && !isNaN(parsedYear)
    ? parsedYear
    : (availableYears.length > 0 ? availableYears[0] : currentYear);

  // Step 2: Get all sessions for the selected year
  let sessions: Session[] = [];
  try {
    sessions = await getSessions({ year: selectedYear });
  } catch {
    sessions = [];
  }

  // Step 3: Find the most recent Race session
  const raceSessions = sessions.filter((s) => s.session_type === 'Race');
  const sortedRaceSessions = raceSessions.sort(
    (a, b) => new Date(b.date_start).getTime() - new Date(a.date_start).getTime()
  );
  const latestRaceSession = sortedRaceSessions[0];

  // Step 4-7: Fetch championship data or use empty arrays
  let driverStandings: ChampionshipDriver[] = [];
  let teamStandings: ChampionshipTeam[] = [];
  let drivers: Driver[] = [];

  if (latestRaceSession) {
    const sessionKey = latestRaceSession.session_key;

    try {
      driverStandings = await getChampionshipDrivers({ session_key: sessionKey });
    } catch {
      driverStandings = [];
    }

    try {
      teamStandings = await getChampionshipTeams({ session_key: sessionKey });
    } catch {
      teamStandings = [];
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      drivers = await (getDrivers as any)({ session_key: sessionKey });
    } catch {
      drivers = [];
    }
  }

  return (
    <div className="p-6">
      {/* Year Selector */}
      <div className="flex items-center gap-2 mb-8">
        <h1 className="font-heading text-2xl font-bold text-f1-white">CHAMPIONSHIP</h1>
        <span className="text-f1-silver font-medium ml-2">{selectedYear}</span>
        <div className="flex gap-1 ml-auto">
          {availableYears.map((year) => (
            <a
              key={year}
              href={`/standings?year=${year}`}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                year === selectedYear
                  ? 'bg-f1-red text-white'
                  : 'bg-white/10 text-f1-silver hover:text-f1-white hover:bg-white/15'
              }`}
            >
              {year}
            </a>
          ))}
        </div>
      </div>

      {/* Error state: No session found */}
      {!latestRaceSession && sessions.length > 0 && (
        <div className="text-center py-12">
          <p className="text-f1-silver text-lg">
            No session data available for {selectedYear}
          </p>
        </div>
      )}

      {/* Error state: No standings */}
      {latestRaceSession && driverStandings.length === 0 && teamStandings.length === 0 && (
        <div className="text-center py-12">
          <p className="text-f1-silver text-lg">
            No championship standings available
          </p>
        </div>
      )}

      {/* Standings */}
      {latestRaceSession && (driverStandings.length > 0 || teamStandings.length > 0) && (
        <StandingsClient
          driverStandings={driverStandings}
          teamStandings={teamStandings}
          drivers={drivers}
        />
      )}

      {/* Empty state: No sessions at all */}
      {sessions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-f1-silver text-lg">
            No race data available for {selectedYear}
          </p>
        </div>
      )}
    </div>
  );
}