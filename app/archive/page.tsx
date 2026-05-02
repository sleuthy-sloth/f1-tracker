import { getMeetingsByYear, getSessions, getAvailableYears } from "@/lib/api/openf1";
import { GpCard } from "@/components/GpCard";
import type { Session } from "@/lib/types";

interface ArchivePageProps {
  searchParams: Promise<{ year?: string }>;
}

export default async function ArchivePage({ searchParams }: ArchivePageProps) {
  const params = await searchParams;
  const availableYears = await getAvailableYears();
  const selectedYear = params.year ? parseInt(params.year) : availableYears[0];

  const meetings = await getMeetingsByYear(selectedYear);
  const sessions = await getSessions({ year: selectedYear });

  // Group sessions by meeting_key
  const sessionsByMeeting = new Map<number, Session[]>();
  for (const session of sessions) {
    const existing = sessionsByMeeting.get(session.meeting_key) || [];
    existing.push(session);
    sessionsByMeeting.set(session.meeting_key, existing);
  }

  // Sort meetings by date
  const sortedMeetings = [...meetings].sort(
    (a, b) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime()
  );

  return (
    <div className="p-6">
      {/* Year Selector */}
      <div className="flex items-center gap-2 mb-8">
        <h1 className="font-heading text-2xl font-bold text-f1-white">Race Archive</h1>
        <div className="flex gap-1 ml-auto">
          {availableYears.map((year) => (
            <a
              key={year}
              href={`/archive?year=${year}`}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                year === selectedYear
                  ? "bg-f1-red text-white"
                  : "bg-white/10 text-f1-silver hover:text-f1-white hover:bg-white/15"
              }`}
            >
              {year}
            </a>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {sortedMeetings.length === 0 && (
        <div className="text-center py-12">
          <p className="text-f1-silver text-lg">
            No Grands Prix found for {selectedYear}
          </p>
        </div>
      )}

      {/* GP Grid */}
      {sortedMeetings.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sortedMeetings.map((meeting) => {
            const meetingSessions = sessionsByMeeting.get(meeting.meeting_key) || [];
            return (
              <GpCard
                key={meeting.meeting_key}
                meeting={meeting}
                sessions={meetingSessions}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}