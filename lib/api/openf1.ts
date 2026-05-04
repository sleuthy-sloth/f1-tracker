/**
 * OpenF1 API Client
 * TypeScript client for the OpenF1 API with rate limiting and exponential backoff
 * API Documentation: https://openf1.org/
 */

import type {
  Meeting,
  Session,
  Driver,
  CarData,
  LocationData,
  LapData,
  PositionData,
  IntervalData,
  WeatherData,
  PitData,
  StintData,
  RaceControlData,
  SessionResult,
  ChampionshipDriver,
  ChampionshipTeam,
} from '@/lib/types';

// ============================================================================
// Configuration
// ============================================================================

const BASE_URL = 'https://api.openf1.org/v1';
const DEFAULT_RATE_LIMIT = 3; // requests per second (free tier)
const DEFAULT_WINDOW_MS = 1000; // 1 second window
const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 1000;
const MAX_BACKOFF_MS = 30000;
const REQUEST_TIMEOUT_MS = 30000; // 30s timeout to prevent hanging requests

// ============================================================================
// Error Types
// ============================================================================

/**
 * Custom error class for OpenF1 API errors
 */
export class OpenF1Error extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public endpoint?: string
  ) {
    super(message);
    this.name = 'OpenF1Error';
  }
}

// ============================================================================
// Rate Limiter
// ============================================================================

/**
 * Simple rate limiter that tracks request timestamps and enforces
 * the configured rate limit using a sliding window approach
 */
class RateLimiter {
  private requests: number[] = [];
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests = DEFAULT_RATE_LIMIT, windowMs = DEFAULT_WINDOW_MS) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  /**
   * Acquire permission to make a request, waiting if necessary
   */
  async acquire(): Promise<void> {
    const now = Date.now();

    // Remove old requests outside the window
    this.requests = this.requests.filter((t) => now - t < this.windowMs);

    // If we've hit the rate limit, wait until we can make a request
    if (this.requests.length >= this.maxRequests) {
      const oldest = this.requests[0];
      const waitTime = this.windowMs - (now - oldest) + 50;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      // Recursively call to check again after waiting
      return this.acquire();
    }

    this.requests.push(Date.now());
  }

  /**
   * Reset the rate limiter (useful for testing)
   */
  reset(): void {
    this.requests = [];
  }
}

// Create a singleton rate limiter instance
const rateLimiter = new RateLimiter();

// ============================================================================
// Core Fetch Utility
// ============================================================================

/**
 * Fetch data from the OpenF1 API with rate limiting, exponential backoff, and retry logic
 *
 * @param endpoint - The API endpoint (e.g., '/meetings', '/sessions')
 * @param params - Optional query parameters to filter the results
 * @returns Promise resolving to an array of typed data
 * @throws {OpenF1Error} When the API returns an error or network request fails
 *
 * @example
 * const meetings = await fetchOpenF1<Meeting>('/meetings', { year: 2024 });
 * const sessions = await fetchOpenF1<Session>('/sessions', { meeting_key: 1234 });
 */
async function fetchOpenF1<T>(
  endpoint: string,
  params?: Record<string, string | number | undefined>
): Promise<T[]> {
  // Build URL with query parameters
  const url = new URL(BASE_URL + endpoint);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      // Filter out undefined values
      if (value !== undefined) {
        // Handle special keywords like 'latest'
        url.searchParams.append(key, String(value));
      }
    });
  }

  let lastError: Error | null = null;
  let backoffMs = INITIAL_BACKOFF_MS;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      // Acquire rate limit permission before making request
      await rateLimiter.acquire();

      // Use AbortController with timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

      let response: Response;
      try {
        response = await fetch(url.toString(), {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeoutId);
      }

      // Handle rate limiting (429)
      if (response.status === 429) {
        if (attempt < MAX_RETRIES - 1) {
          await new Promise((resolve) => setTimeout(resolve, backoffMs));
          backoffMs = Math.min(backoffMs * 2, MAX_BACKOFF_MS);
          continue;
        }
        throw new OpenF1Error(
          'Rate limit exceeded after multiple attempts',
          429,
          endpoint
        );
      }

      // Handle other error status codes
      if (!response.ok) {
        const errorMessage = await response
          .text()
          .catch(() => 'Unknown error');
        throw new OpenF1Error(
          `API error: ${errorMessage}`,
          response.status,
          endpoint
        );
      }

      // Parse and return JSON response
      const data = await response.json();

      // Handle empty responses
      if (!data) {
        return [];
      }

      // OpenF1 returns an array directly
      if (Array.isArray(data)) {
        return data as T[];
      }

      // Handle object responses (some endpoints may return an object with data)
      return (data.data || data.result || []) as T[];
    } catch (error) {
      lastError = error as Error;

      // Don't retry on non-network errors
      if (error instanceof OpenF1Error && error.statusCode !== undefined) {
        // Only retry on 5xx errors
        if (error.statusCode < 500) {
          throw error;
        }
      }

      // Retry on network errors
      if (attempt < MAX_RETRIES - 1) {
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
        backoffMs = Math.min(backoffMs * 2, MAX_BACKOFF_MS);
      }
    }
  }

  // All retries exhausted
  throw new OpenF1Error(
    `Request failed after ${MAX_RETRIES} attempts: ${lastError?.message}`,
    undefined,
    endpoint
  );
}

