"use client";

import { useState } from "react";
import { ArchiveFilters } from "@/components/ArchiveFilters";
import { FilterSidebar } from "@/components/FilterSidebar";
import {
  SeasonSelector,
} from "@/components/SeasonSelector";
import type { FilterSidebarState } from "@/components/FilterSidebar";
import type { Session, PodiumEntry } from "@/lib/types";

interface ArchiveClientProps {
  meetings: import("@/lib/types").Meeting[];
  sessionsByMeeting: Map<number, Session[]>;
  selectedYear: number;
  availableYears: number[];
  podiumByMeeting: Map<number, PodiumEntry[]>;
}

export function ArchiveClient({
  meetings,
  sessionsByMeeting,
  selectedYear,
  availableYears,
  podiumByMeeting,
}: ArchiveClientProps) {
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter state for the FilterSidebar (ArchiveFilters manages its own internal state for now)
  const [filters, setFilters] = useState<FilterSidebarState>({
    circuitType: "all",
    weather: "all",
    searchQuery: "",
    selectedTeams: [],
    driverWins: "all",
  });

  return (
    <div className="flex min-h-screen">
      {/* Filter Sidebar */}
      <FilterSidebar
        filters={filters}
        availableYears={availableYears}
        selectedYear={selectedYear}
        availableTeams={[]}
        availableDrivers={[]}
        onFilterChange={(partial) =>
          setFilters((prev) => ({ ...prev, ...partial }))
        }
        onYearChange={(year) => {
          window.location.href = `/archive?year=${year}`;
        }}
        mobileOpen={mobileFilterOpen}
        onMobileToggle={() => setMobileFilterOpen((prev) => !prev)}
      />

      {/* Main Content Area */}
      <div className="flex-1 min-w-0">
        {/* Season Selector + Page Header */}
        <div className="flex items-center gap-2 p-6 pb-0">
          <h1 className="font-heading text-2xl font-bold text-f1-white shrink-0">
            Race Archive
          </h1>
          <SeasonSelector
            years={availableYears}
            selectedYear={selectedYear}
            hrefBase="/archive?year="
            className="ml-auto"
          />
        </div>

        {/* GP Grid or Empty State */}
        <div className="p-6">
          {meetings.length > 0 ? (
            <ArchiveFilters
              key={selectedYear}
              meetings={meetings}
              sessionsByMeeting={sessionsByMeeting}
              selectedYear={selectedYear}
              podiumByMeeting={podiumByMeeting}
              circuitType={filters.circuitType}
              searchQuery={filters.searchQuery}
            />
          ) : (
            <div className="text-center py-12">
              <p className="text-f1-silver text-lg">
                No Grands Prix found for {selectedYear}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}