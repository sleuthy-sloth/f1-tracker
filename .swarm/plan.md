<!-- PLAN_HASH: 16e42ace74thl -->
# SectorOne
Swarm: default
Phase: 1 [COMPLETE] | Updated: 2026-05-01T19:20:00.167Z

---
## Phase 1: Project Setup & Foundation [COMPLETE]
- [x] 1.1: Scaffold Next.js project with TypeScript using create-next-app - targets: package.json, tsconfig.json, next.config.ts [SMALL]
- [x] 1.2: Configure Tailwind CSS with custom theme, import globals.css - targets: tailwind.config.ts, app/globals.css [SMALL] (depends: 1.1)
- [x] 1.3: Set up app directory with root layout and default home page - targets: app/layout.tsx, app/page.tsx [SMALL] (depends: 1.2)
- [x] 1.4: Define TypeScript types for all F1 data entities - targets: lib/types.ts [SMALL] (depends: 1.3)
- [x] 1.5: Create OpenF1 API client with rate limiting and typed endpoints - targets: lib/api/openf1.ts [SMALL] (depends: 1.4)
- [x] 1.6: Install Firebase SDK, set up config with env vars - targets: lib/firebase.ts, .env.local [SMALL] (depends: 1.3)
- [x] 1.7: Build Firebase Auth context provider with useAuth hook - targets: lib/auth/AuthContext.tsx, lib/auth/useAuth.ts [SMALL] (depends: 1.6)
- [x] 1.8: Implement ProtectedRoute wrapper - targets: components/ProtectedRoute.tsx [SMALL] (depends: 1.7)
- [x] 1.9: Configure Vercel deployment config and env template - targets: .env.local.example, vercel.json [SMALL] (depends: 1.3)

---
## Phase 2: SectorOne Branding & Design System [PENDING]
- [x] 2.1: Rebrand app layout, metadata, landing page, and favicon from F1 Tracker to SectorOne - targets: app/layout.tsx, app/page.tsx, app/favicon.ico [SMALL] (depends: 1.3)
- [x] 2.2: Install Space Grotesk and Inter fonts via next/font/google, update theme config - targets: app/layout.tsx, app/globals.css [SMALL] (depends: 2.1)
- [x] 2.3: Build sidebar navigation with Archive, Strategy Lab, Fantasy, Settings sections - targets: components/SideNav.tsx, components/MobileNav.tsx [MEDIUM] (depends: 2.2)
- [x] 2.4: Build glassmorphic Card component - targets: components/ui/Card.tsx [SMALL] (depends: 2.2)
- [ ] 2.5: Build Button components (primary and ghost) - targets: components/ui/Button.tsx [SMALL] (depends: 2.2)
- [ ] 2.6: Build Chip component for tyre compounds and status indicators - targets: components/ui/Chip.tsx [SMALL] (depends: 2.2)
- [ ] 2.7: Build Input component with dark styling and F1 Red focus - targets: components/ui/Input.tsx [SMALL] (depends: 2.2)

---
## Phase 3: Race Archive (Session Browser) [PENDING]
- [ ] 3.1: Build Archive grid page with GP cards showing circuit outlines, podium, and session info - targets: app/archive/page.tsx, components/GpCard.tsx [MEDIUM] (depends: 1.5, 2.3)
- [ ] 3.2: Add filters for circuit type and weather to the Archive page - targets: components/ArchiveFilters.tsx [SMALL] (depends: 3.1)
- [ ] 3.3: Build session detail page with replay launch and session info - targets: app/archive/[sessionKey]/page.tsx [SMALL] (depends: 3.1)

