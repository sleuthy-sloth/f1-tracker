"use client";

import { useRef, useEffect } from "react";

// --- Filter state types ---
export type CircuitTypeFilter = "all" | "street" | "racetrack" | "hybrid";
export type WeatherFilter = "all" | "dry" | "wet" | "mixed";
export type DriverWinsFilter = "all" | string;

export interface FilterSidebarState {
  circuitType: CircuitTypeFilter;
  weather: WeatherFilter;
  searchQuery: string;
  selectedTeams: string[];
  driverWins: DriverWinsFilter;
}

export interface FilterSidebarProps {
  filters: FilterSidebarState;
  availableYears: number[];
  selectedYear: number;
  availableTeams: string[];
  availableDrivers: string[];
  onFilterChange: (filters: Partial<FilterSidebarState>) => void;
  onYearChange: (year: number) => void;
  mobileOpen: boolean;
  onMobileToggle: () => void;
}

// --- Section header component ---
function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <div className="px-1 mb-2 text-[10px] font-bold text-f1-silver/50 uppercase tracking-[0.15em]">
        {label}
      </div>
      {children}
    </div>
  );
}

// --- Checkbox component ---
function FilterCheckbox({
  label,
  checked,
  onChange,
  count,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
  count?: number;
}) {
  return (
    <label className="flex items-center gap-2.5 px-2 py-1.5 rounded-md cursor-pointer hover:bg-white/[0.04] transition-colors group">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-3.5 h-3.5 rounded border-white/20 bg-transparent checked:bg-[#00D2BE] checked:border-[#00D2BE] focus:ring-1 focus:ring-[#00D2BE]/50 accent-[#00D2BE]"
      />
      <span className="text-xs text-f1-silver group-hover:text-f1-white transition-colors">
        {label}
      </span>
      {count !== undefined && (
        <span className="ml-auto text-[10px] text-f1-silver/40">{count}</span>
      )}
    </label>
  );
}

// --- Pill button (for circuit type, weather) ---
function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all duration-200 ${
        active
          ? "bg-[#00D2BE]/20 text-[#00D2BE] border border-[#00D2BE]/30"
          : "bg-white/[0.06] text-f1-silver hover:text-f1-white hover:bg-white/[0.1] border border-transparent"
      }`}
    >
      {label}
    </button>
  );
}

// --- Mobile filter button (visible only on small screens) ---
function MobileFilterButton({ onClick, activeCount }: { onClick: () => void; activeCount: number }) {
  return (
    <div className="md:hidden px-4 py-3 border-b border-white/5 bg-surface-dim">
      <button
        onClick={onClick}
        className="flex items-center gap-2 w-full px-4 py-2.5 rounded-lg bg-white/[0.08] text-f1-white text-sm font-medium hover:bg-white/[0.12] transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" y1="21" x2="4" y2="14" />
          <line x1="4" y1="10" x2="4" y2="3" />
          <line x1="12" y1="21" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12" y2="3" />
          <line x1="20" y1="21" x2="20" y2="16" />
          <line x1="20" y1="12" x2="20" y2="3" />
          <line x1="1" y1="14" x2="7" y2="14" />
          <line x1="9" y1="8" x2="15" y2="8" />
          <line x1="17" y1="16" x2="23" y2="16" />
        </svg>
        Filters
        {activeCount > 0 && (
          <span className="ml-auto bg-[#00D2BE] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
            {activeCount}
          </span>
        )}
      </button>
    </div>
  );
}

export function FilterSidebar({
  filters,
  availableYears,
  selectedYear,
  availableTeams,
  availableDrivers,
  onFilterChange,
  onYearChange,
  mobileOpen,
  onMobileToggle,
}: FilterSidebarProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileOpen) {
        onMobileToggle();
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen, onMobileToggle]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        mobileOpen &&
        drawerRef.current &&
        !drawerRef.current.contains(e.target as Node)
      ) {
        onMobileToggle();
      }
    };
    if (mobileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileOpen, onMobileToggle]);

  const activeFilterCount = [
    filters.circuitType !== "all",
    filters.weather !== "all",
    filters.searchQuery.length > 0,
    filters.selectedTeams.length > 0,
    filters.driverWins !== "all",
  ].filter(Boolean).length;

  const sidebarContent = (
    <div className="flex flex-col gap-1">
      {/* Year Section */}
      <FilterSection label="Year">
        <div className="flex flex-wrap gap-1.5">
          {availableYears.map((year) => (
            <button
              key={year}
              onClick={() => onYearChange(year)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                year === selectedYear
                  ? "bg-[#00D2BE] text-white shadow-[0_0_8px_rgba(0,210,190,0.4)]"
                  : "bg-white/[0.06] text-f1-silver hover:text-f1-white hover:bg-white/[0.1]"
              }`}
            >
              {year}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Circuit Type Section */}
      <FilterSection label="Circuit Type">
        <div className="flex flex-wrap gap-1.5 px-1">
          {(["all", "street", "racetrack", "hybrid"] as const).map((type) => (
            <FilterPill
              key={type}
              label={type === "all" ? "All" : type.charAt(0).toUpperCase() + type.slice(1)}
              active={filters.circuitType === type}
              onClick={() => onFilterChange({ circuitType: type })}
            />
          ))}
        </div>
      </FilterSection>

      {/* Weather Section */}
      <FilterSection label="Weather">
        <div className="flex flex-wrap gap-1.5 px-1">
          {(["all", "dry", "wet", "mixed"] as const).map((w) => (
            <FilterPill
              key={w}
              label={w === "all" ? "Any" : w.charAt(0).toUpperCase() + w.slice(1)}
              active={filters.weather === w}
              onClick={() => onFilterChange({ weather: w })}
            />
          ))}
        </div>
      </FilterSection>

      {/* Team Section */}
      {availableTeams.length > 0 && (
        <FilterSection label="Team">
          <div className="max-h-48 overflow-y-auto space-y-0.5">
            {availableTeams.map((team) => (
              <FilterCheckbox
                key={team}
                label={team}
                checked={filters.selectedTeams.includes(team)}
                onChange={() => {
                  const updated = filters.selectedTeams.includes(team)
                    ? filters.selectedTeams.filter((t) => t !== team)
                    : [...filters.selectedTeams, team];
                  onFilterChange({ selectedTeams: updated });
                }}
              />
            ))}
          </div>
        </FilterSection>
      )}

      {/* Driver Wins Section */}
      {availableDrivers.length > 0 && (
        <FilterSection label="Driver Wins">
          <select
            value={filters.driverWins}
            onChange={(e) => onFilterChange({ driverWins: e.target.value })}
            className="w-full px-2.5 py-1.5 rounded-md bg-white/[0.08] border border-white/10 text-xs text-f1-white focus:outline-none focus:border-[#00D2BE]/50 focus:ring-1 focus:ring-[#00D2BE]/30 transition-colors appearance-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23a0a0a0' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 8px center",
              backgroundSize: "12px",
            }}
          >
            <option value="all" className="bg-[#0e1014]">All Drivers</option>
            {availableDrivers.map((driver) => (
              <option key={driver} value={driver} className="bg-[#0e1014]">{driver}</option>
            ))}
          </select>
        </FilterSection>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Filter Button Bar */}
      <MobileFilterButton onClick={onMobileToggle} activeCount={activeFilterCount} />

      {/* Desktop Sidebar - always visible */}
      <aside className="hidden md:block w-72 shrink-0">
        <div className="fixed top-16 bottom-0 w-72 overflow-y-auto border-r border-white/5 bg-surface-dim p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 px-1">
            <span className="text-[10px] font-bold text-f1-silver/40 uppercase tracking-[0.15em]">
              Filters
            </span>
            {activeFilterCount > 0 && (
              <button
                onClick={() =>
                  onFilterChange({
                    circuitType: "all",
                    weather: "all",
                    searchQuery: "",
                    selectedTeams: [],
                    driverWins: "all",
                  })
                }
                className="text-[10px] text-[#00D2BE] hover:text-white transition-colors font-medium"
              >
                Clear all
              </button>
            )}
          </div>

          {sidebarContent}
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={onMobileToggle} />
      )}

      {/* Mobile Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-label="Filter sidebar"
        className={`md:hidden fixed top-14 left-0 bottom-0 z-50 w-80 max-w-[85vw] bg-surface-dim border-r border-white/5 overflow-y-auto transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold text-f1-silver/40 uppercase tracking-[0.15em]">
              Filters
            </span>
            <button
              onClick={onMobileToggle}
              className="w-7 h-7 rounded-lg bg-white/[0.08] flex items-center justify-center text-f1-silver hover:text-f1-white transition-colors"
              aria-label="Close filters"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {sidebarContent}
        </div>
      </div>
    </>
  );
}