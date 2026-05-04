'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import PuUsageTable from '@/components/PuUsageTable';
import { getCached, setCache } from '@/lib/api-cache';

interface Driver {
  driver_number: number;
  team_colour?: string;
}

interface Session {
  session_key: number;
  session_type: string;
  date_start: string;
}

interface PuEntry {
  driverNumber: number;
  driverAcronym: string;
  teamColour: string;
  components: {
    ice: number;
    turbo: number;
    mguh: number;
    mguk: number;
    es: number;
    ce: number;
    exhaust: number;
  };
}

/**
 * PU component usage data is fetched via OpenRouter web search
 * since the OpenF1 API doesn't provide a PU components endpoint.
 */

function ComponentsPageContent() {
  const searchParams = useSearchParams();
  const yearParam = searchParams.get('year');
  
  // State for available years
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [_yearsLoading, setYearsLoading] = useState(true);
  
  // State for selected year (derived from URL param or default)
  const [selectedYear, setSelectedYear] = useState<number>(() => {
    if (yearParam) {
      const parsed = parseInt(yearParam);
      if (!isNaN(parsed)) return parsed;
    }
    return new Date().getFullYear();
  });

  // Update selected year when URL param changes
  useEffect(() => {
    if (yearParam) {
      const parsed = parseInt(yearParam);
      if (!isNaN(parsed) && parsed !== selectedYear) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedYear(parsed);
      }
    }
  }, [yearParam, selectedYear]);
  
  // State for sessions
  const [sessions, setSessions] = useState<Session[]>([]);
  const [_sessionsLoading, setSessionsLoading] = useState(true);
  
  // State for drivers (team colors)
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [_driversLoading, setDriversLoading] = useState(true);
  
  // State for PU data
  const [puData, setPuData] = useState<PuEntry[] | null>(null);
  const [puLoading, setPuLoading] = useState(true);
  const [puError, setPuError] = useState<string | null>(null);
  
  // Fetch available years
  useEffect(() => {
    let cancelled = false;
    
    async function fetchYears() {
      try {
        const res = await fetch('/api/data/years');
        const data = await res.json();
        if (!cancelled && data.years) {
          setAvailableYears(data.years);
          if (data.years.length > 0) {
            setSelectedYear(data.years[0]);
          }
        }
      } catch {
        if (!cancelled) {
          setAvailableYears([2024, 2025, 2026]);
        }
      } finally {
        if (!cancelled) {
          setYearsLoading(false);
        }
      }
    }
    
    fetchYears();
    return () => { cancelled = true; };
  }, []);
  
  // Fetch sessions for selected year
  useEffect(() => {
    let cancelled = false;
    
    async function fetchSessions() {
      try {
        setSessionsLoading(true);
        const res = await fetch(`/api/data/sessions?year=${selectedYear}`);
        const data = await res.json();
        if (!cancelled) {
          if (data.success && data.sessions) {
            setSessions(data.sessions);
          }
          setSessionsLoading(false);
        }
      } catch {
        if (!cancelled) {
          setSessionsLoading(false);
        }
      }
    }
    
    fetchSessions();
    return () => { cancelled = true; };
  }, [selectedYear]);
  
  // Fetch drivers from most recent race session
  useEffect(() => {
    let cancelled = false;
    
    async function fetchDrivers() {
      // Find the most recent Race session
      const raceSessions = sessions.filter((s) => s.session_type === 'Race');
      const sortedRaceSessions = raceSessions.sort(
        (a, b) => new Date(b.date_start).getTime() - new Date(a.date_start).getTime()
      );
      const latestRaceSession = sortedRaceSessions[0];
      
      if (!latestRaceSession) {
        setDriversLoading(false);
        return;
      }
      
      try {
        setDriversLoading(true);
        const res = await fetch(`/api/data/drivers?session_key=${latestRaceSession.session_key}`);
        const data = await res.json();
        if (!cancelled) {
          if (data.success && data.drivers) {
            setDrivers(data.drivers);
          }
          setDriversLoading(false);
        }
      } catch {
        if (!cancelled) {
          setDriversLoading(false);
        }
      }
    }
    
    fetchDrivers();
    return () => { cancelled = true; };
  }, [sessions]);
  
  // Fetch PU data
  useEffect(() => {
    let cancelled = false;
    
    async function fetchPuData() {
      // Check cache first
      const cached = getCached<any[]>('pu-data');
      if (cached) {
        if (!cancelled) {
          setPuData(cached.data);
          setPuLoading(false);
        }
        return;
      }
      
      try {
        setPuLoading(true);
        setPuError(null);
        const res = await fetch('/api/data/pu');
        const data = await res.json();
        if (!cancelled) {
          if (data.success && data.drivers) {
            setPuData(data.drivers);
            setCache('pu-data', data.drivers, 60 * 60 * 1000); // 1 hour cache
          } else {
            setPuError(data.error || 'Failed to load PU data');
          }
          setPuLoading(false);
        }
      } catch {
        if (!cancelled) {
          setPuError('Failed to connect');
          setPuLoading(false);
        }
      }
    }
    
    fetchPuData();
    return () => { cancelled = true; };
  }, []);
  
  // Create driver lookup for team colors
  const driverColorMap = new Map<number, string>();
  drivers.forEach((driver) => {
    driverColorMap.set(driver.driver_number, driver.team_colour || '#666666');
  });
  
  // Merge PU data with actual team colors from API
  const puEntries = puData?.map((entry) => ({
    ...entry,
    teamColour: driverColorMap.get(entry.driverNumber) || entry.teamColour,
  })) || [];
  
  // Check if still loading
  
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-8">
        <Link
          href="/standings"
          className="text-f1-silver hover:text-f1-white transition-colors text-sm"
        >
          ← Back
        </Link>
        <h1 className="font-heading text-2xl font-bold text-f1-white ml-4">
          POWER UNIT COMPONENTS
        </h1>
        <span className="text-f1-silver font-medium ml-2">{selectedYear}</span>
        <div className="flex gap-1 ml-auto">
          {availableYears.map((year) => (
            <Link
              key={year}
              href={`/standings/components?year=${year}`}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                year === selectedYear
                  ? 'bg-f1-red text-white'
                  : 'bg-white/10 text-f1-silver hover:text-f1-white hover:bg-white/15'
              }`}
            >
              {year}
            </Link>
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="mb-6">
        <p className="text-f1-silver text-sm">
          Power Unit component usage for each driver. Components approaching or exceeding
          season limits may incur penalties.
        </p>
      </div>

      {/* Loading/Error/Table */}
      {puLoading ? (
        <div className="animate-pulse">
          <div className="bg-white/5 rounded-lg h-96" />
        </div>
      ) : puError ? (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400">
          {puError}
        </div>
      ) : (
        <PuUsageTable entries={puEntries} />
      )}

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-green-500/30" />
          <span className="text-f1-silver">Safe (&lt; limit)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-yellow-500/30" />
          <span className="text-f1-silver">Warning (at limit)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-red-500/30" />
          <span className="text-f1-silver">Penalty (exceeded)</span>
        </div>
      </div>
    </div>
  );
}

export default function ComponentsPage() {
  return (
    <Suspense fallback={
      <div className="p-6">
        <div className="animate-pulse">
          <div className="bg-white/5 rounded-lg h-96" />
        </div>
      </div>
    }>
      <ComponentsPageContent />
    </Suspense>
  );
}