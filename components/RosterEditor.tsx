"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { getCached, setCache } from "@/lib/api-cache";

interface FantasyDriver {
  driverNumber: number;
  nameAcronym: string;
  fullName: string;
  teamColour: string;
  cost: number;
  points: number;
}

interface RosterEditorProps {
  /** Current team drivers */
  currentDrivers: FantasyDriver[];
  /** Total budget cap */
  totalBudget?: number;
  /** Called on save with new roster */
  onSave?: (drivers: FantasyDriver[]) => void;
  /** Loading state */
  isLoading?: boolean;
  className?: string;
}

const MAX_DRIVERS = 5;

export function RosterEditor({
  currentDrivers,
  totalBudget = 100,
  onSave,
  isLoading = false,
  className = "",
}: RosterEditorProps) {
  const [roster, setRoster] = useState<FantasyDriver[]>(currentDrivers);
  const [searchQuery, setSearchQuery] = useState("");
  const [availableDrivers, setAvailableDrivers] = useState<FantasyDriver[]>([]);
  const [driversLoading, setDriversLoading] = useState(true);
  const [driversError, setDriversError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchDrivers() {
      // Check cache first
      const cached = getCached<FantasyDriver[]>('fantasy-drivers');
      if (cached) {
        if (!cancelled) {
          setAvailableDrivers(cached.data);
          setDriversLoading(false);
        }
        return;
      }
      
      try {
        setDriversLoading(true);
        const res = await fetch('/api/data/fantasy');
        const data = await res.json();
        if (!cancelled) {
          if (data.success && data.drivers) {
            setAvailableDrivers(data.drivers);
            // Cache for 30 minutes
            setCache('fantasy-drivers', data.drivers, 30 * 60 * 1000);
          } else {
            setDriversError(data.error || 'Failed to load drivers');
          }
          setDriversLoading(false);
        }
      } catch {
        if (!cancelled) {
          setDriversError('Failed to connect to driver data service');
          setDriversLoading(false);
        }
      }
    }

    fetchDrivers();
    return () => { cancelled = true; };
  }, []);

  const currentSpend = roster.reduce((sum, d) => sum + d.cost, 0);
  const budgetRemaining = totalBudget - currentSpend;
  const budgetPercent = (budgetRemaining / totalBudget) * 100;
  const isRosterFull = roster.length >= MAX_DRIVERS;
  const isOverBudget = budgetRemaining < 0;

  // Derived change detection — compares roster against currentDrivers prop
  const hasChanges = useMemo(() => {
    if (roster.length !== currentDrivers.length) return true;
    const rosterIds = new Set(roster.map((d) => d.driverNumber));
    const currentIds = new Set(currentDrivers.map((d) => d.driverNumber));
    if (rosterIds.size !== currentIds.size) return true;
    for (const id of rosterIds) {
      if (!currentIds.has(id)) return true;
    }
    return false;
  }, [roster, currentDrivers]);

  const addDriver = useCallback((driver: FantasyDriver) => {
    setRoster((prev) => {
      if (prev.length >= MAX_DRIVERS) return prev;
      if (prev.some((d) => d.driverNumber === driver.driverNumber)) return prev;
      return [...prev, driver];
    });
  }, []);

  const removeDriver = useCallback((driverNumber: number) => {
    setRoster((prev) => {
      if (!prev.some((d) => d.driverNumber === driverNumber)) return prev;
      return prev.filter((d) => d.driverNumber !== driverNumber);
    });
  }, []);

  const handleRevert = useCallback(() => {
    setRoster(currentDrivers);
  }, [currentDrivers]);

  const handleSave = useCallback(() => {
    onSave?.(roster);
  }, [roster, onSave]);

  const filteredDrivers = availableDrivers.filter(
    (d: FantasyDriver) =>
      !roster.some((r) => r.driverNumber === d.driverNumber) &&
      (searchQuery === "" ||
        d.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.nameAcronym.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Budget Bar */}
      <div className="rounded-xl border border-white/[0.07] bg-[#111418] p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-[0.625rem] font-semibold tracking-[0.12em] uppercase text-f1-silver/60">
            BUDGET
          </span>
          <span className={`text-sm font-heading font-bold ${isOverBudget ? "text-red-400" : "text-f1-white"}`}>
            ${budgetRemaining.toFixed(1)}M
          </span>
        </div>
        <div className="h-2 bg-white/[0.1] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              budgetPercent > 50 ? "bg-green-500" : budgetPercent > 25 ? "bg-yellow-500" : "bg-red-500"
            }`}
            style={{ width: `${Math.max(0, Math.min(100, budgetPercent))}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-f1-silver">${currentSpend.toFixed(1)}M spent</span>
          <span className="text-xs text-f1-silver">${totalBudget.toFixed(1)}M total</span>
        </div>
      </div>

      {/* Current Roster */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-[0.625rem] font-semibold tracking-[0.12em] uppercase text-f1-silver/60">
            YOUR ROSTER ({roster.length}/{MAX_DRIVERS})
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {roster.map((driver) => (
            <div
              key={driver.driverNumber}
              className="flex items-center gap-3 rounded-lg border border-white/[0.07] bg-white/[0.03] p-3"
            >
              <div
                className="w-1 h-10 rounded-full"
                style={{ backgroundColor: driver.teamColour }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-f1-white truncate">
                  {driver.nameAcronym}
                </p>
                <p className="text-xs text-f1-silver/60 truncate">
                  ${driver.cost.toFixed(1)}M · {driver.points} pts
                </p>
              </div>
              <button
                onClick={() => removeDriver(driver.driverNumber)}
                className="w-7 h-7 rounded-md bg-white/[0.08] flex items-center justify-center text-f1-silver hover:text-red-400 hover:bg-red-400/10 transition-colors"
                aria-label={`Remove ${driver.nameAcronym}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}
          {Array.from({ length: MAX_DRIVERS - roster.length }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="flex items-center justify-center rounded-lg border border-dashed border-white/[0.1] bg-white/[0.02] p-3 h-14"
            >
              <span className="text-xs text-f1-silver/40">Empty slot</span>
            </div>
          ))}
        </div>
      </div>

      {/* Search Available Drivers */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <span className="font-mono text-[0.625rem] font-semibold tracking-[0.12em] uppercase text-f1-silver/60">
            AVAILABLE DRIVERS
          </span>
          {!driversLoading && <span className="text-[10px] text-f1-silver/40">({filteredDrivers.length})</span>}
        </div>
        <input
          type="text"
          placeholder="Search drivers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          disabled={driversLoading}
          className="w-full mb-3 px-3 py-2 rounded-lg bg-white/[0.08] border border-white/10 text-sm text-f1-white placeholder:text-f1-silver/40 focus:outline-none focus:border-[#00D2BE]/50 transition-colors disabled:opacity-50"
        />
        <div className="max-h-64 overflow-y-auto space-y-1">
          {driversLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-f1-silver/30 border-t-f1-silver rounded-full animate-spin" />
            </div>
          ) : driversError ? (
            <p className="text-center text-sm text-f1-silver/40 py-8">
              {driversError}
            </p>
          ) : filteredDrivers.length > 0 ? (
            filteredDrivers.map((driver: FantasyDriver) => (
              <button
                key={driver.driverNumber}
                onClick={() => addDriver(driver)}
                disabled={isRosterFull}
                className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-white/[0.04] disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-left group"
              >
                <div
                  className="w-1 h-8 rounded-full shrink-0"
                  style={{ backgroundColor: driver.teamColour }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-f1-white truncate">{driver.fullName}</p>
                  <p className="text-xs text-f1-silver/60">{driver.nameAcronym}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-mono text-f1-silver">${driver.cost.toFixed(1)}M</p>
                  <p className="text-xs text-f1-silver/50">{driver.points} pts</p>
                </div>
              </button>
            ))
          ) : (
            <p className="text-center text-sm text-f1-silver/40 py-8">
              {searchQuery ? "No drivers match your search" : "All drivers selected"}
            </p>
          )}
        </div>
      </div>

      {/* Save / Revert */}
      <div className="flex gap-3 pt-2">
        <Button
          variant="cyan"
          size="sm"
          onClick={handleSave}
          disabled={!hasChanges || isOverBudget || isLoading}
        >
          {isLoading ? "Saving..." : "Save Roster"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRevert}
          disabled={!hasChanges}
        >
          Revert
        </Button>
      </div>
    </div>
  );
}