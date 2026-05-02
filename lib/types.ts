/**
 * F1 Tracker TypeScript Types
 * Single source of truth for all data structures matching OpenF1 API response shapes
 */

// ============================================================================
// Session Types
// ============================================================================

/** Session type enumeration */
export type SessionType =
  | 'Race'
  | 'Sprint'
  | 'Sprint Qualifying'
  | 'Qualifying'
  | 'Practice 1'
  | 'Practice 2'
  | 'Practice 3';

/**
 * Session data from OpenF1 API
 * Represents a single session within a Grand Prix weekend (practice, qualifying, race, etc.)
 */
export interface Session {
  session_key: number;
  session_name: string;
  session_type: SessionType;
  meeting_key: number;
  circuit_key: number;
  circuit_short_name: string;
  country_code: string;
  country_key: number;
  country_name: string;
  date_start: string;
  date_end: string;
  gmt_offset: string;
  location: string;
  year: number;
  is_cancelled: boolean;
}

// ============================================================================
// Meeting Types
// ============================================================================

/**
 * Meeting (Grand Prix weekend) data from OpenF1 API
 * Represents an entire race weekend at a specific circuit
 */
export interface Meeting {
  circuit_key: number;
  circuit_short_name: string;
  circuit_type: string;
  circuit_image: string;
  circuit_info_url: string;
  country_code: string;
  country_key: number;
  country_name: string;
  date_start: string;
  date_end: string;
  gmt_offset: string;
  is_cancelled: boolean;
  location: string;
  meeting_key: number;
  meeting_name: string;
  meeting_official_name: string;
  year: number;
}

// ============================================================================
// Driver Types
// ============================================================================

/**
 * Driver information from OpenF1 API
 * Contains driver details and team association for a specific session
 */
export interface Driver {
  driver_number: number;
  broadcast_name: string;
  first_name: string;
  last_name: string;
  full_name: string;
  name_acronym: string;
  headshot_url: string;
  team_name: string;
  team_colour: string;
  meeting_key: number;
  session_key: number;
}

// ============================================================================
// Telemetry Types
// ============================================================================

/**
 * Car data (telemetry) from OpenF1 API
 * Real-time telemetry data including speed, RPM, gear, throttle, brake, DRS
 */
export interface CarData {
  brake: number;
  date: string;
  driver_number: number;
  drs: number;
  meeting_key: number;
  n_gear: number;
  rpm: number;
  session_key: number;
  speed: number;
  throttle: number;
}

/**
 * Telemetry snapshot for replay visualization
 * Merged view of car data + location at a point in time
 */
export interface TelemetrySnapshot {
  driver_number: number;
  x: number;
  y: number;
  z: number;
  speed: number;
  rpm: number;
  n_gear: number;
  throttle: number;
  brake: number;
  drs: number;
  date: string;
}

// ============================================================================
// Location Types
// ============================================================================

/**
 * Location data from OpenF1 API
 * X, Y, Z coordinates of cars on track
 */
export interface LocationData {
  date: string;
  driver_number: number;
  meeting_key: number;
  session_key: number;
  x: number;
  y: number;
  z: number;
}

// ============================================================================
// Lap Types
// ============================================================================

/**
 * Lap data from OpenF1 API
 * Contains lap times, sector times, and segment data
 */
export interface LapData {
  date_start: string;
  driver_number: number;
  duration_sector_1: number | null;
  duration_sector_2: number | null;
  duration_sector_3: number | null;
  i1_speed: number | null;
  i2_speed: number | null;
  is_pit_out_lap: boolean;
  lap_duration: number | null;
  lap_number: number;
  meeting_key: number;
  segments_sector_1: number[];
  segments_sector_2: number[];
  segments_sector_3: number[];
  session_key: number;
  st_speed: number | null;
}

// ============================================================================
// Position Types
// ============================================================================

/**
 * Position data from OpenF1 API
 * Driver positions during a session
 */
export interface PositionData {
  date: string;
  driver_number: number;
  meeting_key: number;
  position: number;
  session_key: number;
}

// ============================================================================
// Interval Types
// ============================================================================

/**
 * Interval data from OpenF1 API
 * Gap and interval times between drivers
 */
export interface IntervalData {
  date: string;
  driver_number: number;
  gap_to_leader: number | string | null;
  interval: number | string | null;
  meeting_key: number;
  session_key: number;
}

// ============================================================================
// Weather Types
// ============================================================================

/**
 * Weather data from OpenF1 API
 * Track and air conditions during a session
 */
export interface WeatherData {
  air_temperature: number;
  date: string;
  driver_number: number | null;
  humidity: number | null;
  meeting_key: number;
  pressure: number | null;
  rainfall: number;
  session_key: number;
  track_temperature: number;
  wind_direction: number | null;
  wind_speed: number | null;
}

