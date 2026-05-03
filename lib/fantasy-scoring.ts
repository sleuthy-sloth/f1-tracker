/**
 * Fantasy F1 Scoring System
 * Pure functions for calculating fantasy points from real race results
 */

import type { SessionResult } from "@/lib/types";

/**
 * F1 fantasy points awarded per finishing position (1-indexed)
 * Matches official F1 scoring system
 */
const POSITION_POINTS: Record<number, number> = {
  1: 25,
  2: 18,
  3: 15,
  4: 12,
  5: 10,
  6: 8,
  7: 6,
  8: 4,
  9: 2,
  10: 1,
};

/** Default points for positions beyond P10 */
const DEFAULT_POINTS = 0;

/**
 * Result of fantasy scoring for a single driver
 */
export interface FantasyScoreResult {
  driver_number: number;
  position: number;
  racePoints: number;
  fastestLapBonus: number;
  qualifyingBonus: number;
  totalPoints: number;
  dnf: boolean;
  dns: boolean;
  dsq: boolean;
}

/**
 * Options for fantasy scoring calculations
 */
export interface FantasyScoringOptions {
  /** Driver number who set the fastest lap (awards +1 point) */
  fastestLapDriverNumber?: number;
  /** Top 3 qualifiers (driver numbers) for qualifying bonus: +3/+2/+1 */
  topQualifiers?: number[];
}

/**
 * Calculate fantasy points for a single race result
 * @param result - Session result from OpenF1 API
 * @param options - Optional bonuses configuration
 * @returns Detailed fantasy score breakdown
 */
export function calculateDriverScore(
  result: SessionResult,
  options?: FantasyScoringOptions
): FantasyScoreResult {
  const dnf = result.dnf || false;
  const dns = result.dns || false;
  const dsq = result.dsq || false;
  const didNotFinish = dnf || dns || dsq;

  // Race points based on position
  const racePoints = didNotFinish ? 0 : (POSITION_POINTS[result.position] ?? DEFAULT_POINTS);

  // Fastest lap bonus (+1 point if driver set fastest lap and finished)
  const fastestLapBonus =
    options?.fastestLapDriverNumber === result.driver_number && !didNotFinish ? 1 : 0;

  // Qualifying bonus (top 3 qualifiers get +3/+2/+1)
  let qualifyingBonus = 0;
  if (options?.topQualifiers && !didNotFinish) {
    const qualiIndex = options.topQualifiers.indexOf(result.driver_number);
    if (qualiIndex === 0) qualifyingBonus = 3;
    else if (qualiIndex === 1) qualifyingBonus = 2;
    else if (qualiIndex === 2) qualifyingBonus = 1;
  }

  return {
    driver_number: result.driver_number,
    position: result.position,
    racePoints,
    fastestLapBonus,
    qualifyingBonus,
    totalPoints: racePoints + fastestLapBonus + qualifyingBonus,
    dnf,
    dns,
    dsq,
  };
}

/**
 * Calculate fantasy scores for all drivers in a race
 * @param results - Array of session results from OpenF1 API
 * @param options - Optional bonuses configuration
 * @returns Sorted array of fantasy scores (highest points first)
 */
export function calculateRaceScores(
  results: SessionResult[],
  options?: FantasyScoringOptions
): FantasyScoreResult[] {
  return results
    .map((result) => calculateDriverScore(result, options))
    .sort((a, b) => {
      // Sort by total points descending, then by position ascending
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      return a.position - b.position;
    });
}

/**
 * Calculate total fantasy points across multiple races for a driver
 * @param driverNumber - Driver number to aggregate
 * @param raceScores - Array of fantasy score results from multiple races
 * @returns Total points for the season
 */
export function calculateSeasonTotal(
  driverNumber: number,
  raceScores: FantasyScoreResult[]
): number {
  return raceScores
    .filter((s) => s.driver_number === driverNumber)
    .reduce((sum, s) => sum + s.totalPoints, 0);
}