// ============================================================================
// Typed Endpoint Functions - Meetings
// ============================================================================

/**
 * Fetch meetings (Grand Prix weekends)
 *
 * @param params - Optional filters: year, country_name, meeting_key
 * @returns Promise resolving to array of Meeting objects
 *
 * @example
 * const meetings = await getMeetings({ year: 2024 });
 * const specificMeeting = await getMeetings({ meeting_key: 1219 });
 */
export async function getMeetings(
  params?: {
    year?: number;
    country_name?: string;
    meeting_key?: number;
  } & { session_key?: string } // Handle 'latest' keyword
): Promise<Meeting[]> {
  return fetchOpenF1<Meeting>('/meetings', params);
}

// ============================================================================
// Typed Endpoint Functions - Sessions
// ============================================================================

/**
 * Fetch sessions (practice, qualifying, race, etc.)
 *
 * @param params - Optional filters: year, country_name, session_key, meeting_key, session_name, session_type
 * @returns Promise resolving to array of Session objects
 *
 * @example
 * const sessions = await getSessions({ year: 2024 });
 * const raceSessions = await getSessions({ meeting_key: 1219, session_type: 'Race' });
 */
export async function getSessions(
  params?: {
    year?: number;
    country_name?: string;
    session_key?: number | string;
    meeting_key?: number;
    session_name?: string;
    session_type?: string;
  }
): Promise<Session[]> {
  return fetchOpenF1<Session>('/sessions', params);
}

// ============================================================================
// Typed Endpoint Functions - Drivers
// ============================================================================

/**
 * Fetch driver information for a session
 *
 * @param params - Filters: session_key (required), optional driver_number, meeting_key
 * @returns Promise resolving to array of Driver objects
 *
 * @example
 * const drivers = await getDrivers({ session_key: latest });
 * const verstappen = await getDrivers({ session_key: 5628, driver_number: 1 });
 */
export async function getDrivers(
  params: {
    session_key?: number;
    driver_number?: number;
    meeting_key?: number;
  } & { session_key?: string } // Handle 'latest' keyword
): Promise<Driver[]> {
  if (!params.session_key && !params.meeting_key) {
    throw new OpenF1Error('session_key or meeting_key is required');
  }
  return fetchOpenF1<Driver>('/drivers', params);
}

// ============================================================================
// Typed Endpoint Functions - Car Data (Telemetry)
// ============================================================================

/**
 * Fetch car telemetry data
 *
 * @param params - Required: session_key, optional: driver_number, speed filter
 * @returns Promise resolving to array of CarData objects
 *
 * @example
 * const carData = await getCarData({ session_key: 5628 });
 * const verstappenData = await getCarData({ session_key: 5628, driver_number: 1 });
 */
export async function getCarData(params: {
  session_key: number;
  driver_number?: number;
  speed?: string;
}): Promise<CarData[]> {
  if (!params.session_key) {
    throw new OpenF1Error('session_key is required');
  }
  return fetchOpenF1<CarData>('/car_data', params);
}

// ============================================================================
// Typed Endpoint Functions - Location
// ============================================================================

/**
 * Fetch car location data (X, Y, Z coordinates on track)
 *
 * @param params - Required: session_key, optional: driver_number, date
 * @returns Promise resolving to array of LocationData objects
 *
 * @example
 * const locations = await getLocation({ session_key: 5628 });
 * const locationAtTime = await getLocation({ session_key: 5628, date: '2024-03-02T14:30:00' });
 */
