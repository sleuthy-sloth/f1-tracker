import { getSessions, getDrivers, getSessionResult } from "@/lib/api/openf1";
import { Button } from "@/components/ui/Button";
import type { Session, Driver, SessionResult } from "@/lib/types";
import Link from "next/link";

interface SessionPageProps {
  params: Promise<{ sessionKey: string }>;
}

/**
 * Convert country code to flag emoji
 */
function getFlagEmoji(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) {
    return "🏁";
  }
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

/**
 * Get display name for session type
 */
function getSessionDisplayName(sessionType: string): string {
  switch (sessionType) {
    case "Race":
      return "Race";
    case "Sprint":
      return "Sprint";
    case "Qualifying":
      return "Qualifying";
    case "Sprint Qualifying":
      return "Sprint Quali";
    case "Practice 1":
      return "P1";
    case "Practice 2":
      return "P2";
    case "Practice 3":
      return "P3";
    default:
      return sessionType;
  }
}

export default async function SessionPage({ params }: SessionPageProps) {
  const { sessionKey } = await params;
  
  // Parse session key
  const parsedSessionKey = parseInt(sessionKey);
  if (isNaN(parsedSessionKey)) {
    return (
      <div className="p-6">
        <Link href="/archive" className="inline-flex items-center gap-2 text-f1-silver hover:text-f1-white mb-6">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Archive
        </Link>
        <h1 className="font-heading text-2xl font-bold text-f1-white">Session not found</h1>
        <p className="text-f1-silver mt-2">Invalid session key.</p>
      </div>
    );
  }

  // Fetch session data with try/catch
  let session: Session | null = null;
  let drivers: Driver[] = [];
  let results: SessionResult[] = [];

  try {
    const sessions = await getSessions({ session_key: parsedSessionKey } as Parameters<typeof getSessions>[0]);
    session = sessions[0] || null;
  } catch {
    session = null;
  }

  try {
    drivers = await getDrivers({ session_key: parsedSessionKey } as Parameters<typeof getDrivers>[0]);
  } catch {
    drivers = [];
  }

  try {
    results = await getSessionResult({ session_key: parsedSessionKey });
  } catch {
    results = [];
  }

  // If session not found, show error
  if (!session) {
    return (
      <div className="p-6">
        <Link href="/archive" className="inline-flex items-center gap-2 text-f1-silver hover:text-f1-white mb-6">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Archive
        </Link>
        <h1 className="font-heading text-2xl font-bold text-f1-white">Session not found</h1>
        <p className="text-f1-silver mt-2">The requested session could not be found.</p>
      </div>
    );
  }

  // Create driver lookup map
  const driverMap = new Map<number, Driver>();
  for (const driver of drivers) {
    driverMap.set(driver.driver_number, driver);
  }

  // Sort results by position
  const sortedResults = [...results].sort((a, b) => a.position - b.position);

  return (
    <div className="p-6">
      {/* Back Link */}
      <Link href="/archive" className="inline-flex items-center gap-2 text-f1-silver hover:text-f1-white mb-6">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Archive
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-f1-white leading-tight">
              {session.session_name}
            </h1>
            <p className="text-f1-silver mt-1">
              {session.circuit_short_name}, {session.country_name} {getFlagEmoji(session.country_code)}
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider 
              ${session.session_type === "Race" ? "bg-f1-red text-white" : 
                session.session_type === "Sprint" ? "bg-yellow-500 text-f1-carbon" : 
                session.session_type === "Qualifying" || session.session_type === "Sprint Qualifying" ? "bg-blue-500 text-white" : 
                "bg-f1-silver text-f1-carbon"
              }`}
          >
            {getSessionDisplayName(session.session_type)}
          </span>
        </div>

        {/* Session Metadata */}
        <div className="flex flex-wrap gap-4 text-sm">
          <span className="text-f1-silver">{session.year}</span>
          <span className="text-f1-silver/50">•</span>
          <span className="text-f1-silver">{session.location}</span>
        </div>
      </div>

      {/* Results Card */}
      <div className="bg-[#111418] rounded-xl border border-white/[0.05] p-6 mb-6">
        <h2 className="font-heading text-xl font-bold text-f1-white mb-4">Results</h2>
        
        {sortedResults.length === 0 ? (
          <p className="text-f1-silver">No results available for this session.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-white/[0.05]">
                  <th className="text-left py-3 px-2 text-f1-silver text-xs font-medium uppercase tracking-wider w-16">Pos</th>
                  <th className="text-left py-3 px-2 text-f1-silver text-xs font-medium uppercase tracking-wider">Driver</th>
                  <th className="text-left py-3 px-2 text-f1-silver text-xs font-medium uppercase tracking-wider">Team</th>
                  <th className="text-left py-3 px-2 text-f1-silver text-xs font-medium uppercase tracking-wider w-24">Gap</th>
                  <th className="text-left py-3 px-2 text-f1-silver text-xs font-medium uppercase tracking-wider w-20">Laps</th>
                </tr>
              </thead>
              <tbody>
                {sortedResults.map((result, index) => {
                  const driver = driverMap.get(result.driver_number);
                  
                  // Determine gap display
                  let gapDisplay = "—";
                  if (result.dnf) {
                    gapDisplay = "DNF";
                  } else if (result.dns) {
                    gapDisplay = "DNS";
                  } else if (result.dsq) {
                    gapDisplay = "DSQ";
                  } else if (result.gap_to_leader !== null && result.gap_to_leader !== undefined) {
                    gapDisplay = typeof result.gap_to_leader === "number" 
                      ? result.gap_to_leader.toFixed(3) + "s"
                      : Array.isArray(result.gap_to_leader)
                        ? "—"
                        : String(result.gap_to_leader);
                  }
                  
                  return (
                    <tr 
                      key={result.driver_number}
                      className={`border-b border-white/[0.02] ${index % 2 === 1 ? "bg-white/[0.02]" : ""}`}
                    >
                      <td className="py-3 px-2 text-f1-white font-medium">{result.position}</td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ 
                              backgroundColor: driver?.team_colour || "#888888" 
                            }}
                          />
                          <span className="text-f1-white">
                            <span className="text-f1-silver mr-2">{driver?.driver_number || result.driver_number}</span>
                            {driver ? (driver.full_name || `${driver.first_name} ${driver.last_name}`) : "Unknown"}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-f1-silver">{driver?.team_name || "Unknown"}</td>
                      <td className={`py-3 px-2 ${result.dnf || result.dns || result.dsq ? "text-f1-red" : "text-f1-white"}`}>
                        {gapDisplay}
                      </td>
                      <td className="py-3 px-2 text-f1-silver">{result.number_of_laps}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Launch Replay Button */}
      <Link href={`/strategy-lab?session=${sessionKey}`}>
        <Button variant="primary" size="lg">
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Launch Replay
        </Button>
      </Link>
    </div>
  );
}