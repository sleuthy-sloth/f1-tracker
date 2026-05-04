import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { CircuitOutline } from "@/components/CircuitOutline";
import Link from "next/link";
import type { Meeting, Session, PodiumEntry } from "@/lib/types";

interface GpCardProps {
  meeting: Meeting;
  sessions: Session[];
  podium?: PodiumEntry[];
}

/**
 * Convert country code to flag emoji
 */
function getFlagEmoji(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) {
    return "🏁";
  }
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
  if (isNaN(startDate.getTime())) return start;
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
export function GpCard({ meeting, sessions, podium: initialPodium }: GpCardProps) {
  const [podium, setPodium] = useState<PodiumEntry[] | undefined>(initialPodium);
  const [isLoadingPodium, setIsLoadingPodium] = useState(false);

  // Find the session to link to (prefer Race, then first available)
  const raceSession = sessions.find((s) => s.session_type === "Race");
  const targetSession = raceSession || sessions[0];

  // Lazy load podium data if not provided
  useEffect(() => {
    if (podium || !raceSession) return;

    async function fetchPodium() {
      setIsLoadingPodium(true);
      try {
        const res = await fetch(`/api/data/podium?session_key=${raceSession?.session_key}`);
        const data = await res.json();
        if (data.success && data.podium) {
          setPodium(data.podium);
        }
      } catch (err) {
        console.error("Failed to fetch podium:", err);
      } finally {
        setIsLoadingPodium(false);
      }
    }

    fetchPodium();
  }, [podium, raceSession]);

  // Get unique session types for this meeting
  const uniqueSessionTypes = [...new Set(sessions.map((s) => s.session_type))];

  const linkHref = targetSession ? `/archive/${targetSession.session_key}` : "#";

  // Build circuit identifier for CircuitOutline
  const circuitName = meeting.circuit_short_name?.toLowerCase().replace(/\s+/g, '_') || "";

  return (
    <Card glow="accent" variant="glass" padding="md" hoverable>
      <div className="flex flex-col gap-3">
        {/* Top row: Circuit SVG + Info */}
        <div className="flex gap-4">
          {/* Circuit Image */}
          <div className="shrink-0 w-[90px] h-[90px] rounded-lg overflow-hidden bg-white/[0.03]">
            {meeting.circuit_image ? (
              <img
                src={meeting.circuit_image}
                alt={`${meeting.circuit_short_name} circuit`}
                className="w-full h-full object-contain"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <CircuitOutline
                  circuitName={circuitName}
                  size={80}
                  strokeWidth={2}
                  glowColor="#6366F1"
                />
              </div>
            )}
          </div>

          {/* Meeting Info */}
          <div className="flex-1 min-w-0">
            {/* Circuit type badge */}
            <Chip
              label={meeting.circuit_type === "street" ? "Street" : "Race"}
              variant="status"
              color={meeting.circuit_type === "street" ? "blue" : "gray"}
              size="sm"
            />

            {/* Meeting name */}
            <h3 className="font-heading text-lg font-bold text-f1-white leading-tight mt-2">
              {meeting.meeting_name}
            </h3>
            <p className="text-f1-silver text-sm mt-0.5">
              {meeting.circuit_short_name}, {meeting.country_name} {getFlagEmoji(meeting.country_code)}
            </p>
            <p className="text-f1-silver/50 text-xs mt-1 font-mono">
              {formatDateRange(meeting.date_start, meeting.date_end)}
            </p>
          </div>
        </div>

        {/* Podium Results */}
        {isLoadingPodium ? (
          <div className="flex gap-2 mt-1 px-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-5 w-16 bg-white/5 rounded-full animate-pulse" />
            ))}
          </div>
        ) : podium && podium.length > 0 && (
          <div className="flex items-center gap-3 mt-1 px-1">
            {podium.map((entry) => (
              <div key={entry.position} className="flex items-center gap-1.5">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  entry.position === 1 ? "bg-yellow-400/20 text-yellow-400" :
                  entry.position === 2 ? "bg-gray-400/20 text-gray-400" :
                  "bg-amber-600/20 text-amber-600"
                }`}>
                  {entry.position}
                </span>
                <span className="text-xs text-f1-silver font-medium">{entry.driver_name}</span>
              </div>
            ))}
          </div>
        )}

        {/* Session type badges */}
        {uniqueSessionTypes.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
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

        {/* Cyan CTA Button (rendered as a styled link, not nested) */}
        {targetSession && (
          <div className="mt-1">
            <Link
              href={linkHref}
              className="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold tracking-wider uppercase transition-all duration-200 bg-accent text-white shadow-[var(--glow-accent)] hover:bg-accent/90 hover:shadow-[0_0_15px_rgba(99,102,241,0.4),0_0_30px_rgba(99,102,241,0.2)]"
            >
              VIEW FULL TELEMETRY
            </Link>
          </div>
        )}
      </div>
    </Card>
  );
}