export async function getLocation(params: {
  session_key: number;
  driver_number?: number;
  date?: string;
}): Promise<LocationData[]> {
  if (!params.session_key) {
    throw new OpenF1Error('session_key is required');
  }
  return fetchOpenF1<LocationData>('/location', params);
}

// ============================================================================
// Typed Endpoint Functions - Laps
// ============================================================================

/**
 * Fetch lap timing data
 *
 * @param params - Required: session_key, optional: driver_number, lap_number
 * @returns Promise resolving to array of LapData objects
 *
 * @example
 * const laps = await getLaps({ session_key: 5628 });
 * const driverLaps = await getLaps({ session_key: 5628, driver_number: 1 });
 */
export async function getLaps(params: {
  session_key: number;
  driver_number?: number;
  lap_number?: number;
}): Promise<LapData[]> {
  if (!params.session_key) {
    throw new OpenF1Error('session_key is required');
  }
  return fetchOpenF1<LapData>('/laps', params);
}

// ============================================================================
// Typed Endpoint Functions - Position
// ============================================================================

/**
 * Fetch driver position data
 *
 * @param params - Required: session_key, optional: driver_number
 * @returns Promise resolving to array of PositionData objects
 *
 * @example
 * const positions = await getPosition({ session_key: 5628 });
 */
export async function getPosition(params: {
  session_key: number;
  driver_number?: number;
}): Promise<PositionData[]> {
  if (!params.session_key) {
    throw new OpenF1Error('session_key is required');
  }
  return fetchOpenF1<PositionData>('/position', params);
}

// ============================================================================
// Typed Endpoint Functions - Intervals
// ============================================================================

/**
 * Fetch interval data (gap and interval times between drivers)
 *
 * @param params - Required: session_key, optional: driver_number
 * @returns Promise resolving to array of IntervalData objects
 *
 * @example
 * const intervals = await getIntervals({ session_key: 5628 });
 */
export async function getIntervals(params: {
  session_key: number;
  driver_number?: number;
}): Promise<IntervalData[]> {
  if (!params.session_key) {
    throw new OpenF1Error('session_key is required');
  }
  return fetchOpenF1<IntervalData>('/intervals', params);
}

// ============================================================================
// Typed Endpoint Functions - Weather
// ============================================================================

/**
 * Fetch weather data (track and air conditions)
 *
 * @param params - Required: session_key, optional: driver_number
 * @returns Promise resolving to array of WeatherData objects
 *
 * @example
 * const weather = await getWeather({ session_key: 5628 });
 */
export async function getWeather(params: {
  session_key: number;
  driver_number?: number;
}): Promise<WeatherData[]> {
  if (!params.session_key) {
    throw new OpenF1Error('session_key is required');
  }
  return fetchOpenF1<WeatherData>('/weather', params);
}

// ============================================================================
// Typed Endpoint Functions - Pit Stops
// ============================================================================

/**
 * Fetch pit stop data
 *
 * @param params - Required: session_key, optional: driver_number
 * @returns Promise resolving to array of PitData objects
 *
 * @example
 * const pitStops = await getPit({ session_key: 5628 });
 */
export async function getPit(params: {
  session_key: number;
  driver_number?: number;
}): Promise<PitData[]> {
  if (!params.session_key) {
    throw new OpenF1Error('session_key is required');
  }
  return fetchOpenF1<PitData>('/pit', params);
}

// ============================================================================
// Typed Endpoint Functions - Stints
// ============================================================================

/**
 * Fetch stint data ( tyre stint information)
 *
 * @param params - Required: session_key, optional: driver_number
 * @returns Promise resolving to array of StintData objects
 *
 * @example
 * const stints = await getStints({ session_key: 5628 });
 */
export async function getStints(params: {
  session_key: number;
  driver_number?: number;
}): Promise<StintData[]> {
  if (!params.session_key) {
    throw new OpenF1Error('session_key is required');
  }
  return fetchOpenF1<StintData>('/stints', params);
}

// ============================================================================
// Typed Endpoint Functions - Race Control
// ============================================================================

/**
 * Fetch race control messages (flags, safety car, etc.)
 *
 * @param params - Required: session_key, optional: driver_number, flag, category
 * @returns Promise resolving to array of RaceControlData objects
 *
 * @example
 * const raceControl = await getRaceControl({ session_key: 5628 });
 * const flags = await getRaceControl({ session_key: 5628, flag: 'GREEN' });
 */
