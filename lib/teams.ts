/**
 * Team Identity Service
 * Year-aware mapping of team names to colors, acronyms, and identity data
 * Pure TypeScript module - no React dependencies
 */

// ============================================================================
// Types
// ============================================================================

/**
 * Team identity data containing display name, color, acronym, and full name
 */
export interface TeamIdentity {
  /** Display name for UI */
  name: string;
  /** Primary team color (hex string without # prefix) */
  colour: string;
  /** Short code (e.g., "RBR", "FER", "MER") */
  acronym: string;
  /** Official constructor name */
  fullName: string;
}

// ============================================================================
// Team Color Mappings
// ============================================================================

/**
 * Base team color mappings (2024-2026 standard)
 */
const BASE_TEAM_COLOURS: Record<string, Omit<TeamIdentity, 'name'>> = {
  'Red Bull Racing': { colour: '3671C6', acronym: 'RBR', fullName: 'Red Bull Racing' },
  'Red Bull': { colour: '3671C6', acronym: 'RBR', fullName: 'Red Bull Racing' },
  'Ferrari': { colour: 'E8002D', acronym: 'FER', fullName: 'Scuderia Ferrari' },
  'Mercedes': { colour: '27F4D2', acronym: 'MER', fullName: 'Mercedes-AMG Petronas' },
  'McLaren': { colour: 'FF8000', acronym: 'MCL', fullName: 'McLaren Formula 1 Team' },
  'Aston Martin': { colour: '00594F', acronym: 'AST', fullName: 'Aston Martin Aramco' },
  'Williams': { colour: '005AFF', acronym: 'WIL', fullName: 'Williams Racing' },
  'Haas': { colour: 'B6BABD', acronym: 'HAA', fullName: 'MoneyGram Haas F1 Team' },
  'Haas F1 Team': { colour: 'B6BABD', acronym: 'HAA', fullName: 'MoneyGram Haas F1 Team' },
  'RB': { colour: '4E7FCD', acronym: 'RB', fullName: 'Visa Cash App RB' },
  'Visa Cash App RB': { colour: '4E7FCD', acronym: 'RB', fullName: 'Visa Cash App RB' },
  'AlphaTauri': { colour: '4E7FCD', acronym: 'RB', fullName: 'Visa Cash App RB' },
  'Alpine': { colour: 'FF87BC', acronym: 'ALP', fullName: 'BWT Alpine F1 Team' },
  'Sauber': { colour: '00E700', acronym: 'SAU', fullName: 'Stake F1 Team Kick Sauber' },
  'Kick Sauber': { colour: '00E700', acronym: 'SAU', fullName: 'Stake F1 Team Kick Sauber' },
  'Stake F1': { colour: '00E700', acronym: 'SAU', fullName: 'Stake F1 Team Kick Sauber' },
};

/**
 * Year-specific team overrides
 * Key format: "year-teamName" -> TeamIdentity (without name field)
 */
const YEAR_SPECIFIC_OVERRIDES: Record<string, Omit<TeamIdentity, 'name'>> = {
  '2026-Audi': { colour: '000000', acronym: 'AUD', fullName: 'Audi F1 Team' },
  '2026-Sauber': { colour: '000000', acronym: 'AUD', fullName: 'Audi F1 Team' },
  '2026-Kick Sauber': { colour: '000000', acronym: 'AUD', fullName: 'Audi F1 Team' },
  '2026-Stake F1': { colour: '000000', acronym: 'AUD', fullName: 'Audi F1 Team' },
  '2025-Cadillac': { colour: '2B2B2B', acronym: 'CAD', fullName: 'Cadillac Formula 1 Team' },
  '2026-Cadillac': { colour: '2B2B2B', acronym: 'CAD', fullName: 'Cadillac Formula 1 Team' },
  '2025-GM': { colour: '2B2B2B', acronym: 'CAD', fullName: 'Cadillac Formula 1 Team' },
  '2026-GM': { colour: '2B2B2B', acronym: 'CAD', fullName: 'Cadillac Formula 1 Team' },
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Normalize team name for lookup
 * @param teamName - Raw team name from API
 * @returns Normalized team name key
 */
function normalizeTeamName(teamName: string): string {
  return teamName.trim();
}

/**
 * Get team identity with optional year for historical mapping
 * @param teamName - Team name (from API or display)
 * @param year - Optional year for historical team changes
 * @returns TeamIdentity object
 */
export function getTeamIdentity(teamName: string, year?: number): TeamIdentity {
  const normalizedName = normalizeTeamName(teamName);

  // Check year-specific override first
  if (year) {
    const yearKey = `${year}-${normalizedName}`;
    const yearOverride = YEAR_SPECIFIC_OVERRIDES[yearKey];
    if (yearOverride) {
      return {
        name: normalizedName,
        ...yearOverride,
      };
    }

    // Special case: 2026+ Audi replaces Sauber
    if (year >= 2026 && (normalizedName === 'Sauber' || normalizedName === 'Kick Sauber' || normalizedName === 'Stake F1')) {
      return {
        name: normalizedName,
        colour: '000000',
        acronym: 'AUD',
        fullName: 'Audi F1 Team',
      };
    }
  }

  // Check base team colours
  const baseIdentity = BASE_TEAM_COLOURS[normalizedName];
  if (baseIdentity) {
    return {
      name: normalizedName,
      ...baseIdentity,
    };
  }

  // Fallback: generate identity from team name
  const fallbackAcronym = normalizedName.substring(0, 3).toUpperCase().padEnd(3, 'X');
  return {
    name: normalizedName,
    colour: '888888',
    acronym: fallbackAcronym,
    fullName: normalizedName,
  };
}

/**
 * Get team color by name (convenience function)
 * @param teamName - Team name (from API or display)
 * @param year - Optional year for historical team changes
 * @returns Team color as hex string without # prefix
 */
export function getTeamColour(teamName: string, year?: number): string {
  return getTeamIdentity(teamName, year).colour;
}

// ============================================================================
// Default Export - Direct Access Object
// ============================================================================

/**
 * Default team colors object for direct property access
 * Maps normalized team names to their color values
 */
export const teamColours: Record<string, string> = Object.fromEntries(
  Object.entries(BASE_TEAM_COLOURS).map(([name, identity]) => [name, identity.colour])
);

// ============================================================================
// Re-export for convenience
// ============================================================================

export default {
  getTeamIdentity,
  getTeamColour,
  teamColours,
};