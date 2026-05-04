import type { Metadata } from "next";
import { getMeetingsByYear, getSessions, getAvailableYears, getSessionResult } from "@/lib/api/openf1";
import { ArchiveClient } from "@/components/ArchiveClient";
import type { Session, PodiumEntry } from "@/lib/types";

export const metadata: Metadata = {
  title: "Race Archive",
  description: "Browse historical F1 race sessions, view results, and launch full telemetry replays.",
};

interface ArchivePageProps {
  searchParams: Promise<{ year?: string }>;
}

export default async function ArchivePage({ searchParams }: ArchivePageProps) {
  const params = await searchParams;

  // Step 1: Get available years (used to determine selectedYear)
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

  // Step 2: Fetch meetings and sessions in parallel for the selected year
  try {
    const [meetingsResult, sessionsResult] = await Promise.all([
      getMeetingsByYear(selectedYear).catch(() => [] as Awaited<ReturnType<typeof getMeetingsByYear>>),
      getSessions({ year: selectedYear }).catch(() => [] as Session[])
    ]);
    
    meetings = meetingsResult;
    sessions = sessionsResult;
  } catch {
    meetings = [];
    sessions = [];
  }

  // Group sessions by meeting_key
  const sessionsByMeeting = new Map<number, Session[]>();
  for (const session of sessions) {
    const existing = sessionsByMeeting.get(session.meeting_key) || [];
    existing.push(session);
    sessionsByMeeting.set(session.meeting_key, existing);
  }

  // Sort meetings by date (most recent first)
  const sortedMeetings = [...meetings].sort(
    (a, b) => new Date(b.date_start).getTime() - new Date(a.date_start).getTime()
  );

  // Fetch podium data removed from SSR — now handled lazily on the client per-card
  const podiumByMeeting = new Map<number, PodiumEntry[]>();

  return (
    <ArchiveClient
      meetings={sortedMeetings}
      sessionsByMeeting={sessionsByMeeting}
      selectedYear={selectedYear}
      availableYears={availableYears}
      podiumByMeeting={podiumByMeeting}
    />
  );
}