// ============================================================================
// Pit Stop Types
// ============================================================================

/**
 * Pit stop data from OpenF1 API
 * Information about pit lane visits
 */
export interface PitData {
  date: string;
  driver_number: number;
  lane_duration: number;
  lap_number: number;
  meeting_key: number;
  session_key: number;
  stop_duration: number | null;
}

// ============================================================================
// Stint Types
// ============================================================================

/** Tyre compound enumeration */
export type TyreCompound = 'SOFT' | 'MEDIUM' | 'HARD' | 'INTERMEDIATE' | 'WET';

/**
 * Stint data from OpenF1 API
 * Tyre stint information including compound and lap range
 */
export interface StintData {
  compound: TyreCompound;
  driver_number: number;
  lap_end: number;
  lap_start: number;
  meeting_key: number;
  session_key: number;
  stint_number: number;
  tyre_age_at_start: number;
}

// ============================================================================
// Race Control Types
// ============================================================================

/**
 * Race control data from OpenF1 API
 * Flags, safety car deployments, and race control messages
 */
export interface RaceControlData {
  category: string;
  date: string;
  driver_number: number | null;
  flag: string | null;
  lap_number: number | null;
  meeting_key: number;
  message: string;
  qualifying_phase: number | null;
  scope: string | null;
  sector: number | null;
  session_key: number;
}

// ============================================================================
// Session Result Types
// ============================================================================

/**
 * Session result data from OpenF1 API
 * Final race results including positions, gaps, and DNF/DNS/DSQ status
 */
export interface SessionResult {
  dnf: boolean;
  dns: boolean;
  dsq: boolean;
  driver_number: number;
  duration: number | number[] | null;
  gap_to_leader: number | string | number[] | null;
  number_of_laps: number;
  meeting_key: number;
  position: number;
  session_key: number;
}

/**
 * Podium entry for a GP card
 */
export interface PodiumEntry {
  position: number;
  driver_name: string;
  driver_number: number;
}

// ============================================================================
// Replay Types
// ============================================================================

/**
 * Safety car status for replay visualization
 */
export interface SafetyCarStatus {
  status: 'deployed' | 'returning' | 'none';
  x?: number;
  y?: number;
}

/**
 * Driver position snapshot for a single frame in the replay
 */
export interface DriverPosition {
  driver_number: number;
  position: number;
  x: number;
  y: number;
  speed: number;
  rpm: number;
  gear: number;
  throttle: number;
  brake: number;
  drs: number;
  gap_to_leader?: number | string | null;
  interval?: number | string | null;
}

/**
 * Replay frame - the core data structure for race replay visualization
 * Represents a single point in time during the race with all driver data
 */
export interface ReplayFrame {
  timestamp: number;
  date: string;
  lap: number;
  driver_positions: DriverPosition[];
  weather?: WeatherData;
  safety_car?: SafetyCarStatus;
  race_control_messages?: RaceControlData[];
}

// ============================================================================
// Track Layout Types
// ============================================================================

/**
 * Single coordinate point on the track
 */
export interface TrackCoordinate {
  x: number;
  y: number;
}

/**
 * Track layout data for visualization
 * Contains circuit key, name, and coordinate points
 */
export interface TrackLayout {
  circuit_key: number;
  circuit_name: string;
  coordinates: TrackCoordinate[];
  rotation?: number;
}

// ============================================================================
// Championship/Standing Types
// ============================================================================

/**
 * Championship driver standing
 */
export interface ChampionshipDriver {
  driver_number: number;
  meeting_key: number;
  points_current: number;
  points_start: number;
  position_current: number;
  position_start: number;
  session_key: number;
}

/**
 * Championship team standing
 */
export interface ChampionshipTeam {
  meeting_key: number;
  points_current: number;
  points_start: number;
  position_current: number;
  position_start: number;
  session_key: number;
  team_name: string;
}

// ============================================================================
// Constants/Enums
// ============================================================================

/** Segment values for lap sector data */
export const SEGMENT_VALUES = {
  NOT_AVAILABLE: 0,
  YELLOW: 2048,
  GREEN: 2049,
  PURPLE: 2051,
  PITLANE: 2064,
} as const;

/** DRS mode values */
export const DRS_VALUES = {
  OFF: 0,
  DETECTED: 8,
  ON: 10,
  ON_ALT: 12,
  ON_ALT2: 14,
} as const;

// ============================================================================
// User Data Types (Firebase)
// ============================================================================

/** User role enumeration */
export type UserRole = 'user' | 'admin';

/**
 * Session history entry for tracking user viewing history
 */
export interface SessionHistoryEntry {
  sessionKey: number;
  viewedAt: string;
  sessionName?: string;
}

/**
 * User profile data stored in Firebase
 */
export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  favoriteSessions: number[];
  watchHistory: SessionHistoryEntry[];
}