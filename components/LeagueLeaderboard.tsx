"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DataCard } from "@/components/DataCard";

// --- Types ---
export interface LeagueEntry {
  playerName: string;
  teamName: string;
  totalPoints: number;
  rankTrend: "up" | "down" | "neutral";
}

export interface LeagueData {
  id: string;
  name: string;
  inviteCode: string;
  members: LeagueEntry[];
}

interface LeagueLeaderboardProps {
  league?: LeagueData | null;
  onCreateLeague?: (name: string) => void;
  onJoinLeague?: (code: string) => void;
  isLoading?: boolean;
  className?: string;
}

// Rank trend arrow
function TrendIcon({ direction }: { direction: "up" | "down" | "neutral" }) {
  if (direction === "up") {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="18 15 12 9 6 15" />
      </svg>
    );
  }
  if (direction === "down") {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    );
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a0a0a0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

// Empty state
function EmptyLeagueState({ onShowCreate, onShowJoin }: { onShowCreate: () => void; onShowJoin: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-white/[0.05] flex items-center justify-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-f1-silver/40">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      </div>
      <h3 className="font-heading text-lg font-bold text-f1-white mb-2">No League Yet</h3>
      <p className="text-f1-silver text-sm mb-6 max-w-sm">
        Create a league to compete with friends, or join one with an invite code
      </p>
      <div className="flex gap-3">
        <Button variant="accent" size="md" onClick={onShowCreate}>
          Create League
        </Button>
        <Button variant="outline" size="md" onClick={onShowJoin}>
          Join League
        </Button>
      </div>
    </div>
  );
}

export function LeagueLeaderboard({
  league,
  onCreateLeague,
  onJoinLeague,
  isLoading = false,
  className = "",
}: LeagueLeaderboardProps) {
  const [view, setView] = useState<"none" | "create" | "join">("none");
  const [leagueName, setLeagueName] = useState("");
  const [inviteCode, setInviteCode] = useState("");

  // No league — show create/join prompts
  if (!league && view === "none") {
    return (
      <Card variant="glass" padding="lg" className={className}>
        <EmptyLeagueState
          onShowCreate={() => setView("create")}
          onShowJoin={() => setView("join")}
        />
      </Card>
    );
  }

  // Create League form
  if (!league && view === "create") {
    return (
      <Card variant="glass" padding="lg" className={className}>
        <h3 className="font-heading text-lg font-bold text-f1-white mb-4">Create League</h3>
        <div className="space-y-4">
          <div>
            <label className="block font-mono text-[0.625rem] font-semibold tracking-[0.12em] uppercase text-f1-silver/60 mb-1.5">
              League Name
            </label>
            <input
              type="text"
              value={leagueName}
              onChange={(e) => setLeagueName(e.target.value)}
              placeholder="e.g. Championship Challengers"
              className="w-full px-3 py-2.5 rounded-lg bg-white/[0.08] border border-white/10 text-sm text-f1-white placeholder:text-f1-silver/40 focus:outline-none focus:border-accent/50 transition-colors"
            />
          </div>
          <div className="flex gap-3">
            <Button
              variant="accent"
              size="md"
              disabled={!leagueName.trim() || isLoading}
              onClick={() => {
                onCreateLeague?.(leagueName.trim());
                setLeagueName("");
                setView("none");
              }}
            >
              {isLoading ? "Creating..." : "Create"}
            </Button>
            <Button variant="ghost" size="md" onClick={() => { setView("none"); setLeagueName(""); }}>
              Cancel
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // Join League form
  if (!league && view === "join") {
    return (
      <Card variant="glass" padding="lg" className={className}>
        <h3 className="font-heading text-lg font-bold text-f1-white mb-4">Join League</h3>
        <div className="space-y-4">
          <div>
            <label className="block font-mono text-[0.625rem] font-semibold tracking-[0.12em] uppercase text-f1-silver/60 mb-1.5">
              Invite Code
            </label>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="e.g. F1-ABCD"
              className="w-full px-3 py-2.5 rounded-lg bg-white/[0.08] border border-white/10 text-sm text-f1-white placeholder:text-f1-silver/40 focus:outline-none focus:border-accent/50 transition-colors font-mono uppercase tracking-wider"
            />
          </div>
          <div className="flex gap-3">
            <Button
              variant="accent"
              size="md"
              disabled={!inviteCode.trim() || isLoading}
              onClick={() => {
                onJoinLeague?.(inviteCode.trim());
                setInviteCode("");
                setView("none");
              }}
            >
              {isLoading ? "Joining..." : "Join"}
            </Button>
            <Button variant="ghost" size="md" onClick={() => { setView("none"); setInviteCode(""); }}>
              Cancel
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // League leaderboard
  if (!league) return null;

  // Sort members by totalPoints descending
  const sortedMembers = [...league.members].sort((a, b) => b.totalPoints - a.totalPoints);
  const leaderPoints = sortedMembers[0]?.totalPoints || 0;

  return (
    <Card glow="accent" variant="glass" padding="none" className={className}>
      {/* League Header */}
      <div className="px-6 py-5 border-b border-white/[0.05]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading text-xl font-bold text-f1-white">{league.name}</h2>
            <p className="text-xs text-f1-silver/60 mt-0.5">
              {league.members.length} member{league.members.length !== 1 ? "s" : ""} · Code: <span className="font-mono text-accent">{league.inviteCode}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 px-6 py-4 border-b border-white/[0.05]">
        <DataCard label="Members" value={league.members.length} />
        <DataCard label="Leader Points" value={leaderPoints} />
        <DataCard
          label="Gap to Lead"
          value={sortedMembers.length > 1 && leaderPoints > 0
            ? (leaderPoints - sortedMembers[1].totalPoints).toFixed(0)
            : "—"}
          unit="pts"
        />
      </div>

      {/* Leaderboard Table */}
      <div className="overflow-x-auto">
        {sortedMembers.map((entry, index) => {
          const gap = leaderPoints - entry.totalPoints;
          return (
            <div
              key={entry.playerName}
              className="flex items-center gap-4 px-6 py-4 border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
            >
              {/* Position */}
              <div className="w-8 text-center shrink-0">
                <span className={`font-heading font-bold text-sm ${
                  index === 0 ? "text-yellow-400" :
                  index === 1 ? "text-gray-400" :
                  index === 2 ? "text-amber-600" :
                  "text-f1-silver/60"
                }`}>
                  {index + 1}
                </span>
              </div>

              {/* Player Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-f1-white truncate">
                  {entry.playerName}
                </p>
                <p className="text-xs text-f1-silver/60 truncate">
                  {entry.teamName}
                </p>
              </div>

              {/* Rank Trend */}
              <div className="w-6 shrink-0">
                <TrendIcon direction={entry.rankTrend} />
              </div>

              {/* Points */}
              <div className="text-right shrink-0">
                <span className="font-heading font-black text-base text-f1-white">
                  {entry.totalPoints}
                </span>
                <span className="text-[10px] text-f1-silver/40 ml-1">pts</span>
              </div>

              {/* Gap to Leader */}
              <div className="w-16 text-right shrink-0">
                <span className="text-xs font-mono text-f1-silver/60">
                  {gap > 0 ? `+${gap}` : "—"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}