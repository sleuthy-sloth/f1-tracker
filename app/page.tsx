import Link from "next/link";
import type { Metadata } from "next";
import {
  getSessions,
  getChampionshipDrivers,
  getChampionshipTeams,
  getDrivers,
  getAvailableYears,
} from "@/lib/api/openf1";
import type {
  Session,
  ChampionshipDriver,
  ChampionshipTeam,
  Driver,
} from "@/lib/types";
import { getTeamColour } from "@/lib/teams";
import { DashboardCircuitMap } from "@/components/DashboardCircuitMap";

export const metadata: Metadata = {
  title: "SectorOne — Dashboard",
  description: "F1 race replays, championship standings, and fantasy leagues.",
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "var(--text-3)",
      }}
    >
      {children}
    </div>
  );
}

function Card({
  children,
  pad = 16,
  style,
}: {
  children: React.ReactNode;
  pad?: number;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        background: "var(--surface-1)",
        borderRadius: 6,
        border: "1px solid var(--border)",
        padding: pad,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: "var(--border)" }} />;
}

function SectionHeader({
  children,
  action,
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 14,
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-heading)",
          fontWeight: 700,
          fontSize: 13,
          color: "var(--text-1)",
          letterSpacing: "0.05em",
        }}
      >
        {children}
      </div>
      {action}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const now = new Date();
  const currentYear = now.getFullYear();

  // Fetch data in parallel — all errors are caught individually
  let availableYears: number[] = [];
  let sessions: Session[] = [];
  let driverStandings: ChampionshipDriver[] = [];
  let teamStandings: ChampionshipTeam[] = [];
  let drivers: Driver[] = [];

  try { availableYears = await getAvailableYears(); } catch { /* ignore */ }

  const year = availableYears[0] ?? currentYear;

  try { sessions = await getSessions({ year }); } catch { /* ignore */ }

  const raceSessions = sessions
    .filter((s) => s.session_type === "Race")
    .sort(
      (a, b) =>
        new Date(b.date_start).getTime() - new Date(a.date_start).getTime()
    );

  const latestRace = raceSessions.find(
    (s) => new Date(s.date_start) <= now
  );
  const nextRace = [...sessions]
    .filter((s) => new Date(s.date_start) > now)
    .sort(
      (a, b) =>
        new Date(a.date_start).getTime() - new Date(b.date_start).getTime()
    )[0];

  // Recent completed race sessions (for the recent results list)
  const recentRaces = raceSessions
    .filter((s) => new Date(s.date_start) <= now)
    .slice(0, 5);

  if (latestRace) {
    const sk = latestRace.session_key;
    try {
      driverStandings = await getChampionshipDrivers({ session_key: sk });
    } catch { /* ignore */ }
    try {
      teamStandings = await getChampionshipTeams({ session_key: sk });
    } catch { /* ignore */ }
    try {
      drivers = await getDrivers({ session_key: sk });
    } catch { /* ignore */ }
  }

  // Build driver lookup by number
  const driverByNum = new Map<number, Driver>(
    drivers.map((d) => [d.driver_number, d])
  );

  // Merge standings with driver info
  const mergedStandings = driverStandings
    .sort((a, b) => a.position_current - b.position_current)
    .slice(0, 5)
    .map((s) => {
      const d = driverByNum.get(s.driver_number);
      return {
        position: s.position_current,
        code: d?.name_acronym ?? `#${s.driver_number}`,
        name: d ? `${d.first_name} ${d.last_name}` : `Driver #${s.driver_number}`,
        team: d?.team_name ?? "Unknown",
        teamColor: d?.team_colour
          ? `#${d.team_colour}`
          : `#${getTeamColour(d?.team_name ?? "")}`,
        pts: s.points_current,
      };
    });

  const leader = mergedStandings[0];
  const maxPts = leader?.pts ?? 1;

  // Last race winner (best effort — use leader's team from last session)
  const lastRaceCircuit = latestRace?.circuit_short_name ?? "";
  const lastRaceDate = latestRace
    ? new Date(latestRace.date_start).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      })
    : null;

  // Rounds info
  const totalRaces = raceSessions.length;
  const completedRaces = raceSessions.filter(
    (s) => new Date(s.date_start) <= now
  ).length;

  const nextRaceCountry = nextRace?.country_name ?? null;
  const nextRaceCircuit = nextRace?.circuit_short_name ?? null;
  const nextRaceDate = nextRace
    ? new Date(nextRace.date_start).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      })
    : null;

  // Find a historic Race session at the same circuit so we can render its
  // GPS-traced track on the dashboard. Prefer the most recent completed race
  // — same year first, then prior years.
  const targetCircuitKey =
    nextRace?.circuit_key ?? latestRace?.circuit_key ?? null;
  let historicSessionKey: number | null = null;
  if (targetCircuitKey != null) {
    const sameCircuitThisYear = raceSessions.find(
      (s) => s.circuit_key === targetCircuitKey && new Date(s.date_start) <= now
    );
    if (sameCircuitThisYear) {
      historicSessionKey = sameCircuitThisYear.session_key;
    } else {
      // Walk back through prior years until we find a completed race at this
      // circuit. Cap at 5 years to keep dashboard load bounded.
      const priorYears = availableYears.filter((y) => y < year).slice(0, 5);
      for (const y of priorYears) {
        try {
          const priorSessions: Session[] = await getSessions({ year: y });
          const priorRace = priorSessions
            .filter(
              (s) =>
                s.session_type === "Race" &&
                s.circuit_key === targetCircuitKey &&
                new Date(s.date_start) <= now
            )
            .sort(
              (a, b) =>
                new Date(b.date_start).getTime() -
                new Date(a.date_start).getTime()
            )[0];
          if (priorRace) {
            historicSessionKey = priorRace.session_key;
            break;
          }
        } catch {
          /* try next year */
        }
      }
    }
  }

  // Silence unused-var — topTeam used implicitly via teamStandings sort below

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}>
      {/* Top bar */}
      <div
        style={{
          height: 52,
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          padding: "0 24px",
          flexShrink: 0,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: 19,
              fontWeight: 700,
              color: "var(--text-1)",
              letterSpacing: "0.03em",
            }}
          >
            DASHBOARD
          </div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              color: "var(--text-3)",
              letterSpacing: "0.08em",
              marginTop: 1,
            }}
          >
            {year} FORMULA 1 SEASON
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 24,
          display: "flex",
          flexDirection: "column",
          gap: 20,
          maxWidth: 1100,
        }}
      >
        {/* Row 1: Next race + stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr",
            gap: 12,
          }}
        >
          {/* Next race — spans 2 cols */}
          <div
            style={{
              gridColumn: "1 / 3",
              background: "var(--surface-1)",
              border: "1px solid var(--border)",
              borderRadius: 6,
              padding: 20,
              display: "flex",
              alignItems: "stretch",
              gap: 20,
            }}
          >
            <div style={{ flex: 1 }}>
              <Label>Next Round</Label>
              <div
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: 26,
                  fontWeight: 700,
                  color: "var(--text-1)",
                  lineHeight: 1,
                  marginTop: 8,
                  marginBottom: 4,
                }}
              >
                {nextRaceCountry
                  ? `${nextRaceCountry} GP`
                  : "Season Complete"}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 13,
                  color: "var(--text-2)",
                  marginBottom: 16,
                }}
              >
                {nextRaceCircuit && nextRaceDate
                  ? `${nextRaceCircuit} · ${nextRaceDate}`
                  : `${completedRaces} of ${totalRaces} rounds complete`}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Link
                  href="/archive"
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: 12,
                    fontWeight: 700,
                    padding: "7px 16px",
                    background: "var(--red)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 4,
                    letterSpacing: "0.04em",
                    textDecoration: "none",
                  }}
                >
                  VIEW CALENDAR
                </Link>
                <Link
                  href="/standings"
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: 12,
                    fontWeight: 700,
                    padding: "7px 14px",
                    background: "var(--surface-2)",
                    color: "var(--text-2)",
                    border: "1px solid var(--border)",
                    borderRadius: 4,
                    letterSpacing: "0.04em",
                    textDecoration: "none",
                  }}
                >
                  STANDINGS
                </Link>
              </div>
            </div>
            {/* Circuit shape — live GPS map seeded from last completed race
                at this circuit; falls back to SVG outline if unavailable. */}
            <div style={{ width: 90, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <DashboardCircuitMap
                historicSessionKey={historicSessionKey}
                fallbackCircuitName={nextRaceCircuit ?? lastRaceCircuit ?? ""}
                size={90}
              />
            </div>
          </div>

          {/* Last race */}
          <Card>
            <Label>Last Race</Label>
            <div
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: 17,
                fontWeight: 700,
                color: "var(--text-1)",
                lineHeight: 1.2,
                marginTop: 8,
              }}
            >
              {lastRaceCircuit ?? "—"}
            </div>
            {lastRaceDate && (
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  color: "var(--text-3)",
                  marginTop: 4,
                }}
              >
                {lastRaceDate}
              </div>
            )}
          </Card>

          {/* Season leader */}
          <Card>
            <Label>Season Leader</Label>
            <div
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: 17,
                fontWeight: 700,
                color: leader?.teamColor ?? "var(--text-1)",
                lineHeight: 1.2,
                marginTop: 8,
              }}
            >
              {leader ? `${leader.code} — ${leader.pts} pts` : "—"}
            </div>
            {leader && (
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  color: "var(--text-3)",
                  marginTop: 4,
                }}
              >
                {leader.team}
              </div>
            )}
          </Card>
        </div>

        {/* Row 2: Recent results + Championship snapshot */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
          }}
        >
          {/* Recent results */}
          <Card pad={0}>
            <div style={{ padding: "14px 16px 10px" }}>
              <SectionHeader
                action={
                  <Link
                    href="/archive"
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 9,
                      color: "var(--text-2)",
                      textDecoration: "none",
                      letterSpacing: "0.06em",
                    }}
                  >
                    VIEW ALL →
                  </Link>
                }
              >
                RECENT RESULTS
              </SectionHeader>
            </div>
            <Divider />
            {recentRaces.length === 0 ? (
              <div
                style={{
                  padding: "24px 16px",
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  color: "var(--text-3)",
                  textAlign: "center",
                }}
              >
                No race results yet
              </div>
            ) : (
              recentRaces.map((race, i) => {
                return (
                  <div key={race.session_key}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "11px 16px",
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 10,
                          color: "var(--text-3)",
                          width: 20,
                          flexShrink: 0,
                        }}
                      >
                        R{i + 1}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontFamily: "var(--font-sans)",
                            fontSize: 13,
                            fontWeight: 500,
                            color: "var(--text-1)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {race.country_name} GP
                        </div>
                        <div
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 9,
                            color: "var(--text-3)",
                            marginTop: 1,
                          }}
                        >
                          {new Date(race.date_start).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                          })}{" "}
                          · {race.circuit_short_name}
                        </div>
                      </div>
                      <Link
                        href={`/strategy-lab?session=${race.session_key}`}
                        style={{
                          fontFamily: "var(--font-heading)",
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "5px 10px",
                          background: "var(--surface-2)",
                          color: "var(--text-2)",
                          border: "1px solid var(--border)",
                          borderRadius: 3,
                          letterSpacing: "0.04em",
                          textDecoration: "none",
                          flexShrink: 0,
                        }}
                      >
                        REPLAY
                      </Link>
                    </div>
                    {i < recentRaces.length - 1 && <Divider />}
                  </div>
                );
              })
            )}
          </Card>

          {/* Constructor standings snapshot */}
          <Card pad={0}>
            <div style={{ padding: "14px 16px 10px" }}>
              <SectionHeader
                action={
                  <Link
                    href="/standings"
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 9,
                      color: "var(--text-2)",
                      textDecoration: "none",
                      letterSpacing: "0.06em",
                    }}
                  >
                    FULL STANDINGS →
                  </Link>
                }
              >
                CONSTRUCTORS
              </SectionHeader>
            </div>
            <Divider />
            <div style={{ padding: "8px 0" }}>
              {teamStandings.length === 0 ? (
                <div
                  style={{
                    padding: "16px",
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    color: "var(--text-3)",
                    textAlign: "center",
                  }}
                >
                  No standings data
                </div>
              ) : (
                teamStandings
                  .sort((a, b) => a.position_current - b.position_current)
                  .slice(0, 5)
                  .map((team) => {
                    const tc = `#${getTeamColour(team.team_name)}`;
                    const maxTeamPts =
                      teamStandings[0]?.points_current ?? 1;
                    return (
                      <div
                        key={team.team_name}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          padding: "8px 16px",
                          position: "relative",
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            left: 0,
                            top: 4,
                            bottom: 4,
                            width: 3,
                            background: tc,
                            borderRadius: "0 2px 2px 0",
                          }}
                        />
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 11,
                            color: "var(--text-3)",
                            width: 16,
                          }}
                        >
                          {team.position_current}
                        </span>
                        <span
                          style={{
                            fontFamily: "var(--font-sans)",
                            fontSize: 13,
                            color: "var(--text-1)",
                            flex: 1,
                          }}
                        >
                          {team.team_name}
                        </span>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            width: 120,
                          }}
                        >
                          <div
                            style={{
                              flex: 1,
                              height: 2,
                              background: "rgba(255,255,255,0.05)",
                              borderRadius: 99,
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                height: "100%",
                                width: `${(team.points_current / maxTeamPts) * 100}%`,
                                background: tc,
                              }}
                            />
                          </div>
                          <span
                            style={{
                              fontFamily: "var(--font-heading)",
                              fontWeight: 700,
                              fontSize: 15,
                              color: "var(--text-1)",
                              width: 36,
                              textAlign: "right",
                            }}
                          >
                            {team.points_current}
                          </span>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </Card>
        </div>

        {/* Row 3: Driver championship leaders */}
        <Card pad={0}>
          <div style={{ padding: "14px 16px 10px" }}>
            <SectionHeader
              action={
                <Link
                  href="/standings"
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 9,
                    color: "var(--text-2)",
                    textDecoration: "none",
                    letterSpacing: "0.06em",
                  }}
                >
                  FULL STANDINGS →
                </Link>
              }
            >
              CHAMPIONSHIP LEADERS
            </SectionHeader>
          </div>
          <Divider />
          <div style={{ padding: "8px 0" }}>
            {mergedStandings.length === 0 ? (
              <div
                style={{
                  padding: "24px 16px",
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  color: "var(--text-3)",
                  textAlign: "center",
                }}
              >
                No standings data available
              </div>
            ) : (
              mergedStandings.map((d) => (
                <div
                  key={d.code}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "7px 16px",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 4,
                      bottom: 4,
                      width: 3,
                      background: d.teamColor,
                      borderRadius: "0 2px 2px 0",
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      color: "var(--text-3)",
                      width: 16,
                    }}
                  >
                    {d.position}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontWeight: 700,
                      fontSize: 16,
                      color: d.teamColor,
                      width: 40,
                      letterSpacing: "0.04em",
                    }}
                  >
                    {d.code}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: 13,
                      color: "var(--text-2)",
                      flex: 1,
                    }}
                  >
                    {d.name}
                  </span>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      width: 200,
                    }}
                  >
                    <div
                      style={{
                        flex: 1,
                        height: 2,
                        background: "rgba(255,255,255,0.05)",
                        borderRadius: 99,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${(d.pts / maxPts) * 100}%`,
                          background: d.teamColor,
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontFamily: "var(--font-heading)",
                        fontWeight: 700,
                        fontSize: 16,
                        color: "var(--text-1)",
                        width: 36,
                        textAlign: "right",
                      }}
                    >
                      {d.pts}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Quick links row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {[
            { href: "/archive", label: "Race Archive", sub: "Browse & replay past sessions" },
            { href: "/fantasy", label: "Fantasy League", sub: "Manage your team & track points" },
            { href: "/strategy-lab", label: "Strategy Lab", sub: "Full replay with live telemetry" },
          ].map(({ href, label, sub }) => (
            <Link
              key={href}
              href={href}
              className="dash-quick-link"
              style={{
                display: "block",
                background: "var(--surface-1)",
                border: "1px solid var(--border)",
                borderRadius: 6,
                padding: "14px 16px",
                textDecoration: "none",
                transition: "border-color 0.12s",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-heading)",
                  fontWeight: 700,
                  fontSize: 13,
                  color: "var(--text-1)",
                  letterSpacing: "0.04em",
                  marginBottom: 4,
                }}
              >
                {label}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 12,
                  color: "var(--text-2)",
                }}
              >
                {sub}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
