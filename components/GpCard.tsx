"use client";

import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import type { Meeting, Session } from "@/lib/types";

interface GpCardProps {
  meeting: Meeting;
  sessions: Session[];
}

/**
 * Convert country code to flag emoji
 */
function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

/**
 * Format date range for display
 */
function formatDateRange(start: string, end: string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);

  const month = startDate.toLocaleString("en-US", { month: "short" });
  const year = startDate.getFullYear();

  // Same day
  if (startDate.toDateString() === endDate.toDateString()) {
    return `${month} ${startDate.getDate()}, ${year}`;
  }

  // Different days in same month
  if (startDate.getMonth() === endDate.getMonth()) {
    return `${month} ${startDate.getDate()}-${endDate.getDate()}, ${year}`;
  }

  // Different months
  const endMonth = endDate.toLocaleString("en-US", { month: "short" });
  return `${month} ${startDate.getDate()} - ${endMonth} ${endDate.getDate()}, ${year}`;
}

/**
 * Get session type chip color
 */
function getSessionChipColor(sessionType: string): "red" | "yellow" | "blue" | "gray" {
  switch (sessionType) {
    case "Race":
      return "red";
    case "Sprint":
      return "yellow";
    case "Qualifying":
    case "Sprint Qualifying":
      return "blue";
    default:
      return "gray";
  }
}

/**
 * Get display name for session type
 */
function getSessionDisplayName(sessionType: string): string {
  switch (sessionType) {
    case "Race":
      return "Race";
    case "Sprint":
      return "Sprint";
    case "Qualifying":
      return "Qualifying";
    case "Sprint Qualifying":
      return "Sprint Quali";
    case "Practice 1":
      return "P1";
    case "Practice 2":
      return "P2";
    case "Practice 3":
      return "P3";
    default:
      return sessionType;
  }
}

/**
 * GpCard - Displays a Grand Prix weekend card with session info
 */
export function GpCard({ meeting, sessions }: GpCardProps) {
  // Get unique session types for this meeting
  const uniqueSessionTypes = [...new Set(sessions.map((s) => s.session_type))];

  // Find the session to link to (prefer Race, then first available)
  const raceSession = sessions.find((s) => s.session_type === "Race");
  const targetSession = raceSession || sessions[0];
  const linkHref = targetSession ? `/archive/${targetSession.session_key}` : "#";

  // Circuit type badge color
  const circuitTypeColor = meeting.circuit_type === "street" ? "blue" : "gray";

  return (
    <Card variant="glass" padding="md" hoverable>
      <div className="flex flex-col gap-3">
        {/* Header: Circuit type badge + Meeting name */}
        <div className="flex items-start justify-between">
          <Chip
            label={meeting.circuit_type === "street" ? "Street" : "Race"}
            variant="status"
            color={circuitTypeColor}
            size="sm"
          />
        </div>

        {/* Meeting name */}
        <div>
          <h3 className="font-heading text-lg font-bold text-f1-white leading-tight">
            {meeting.meeting_name}
          </h3>
          <p className="text-f1-silver text-sm mt-1">
            {meeting.circuit_short_name}, {meeting.country_name} {getFlagEmoji(meeting.country_code)}
          </p>
        </div>

        {/* Date range */}
        <p className="text-f1-silver/70 text-xs">
          {formatDateRange(meeting.date_start, meeting.date_end)}
        </p>

        {/* Session type badges */}
        {uniqueSessionTypes.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {uniqueSessionTypes.map((sessionType) => (
              <Chip
                key={sessionType}
                label={getSessionDisplayName(sessionType)}
                variant="status"
                color={getSessionChipColor(sessionType)}
                size="sm"
              />
            ))}
          </div>
        ) : (
          <p className="text-f1-silver/50 text-xs">No sessions available</p>
        )}

        {/* View Sessions Link */}
        {targetSession && (
          <div className="mt-2">
            <Link href={linkHref} className="inline-block">
              <Button variant="ghost" size="sm">
                View Sessions
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Button>
            </Link>
          </div>
        )}
      </div>
    </Card>
  );
}