---
## Phase 4: Strategy Lab (Race Replay Engine) [PENDING]
- [ ] 4.1: Build Canvas track map with circuit rendering, driver dots, active sector highlighting - targets: components/TrackMap.tsx [MEDIUM] (depends: 1.4, 1.5)
- [ ] 4.2: Build race data service and frame buffer for sequential replay frames - targets: lib/raceData.ts, lib/frameBuffer.ts [MEDIUM] (depends: 1.5, 3.1)
- [ ] 4.3: Build replay playback engine and bottom timeline controls with event markers - targets: hooks/useReplayEngine.ts, components/TimelineControls.tsx [MEDIUM] (depends: 4.1, 4.2)
- [ ] 4.4: Build scrollable leaderboard with position, driver, team color, gap, tyre life, stint count, and retired OUT indicators - targets: components/Leaderboard.tsx [MEDIUM] (depends: 4.2)
- [ ] 4.5: Build floating driver telemetry HUD: speed, gear, RPM bar, DRS, throttle, brake - targets: components/TelemetryHUD.tsx [MEDIUM] (depends: 4.3, 4.4)
- [ ] 4.6: Build lap and time display showing current lap, total laps, elapsed race time - targets: components/LapTimeDisplay.tsx [SMALL] (depends: 4.2)
- [ ] 4.7: Build gap-to-leader chart and tyre degradation heatmap side panels - targets: components/GapChart.tsx, components/TyreWidget.tsx [SMALL] (depends: 4.2)
- [ ] 4.8: Build weather radar visualization with precipitation radar and stats - targets: components/WeatherRadar.tsx [SMALL] (depends: 4.2)
- [ ] 4.9: Build safety car visualization on track map with deploy, on-track, return phases - targets: components/SafetyCar.tsx [SMALL] (depends: 4.1, 4.2)
- [ ] 4.10: Build race control messages feed showing flags, SC/VSC, and session status changes - targets: components/RaceControlFeed.tsx [SMALL] (depends: 4.2)
- [ ] 4.11: Build pit stop event display with driver, timing, and tyre compound - targets: components/PitStopIndicator.tsx [SMALL] (depends: 4.2)
- [ ] 4.12: Build strategic pit window predictor widget - targets: components/PitWindowWidget.tsx [SMALL] (depends: 4.2, 4.4)

---
## Phase 5: Championship Standings [PENDING]
- [ ] 5.1: Build driver and constructor standings page with points, wins, podiums, and team color bars - targets: app/standings/page.tsx, components/StandingsTable.tsx [MEDIUM] (depends: 1.5, 2.3)
- [ ] 5.2: Build form chart bars (last 5 races) for each driver in standings - targets: components/FormChart.tsx [SMALL] (depends: 5.1)
- [ ] 5.3: Build points progression chart with multi-driver heartbeat lines - targets: components/PointsChart.tsx [SMALL] (depends: 5.1)
- [ ] 5.4: Build leading constructor card with driver point split bars - targets: components/ConstructorCard.tsx [SMALL] (depends: 5.1)
- [ ] 5.5: Build year-aware team identity service with historical color mapping (e.g., Audi/Sauber 2026, Chevrolet entry) - targets: lib/teams.ts [SMALL] (depends: 5.1)
- [ ] 5.6: Build power unit component usage tracker showing each driver's ICE/turbo/MGU-H/MGU-K/ES/CE/exhaust counts with penalty indicators - targets: app/standings/components/page.tsx, components/PuUsageTable.tsx [MEDIUM] (depends: 1.5, 5.1)

---
## Phase 6: Fantasy F1 League [PENDING]
- [ ] 6.1: Build fantasy team dashboard: team name, total points, budget bar, points history chart - targets: app/fantasy/page.tsx, components/FantasyDashboard.tsx [MEDIUM] (depends: 1.7, 2.3, 5.1)
- [ ] 6.2: Build fantasy points scoring system based on real race results - targets: lib/fantasy/scoring.ts [SMALL] (depends: 1.5)
- [ ] 6.3: Build roster editor with driver browsing, budget tracking, and save/revert - targets: components/RosterEditor.tsx, components/DriverCard.tsx [MEDIUM] (depends: 6.1, 6.2)
- [ ] 6.4: Build league system: create, join, and view league leaderboards with rank trends - targets: app/fantasy/leagues/page.tsx, components/LeagueLeaderboard.tsx [MEDIUM] (depends: 6.1)
- [ ] 6.5: Implement Firestore persistence for fantasy teams and league data - targets: lib/fantasy/firestore.ts [SMALL] (depends: 1.6, 6.1)

---
## Phase 7: Mobile Responsiveness & Final Polish [PENDING]
- [ ] 7.1: Implement responsive layouts for all pages: Archive, Strategy Lab, Standings, Fantasy - targets: app/archive/page.tsx, app/archive/[sessionKey]/page.tsx, app/standings/page.tsx, app/fantasy/page.tsx, app/fantasy/leagues/page.tsx [MEDIUM] (depends: 2.3, 3.1, 4.4, 5.1, 6.1)
- [ ] 7.2: Add loading skeletons, error boundaries, and graceful error handling - targets: components/ErrorBoundary.tsx, components/LoadingSkeleton.tsx [MEDIUM] (depends: 3.1, 4.3, 5.1, 6.1)
- [ ] 7.3: Add touch replay controls for mobile: tap, swipe, pinch gestures - targets: hooks/useTouchControls.ts [SMALL] (depends: 7.1)
- [ ] 7.4: Performance optimization: lazy load panels, memoize canvas, code-split routes - targets: app/*/page.tsx, next.config.ts [MEDIUM] (depends: 7.2)
- [ ] 7.5: Final deployment verification, env var audit, and README - targets: README.md, vercel.json [SMALL] (depends: 7.4)
