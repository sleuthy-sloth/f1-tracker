import { getMeetingsByYear, getSessions, getAvailableYears, getSessionResult } from "@/lib/api/openf1";
import { ArchiveClient } from "@/components/ArchiveClient";
import type { Session, PodiumEntry } from "@/lib/types";

interface ArchivePageProps {
  searchParams: Promise<{ year?: string }>;
}

export default async function ArchivePage({ searchParams }: ArchivePageProps) {
  const params = await searchParams;

  let availableYears: number[] = [];
  let meetings: Awaited<ReturnType<typeof getMeetingsByYear>> = [];
  let sessions: Session[] = [];

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

  try {
    meetings = await getMeetingsByYear(selectedYear);
  } catch {
    meetings = [];
  }

  try {
    sessions = await getSessions({ year: selectedYear });
  } catch {
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

  // Fetch podium data (top 3) for each meeting's Race session
  const podiumByMeeting = new Map<number, PodiumEntry[]>();
  for (const [meetingKey, meetingSessions] of sessionsByMeeting) {
    const raceSession = meetingSessions.find((s) => s.session_type === "Race");
    if (raceSession) {
      try {
        const results = await getSessionResult({ session_key: raceSession.session_key });
        const podium = results
          .filter((r) => r.position >= 1 && r.position <= 3)
          .sort((a, b) => a.position - b.position)
          .map((r) => ({
            position: r.position,
            driver_name: `#${r.driver_number}`,
            driver_number: r.driver_number,
          }));
        podiumByMeeting.set(meetingKey, podium);
      } catch {
        // No podium data available for this meeting
      }
    }
  }

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