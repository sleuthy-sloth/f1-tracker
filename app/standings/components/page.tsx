import Link from 'next/link';
import { getSessions, getDrivers, getAvailableYears } from '@/lib/api/openf1';
import PuUsageTable from '@/components/PuUsageTable';
import type { Driver, Session } from '@/lib/types';

/**
 * Example PU usage data for demonstration
 * Since OpenF1 API doesn't provide PU components endpoint, we use mock data
 */
const EXAMPLE_PU_DATA = [
  {
    driverNumber: 1,
    driverAcronym: 'VER',
    teamColour: '#3671C6',
    components: { ice: 3, turbo: 3, mguh: 3, mguk: 2, es: 1, ce: 1, exhaust: 5 },
  },
  {
    driverNumber: 16,
    driverAcronym: 'LEC',
    teamColour: '#E8002D',
    components: { ice: 4, turbo: 4, mguh: 4, mguk: 3, es: 2, ce: 1, exhaust: 7 },
  },
  {
    driverNumber: 55,
    driverAcronym: 'SAI',
    teamColour: '#E8002D',
    components: { ice: 3, turbo: 3, mguh: 3, mguk: 2, es: 1, ce: 1, exhaust: 5 },
  },
  {
    driverNumber: 11,
    driverAcronym: 'PER',
    teamColour: '#3671C6',
    components: { ice: 4, turbo: 4, mguh: 4, mguk: 4, es: 2, ce: 2, exhaust: 8 },
  },
  {
    driverNumber: 44,
    driverAcronym: 'HAM',
    teamColour: '#27F4D2',
    components: { ice: 2, turbo: 2, mguh: 2, mguk: 1, es: 1, ce: 1, exhaust: 4 },
  },
  {
    driverNumber: 63,
    driverAcronym: 'RUS',
    teamColour: '#27F4D2',
    components: { ice: 3, turbo: 3, mguh: 3, mguk: 2, es: 1, ce: 1, exhaust: 5 },
  },
  {
    driverNumber: 4,
    driverAcronym: 'NOR',
    teamColour: '#FF8700',
    components: { ice: 3, turbo: 3, mguh: 3, mguk: 2, es: 1, ce: 1, exhaust: 5 },
  },
  {
    driverNumber: 81,
    driverAcronym: 'PIA',
    teamColour: '#FF8700',
    components: { ice: 2, turbo: 2, mguh: 2, mguk: 1, es: 1, ce: 0, exhaust: 3 },
  },
  {
    driverNumber: 14,
    driverAcronym: 'ALO',
    teamColour: '#6CD3BF',
    components: { ice: 4, turbo: 4, mguh: 4, mguk: 3, es: 2, ce: 2, exhaust: 7 },
  },
  {
    driverNumber: 31,
    driverAcronym: 'OCO',
    teamColour: '#6CD3BF',
    components: { ice: 3, turbo: 3, mguh: 3, mguk: 2, es: 1, ce: 1, exhaust: 5 },
  },
  {
    driverNumber: 10,
    driverAcronym: 'GAS',
    teamColour: '#5B8DEF',
    components: { ice: 3, turbo: 3, mguh: 3, mguk: 2, es: 1, ce: 1, exhaust: 5 },
  },
  {
    driverNumber: 30,
    driverAcronym: 'LAW',
    teamColour: '#5B8DEF',
    components: { ice: 2, turbo: 2, mguh: 2, mguk: 1, es: 1, ce: 1, exhaust: 4 },
  },
  {
    driverNumber: 23,
    driverAcronym: 'ALB',
    teamColour: '#37BEDD',
    components: { ice: 3, turbo: 3, mguh: 3, mguk: 2, es: 1, ce: 1, exhaust: 5 },
  },
  {
    driverNumber: 22,
    driverAcronym: 'TSU',
    teamColour: '#37BEDD',
    components: { ice: 2, turbo: 2, mguh: 2, mguk: 1, es: 1, ce: 0, exhaust: 3 },
  },
  {
    driverNumber: 3,
    driverAcronym: 'RIC',
    teamColour: '#B6BABD',
    components: { ice: 5, turbo: 5, mguh: 5, mguk: 4, es: 2, ce: 2, exhaust: 9 },
  },
  {
    driverNumber: 87,
    driverAcronym: 'HAR',
    teamColour: '#B6BABD',
    components: { ice: 3, turbo: 3, mguh: 3, mguk: 2, es: 1, ce: 1, exhaust: 5 },
  },
  {
    driverNumber: 24,
    driverAcronym: 'ZHO',
    teamColour: '#C92D78',
    components: { ice: 3, turbo: 3, mguh: 3, mguk: 2, es: 1, ce: 1, exhaust: 5 },
  },
  {
    driverNumber: 77,
    driverAcronym: 'BOT',
    teamColour: '#C92D78',
    components: { ice: 3, turbo: 3, mguh: 3, mguk: 2, es: 1, ce: 1, exhaust: 5 },
  },
  {
    driverNumber: 20,
    driverAcronym: 'MAG',
    teamColour: '#DA291C',
    components: { ice: 4, turbo: 4, mguh: 4, mguk: 3, es: 2, ce: 2, exhaust: 8 },
  },
  {
    driverNumber: 6,
    driverAcronym: 'LAT',
    teamColour: '#DA291C',
    components: { ice: 2, turbo: 2, mguh: 2, mguk: 1, es: 1, ce: 1, exhaust: 4 },
  },
];

