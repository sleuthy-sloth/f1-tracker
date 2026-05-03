"use client";

import { useMemo } from "react";
import { GpCard } from "@/components/GpCard";
import type { Meeting, Session, PodiumEntry } from "@/lib/types";

interface ArchiveFiltersProps {
  meetings: Meeting[];
  sessionsByMeeting: Map<number, Session[]>;
  selectedYear: number;
  podiumByMeeting?: Map<number, PodiumEntry[]>;
  circuitType?: "all" | "street" | "racetrack" | "hybrid";
  searchQuery?: string;
}

export function ArchiveFilters({
  meetings,
  sessionsByMeeting,
  selectedYear,
  podiumByMeeting = new Map(),
  circuitType = "all",
  searchQuery = "",
}: ArchiveFiltersProps) {
  const filteredMeetings = useMemo(() => {
    return meetings.filter((meeting) => {
      // Filter by circuit type
      if (circuitType !== "all") {
        if (meeting.circuit_type !== circuitType) return false;
      }

      // Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesMeetingName = meeting.meeting_name?.toLowerCase().includes(query);
        const matchesCircuitShortName = meeting.circuit_short_name?.toLowerCase().includes(query);
        const matchesCountryName = meeting.country_name?.toLowerCase().includes(query);

        if (!matchesMeetingName && !matchesCircuitShortName && !matchesCountryName) {
          return false;
        }
      }

      return true;
    });
  }, [meetings, circuitType, searchQuery]);

  return (
    <div>
      {/* Filtered GP Grid or Empty State */}
      {filteredMeetings.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredMeetings.map((meeting) => {
            const meetingSessions = sessionsByMeeting.get(meeting.meeting_key) || [];
            const podium = podiumByMeeting.get(meeting.meeting_key);
            return (
              <GpCard
                key={meeting.meeting_key}
                meeting={meeting}
                sessions={meetingSessions}
                podium={podium}
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-f1-silver text-lg">
            No Grands Prix found for {selectedYear} matching your filters
          </p>
        </div>
      )}
    </div>
  );
}