export async function getRaceControl(params: {
  session_key: number;
  driver_number?: number;
  flag?: string;
  category?: string;
}): Promise<RaceControlData[]> {
  if (!params.session_key) {
    throw new OpenF1Error('session_key is required');
  }
  return fetchOpenF1<RaceControlData>('/race_control', params);
}

// ============================================================================
// Typed Endpoint Functions - Session Results
// ============================================================================

/**
 * Fetch session results
 *
 * @param params - Required: session_key, optional: driver_number
 * @returns Promise resolving to array of SessionResult objects
 *
 * @example
 * const results = await getSessionResult({ session_key: 5628 });
 */
export async function getSessionResult(params: {
  session_key: number;
  driver_number?: number;
}): Promise<SessionResult[]> {
  if (!params.session_key) {
    throw new OpenF1Error('session_key is required');
  }
  return fetchOpenF1<SessionResult>('/session_result', params);
}

// ============================================================================
// Typed Endpoint Functions - Starting Grid
// ============================================================================

/**
 * Starting grid entry data
 */
export interface StartingGridEntry {
  position: number;
  driver_number: number;
  lap_duration: number;
  meeting_key: number;
  session_key: number;
}

/**
 * Fetch starting grid data
 *
 * @param params - Required: session_key
 * @returns Promise resolving to array of StartingGridEntry objects
 *
 * @example
 * const grid = await getStartingGrid({ session_key: 5628 });
 */
export async function getStartingGrid(params: {
  session_key: number;
}): Promise<StartingGridEntry[]> {
  if (!params.session_key) {
    throw new OpenF1Error('session_key is required');
  }
  return fetchOpenF1<StartingGridEntry>('/starting_grid', params);
}

// ============================================================================
// Typed Endpoint Functions - Championships
// ============================================================================

/**
 * Fetch championship driver standings
 *
 * @param params - Required: session_key, optional: driver_number
 * @returns Promise resolving to array of ChampionshipDriver objects
 *
 * @example
 * const standings = await getChampionshipDrivers({ session_key: 5628 });
 */
export async function getChampionshipDrivers(params: {
  session_key: number;
  driver_number?: number;
}): Promise<ChampionshipDriver[]> {
  if (!params.session_key) {
    throw new OpenF1Error('session_key is required');
  }
  return fetchOpenF1<ChampionshipDriver>('/championship_drivers', params);
}

/**
 * Fetch championship team standings
 *
 * @param params - Required: session_key, optional: team_name
 * @returns Promise resolving to array of ChampionshipTeam objects
 *
 * @example
 * const teamStandings = await getChampionshipTeams({ session_key: 5628 });
 */
export async function getChampionshipTeams(params: {
  session_key: number;
  team_name?: string;
}): Promise<ChampionshipTeam[]> {
  if (!params.session_key) {
    throw new OpenF1Error('session_key is required');
  }
  return fetchOpenF1<ChampionshipTeam>('/championship_teams', params);
}

// ============================================================================
// Convenience Helpers
// ============================================================================

/**
 * Get all sessions for a given year
 *
 * @param year - The year to fetch sessions for
 * @returns Promise resolving to array of Session objects
 *
 * @example
 * const sessions = await getSessionsByYear(2024);
 */
export async function getSessionsByYear(year: number): Promise<Session[]> {
  return getSessions({ year });
}

/**
 * Get all meetings for a given year
 *
 * @param year - The year to fetch meetings for
 * @returns Promise resolving to array of Meeting objects
 *
 * @example
 * const meetings = await getMeetingsByYear(2024);
 */
export async function getMeetingsByYear(year: number): Promise<Meeting[]> {
  return getMeetings({ year });
}

/**
 * Get available years from the meetings data
 *
 * @returns Promise resolving to array of available years
 *
 * @example
 * const years = await getAvailableYears(); // [2024, 2023, ...]
 */
export async function getAvailableYears(): Promise<number[]> {
  const meetings = await getMeetings();
  const years = new Set(meetings.map((m) => m.year));
  return Array.from(years).sort((a, b) => b - a); // Sort descending
}

/**
 * Get race control messages (flags) for a session
 *
 * @param sessionKey - The session key to fetch flags for
 * @returns Promise resolving to array of RaceControlData objects
 *
 * @example
 * const flags = await getSessionFlags(5628);
 */
export async function getSessionFlags(
  sessionKey: number
): Promise<RaceControlData[]> {
  return getRaceControl({ session_key: sessionKey });
}

// ============================================================================
// Export the fetch function for advanced usage
// ============================================================================

export { fetchOpenF1 };