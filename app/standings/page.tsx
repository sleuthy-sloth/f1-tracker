import type { Metadata } from "next";
import {
  getSessions,
  getDrivers,
  getChampionshipDrivers,
  getChampionshipTeams,
  getSessionResult,
  getAvailableYears,
} from "@/lib/api/openf1";
import StandingsClient from "./StandingsClient";
import type { Driver, ChampionshipDriver, ChampionshipTeam, Session } from "@/lib/types";
import { SeasonSelector } from "@/components/SeasonSelector";
import { DataCard } from "@/components/DataCard";

export const metadata: Metadata = {
  title: "Championship Standings",
  description:
    "F1 driver and constructor championship standings with points progression.",
};

interface StandingsPageProps {
  searchParams: Promise<{ year?: string }>;
}

export default async function StandingsPage({ searchParams }: StandingsPageProps) {
  const params = await searchParams;
  const now = new Date();

  // Step 1: Get available years
  let availableYears: number[] = [];
  try {
    availableYears = await getAvailableYears();
  } catch {
    availableYears = [];
  }

  const currentYear = now.getFullYear();
  const parsedYear = params.year ? parseInt(params.year) : undefined;
  const selectedYear =
    parsedYear !== undefined && !isNaN(parsedYear)
      ? parsedYear
      : availableYears[0] ?? currentYear;

  // Step 2: Get all sessions for the selected year
  let sessions: Session[] = [];
  try {
    sessions = await getSessions({ year: selectedYear });
  } catch {
    sessions = [];
  }

  // Step 3: Find completed race sessions (date_start in the past), most recent first
  const completedRaceSessions = sessions
    .filter(
      (s) => s.session_type === "Race" && new Date(s.date_start) <= now
    )
    .sort(
      (a, b) =>
        new Date(b.date_start).getTime() - new Date(a.date_start).getTime()
    );

  // Step 4: Try each recent session until we get championship data
  // (some sessions may not have data published yet)
  let driverStandings: ChampionshipDriver[] = [];
  let teamStandings: ChampionshipTeam[] = [];
  let drivers: Driver[] = [];
  let usedSession: Session | null = null;

  for (const session of completedRaceSessions.slice(0, 5)) {
    try {
      const [ds, ts] = await Promise.all([
        getChampionshipDrivers({ session_key: session.session_key }).catch(() => []),
        getChampionshipTeams({ session_key: session.session_key }).catch(() => []),
      ]);

      if (ds.length > 0 || ts.length > 0) {
        driverStandings = ds;
        teamStandings = ts;
        usedSession = session;
        break;
      }
    } catch {
      // try next session
    }
  }

  // Step 5: Fetch driver info for the session we used (or the most recent)
  const driverSessionKey = usedSession?.session_key ?? completedRaceSessions[0]?.session_key;
  if (driverSessionKey) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      drivers = await (getDrivers as any)({ session_key: driverSessionKey });
    } catch {
      drivers = [];
    }
  }

  // Step 6: Compute wins & podiums per driver from session results
  // Fetch results for all completed race sessions (up to 20) in parallel, ignore failures
  const winsMap = new Map<number, number>();
  const podiumsMap = new Map<number, number>();

  if (completedRaceSessions.length > 0) {
    const resultPromises = completedRaceSessions.slice(0, 20).map((s) =>
      getSessionResult({ session_key: s.session_key }).catch(() => [])
    );
    const allResults = await Promise.all(resultPromises);

    for (const raceResults of allResults) {
      for (const r of raceResults) {
        if (r.dnf || r.dns || r.dsq) continue;
        if (r.position === 1) {
          winsMap.set(r.driver_number, (winsMap.get(r.driver_number) ?? 0) + 1);
        }
        if (r.position <= 3) {
          podiumsMap.set(r.driver_number, (podiumsMap.get(r.driver_number) ?? 0) + 1);
        }
      }
    }
  }

  const sortedDrivers = [...driverStandings].sort(
    (a, b) => a.position_current - b.position_current
  );
  const leader = sortedDrivers[0];

  return (
    <div className="p-6">
      {/* Season Selector */}
      <div className="flex items-center gap-2 mb-8">
        <h1 className="font-heading text-2xl font-bold text-f1-white">CHAMPIONSHIP</h1>
        <span className="text-f1-silver font-medium ml-2">{selectedYear}</span>
        <SeasonSelector
          years={availableYears}
          selectedYear={selectedYear}
          hrefBase="/standings?year="
          className="ml-auto"
        />
      </div>

      {/* Key Metrics */}
      {driverStandings.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <DataCard label="Drivers" value={driverStandings.length} />
          <DataCard label="Teams" value={teamStandings.length} />
          <DataCard label="Leader Points" value={leader?.points_current ?? 0} />
          <DataCard
            label="Gap to 2nd"
            value={
              sortedDrivers.length > 1
                ? `${sortedDrivers[0].points_current - sortedDrivers[1].points_current}`
                : "—"
            }
            unit="pts"
          />
        </div>
      )}

      {/* No data states */}
      {sessions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-f1-silver text-lg">No race data available for {selectedYear}</p>
        </div>
      )}

      {sessions.length > 0 && completedRaceSessions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-f1-silver text-lg">Season hasn&apos;t started yet</p>
          <p className="text-f1-silver/50 text-sm mt-2">Check back after the first race</p>
        </div>
      )}

      {completedRaceSessions.length > 0 && driverStandings.length === 0 && teamStandings.length === 0 && (
        <div className="text-center py-12">
          <p className="text-f1-silver text-lg">Championship standings not yet published</p>
          <p className="text-f1-silver/50 text-sm mt-2">
            OpenF1 may not have standings data for {selectedYear} yet
          </p>
        </div>
      )}

      {/* Standings table */}
      {(driverStandings.length > 0 || teamStandings.length > 0) && (
        <StandingsClient
          driverStandings={driverStandings}
          teamStandings={teamStandings}
          drivers={drivers}
          winsMap={Object.fromEntries(winsMap)}
          podiumsMap={Object.fromEntries(podiumsMap)}
        />
      )}
    </div>
  );
}
