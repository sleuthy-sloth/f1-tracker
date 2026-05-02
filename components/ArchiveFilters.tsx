"use client";

import { useState, useMemo } from "react";
import { GpCard } from "@/components/GpCard";
import { Input } from "@/components/ui/Input";
import type { Meeting, Session, PodiumEntry } from "@/lib/types";

interface ArchiveFiltersProps {
  meetings: Meeting[];
  sessionsByMeeting: Map<number, Session[]>;
  selectedYear: number;
  podiumByMeeting?: Map<number, PodiumEntry[]>;
}

type CircuitTypeFilter = "all" | "street" | "racetrack";
type WeatherFilter = "all" | "dry" | "wet";

export function ArchiveFilters({
  meetings,
  sessionsByMeeting,
  selectedYear,
  podiumByMeeting = new Map(),
}: ArchiveFiltersProps) {
  const [circuitTypeFilter, setCircuitTypeFilter] = useState<CircuitTypeFilter>("all");
  const [weatherFilter, setWeatherFilter] = useState<WeatherFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMeetings = useMemo(() => {
    return meetings.filter((meeting) => {
      // Filter by circuit type
      if (circuitTypeFilter === "street" && meeting.circuit_type !== "street") {
        return false;
      }
      if (circuitTypeFilter === "racetrack" && meeting.circuit_type === "street") {
        return false;
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
  }, [meetings, circuitTypeFilter, searchQuery]);

  return (
    <div>
      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        {/* Circuit Type Pills */}
        <div className="flex gap-1">
          <button
            onClick={() => setCircuitTypeFilter("all")}
            aria-pressed={circuitTypeFilter === "all"}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              circuitTypeFilter === "all"
                ? "bg-f1-red text-white"
                : "bg-white/10 text-f1-silver hover:text-f1-white hover:bg-white/15"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setCircuitTypeFilter("street")}
            aria-pressed={circuitTypeFilter === "street"}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              circuitTypeFilter === "street"
                ? "bg-f1-red text-white"
                : "bg-white/10 text-f1-silver hover:text-f1-white hover:bg-white/15"
            }`}
          >
            Street
          </button>
          <button
            onClick={() => setCircuitTypeFilter("racetrack")}
            aria-pressed={circuitTypeFilter === "racetrack"}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              circuitTypeFilter === "racetrack"
                ? "bg-f1-red text-white"
                : "bg-white/10 text-f1-silver hover:text-f1-white hover:bg-white/15"
            }`}
          >
            Race Track
          </button>
        </div>

        {/* Weather Filter Pills */}
        <div className="flex gap-1">
          <button
            onClick={() => setWeatherFilter("all")}
            aria-pressed={weatherFilter === "all"}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              weatherFilter === "all"
                ? "bg-f1-red text-white"
                : "bg-white/10 text-f1-silver hover:text-f1-white hover:bg-white/15"
            }`}
          >
            Any Weather
          </button>
          <button
            onClick={() => setWeatherFilter("dry")}
            aria-pressed={weatherFilter === "dry"}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              weatherFilter === "dry"
                ? "bg-f1-red text-white"
                : "bg-white/10 text-f1-silver hover:text-f1-white hover:bg-white/15"
            }`}
          >
            Dry
          </button>
          <button
            onClick={() => setWeatherFilter("wet")}
            aria-pressed={weatherFilter === "wet"}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              weatherFilter === "wet"
                ? "bg-f1-red text-white"
                : "bg-white/10 text-f1-silver hover:text-f1-white hover:bg-white/15"
            }`}
          >
            Wet
          </button>
        </div>

        {/* Search Input - Right Side */}
        <div className="sm:ml-auto">
          <Input
            placeholder="Search circuits..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="sm"
            icon={
              <svg
                className="w-4 h-4 text-f1-silver"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            }
          />
        </div>
      </div>

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