interface ComponentsPageProps {
  searchParams: Promise<{ year?: string }>;
}

export default async function ComponentsPage({ searchParams }: ComponentsPageProps) {
  const params = await searchParams;

  // Get available years
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

  // Get sessions for the selected year
  let sessions: Session[] = [];
  try {
    sessions = await getSessions({ year: selectedYear });
  } catch {
    sessions = [];
  }

  // Find the most recent Race session
  const raceSessions = sessions.filter((s) => s.session_type === 'Race');
  const sortedRaceSessions = raceSessions.sort(
    (a, b) => new Date(b.date_start).getTime() - new Date(a.date_start).getTime()
  );
  const latestRaceSession = sortedRaceSessions[0];

  // Fetch drivers for team colors
  let drivers: Driver[] = [];
  if (latestRaceSession) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      drivers = await (getDrivers as any)({ session_key: latestRaceSession.session_key });
    } catch {
      drivers = [];
    }
  }

  // Create driver lookup for team colors
  const driverColorMap = new Map<number, string>();
  drivers.forEach((driver) => {
    driverColorMap.set(driver.driver_number, driver.team_colour || '#666666');
  });

  // Merge example data with actual team colors from API
  const puEntries = EXAMPLE_PU_DATA.map((entry) => ({
    ...entry,
    teamColour: driverColorMap.get(entry.driverNumber) || entry.teamColour,
  }));

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-8">
        <Link
          href="/standings"
          className="text-f1-silver hover:text-f1-white transition-colors text-sm"
        >
          ← Back
        </Link>
        <h1 className="font-heading text-2xl font-bold text-f1-white ml-4">
          POWER UNIT COMPONENTS
        </h1>
        <span className="text-f1-silver font-medium ml-2">{selectedYear}</span>
        <div className="flex gap-1 ml-auto">
          {availableYears.map((year) => (
            <a
              key={year}
              href={`/standings/components?year=${year}`}
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

      {/* Description */}
      <div className="mb-6">
        <p className="text-f1-silver text-sm">
          Power Unit component usage for each driver. Components approaching or exceeding
          season limits may incur penalties.
        </p>
      </div>

      {/* PU Usage Table */}
      <PuUsageTable entries={puEntries} />

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-green-500/30" />
          <span className="text-f1-silver">Safe (&lt; limit)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-yellow-500/30" />
          <span className="text-f1-silver">Warning (at limit)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-red-500/30" />
          <span className="text-f1-silver">Penalty (exceeded)</span>
        </div>
      </div>
    </div>
  );
}