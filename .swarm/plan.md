<!-- PLAN_HASH: 59eja5964jpj -->
# SectorOne
Swarm: default
Phase: 1 [COMPLETE] | Updated: 2026-05-03T02:42:01.360Z

---
## Phase 1: Project Setup & Foundation [COMPLETE]
- [x] 1.1: Scaffold Next.js project with TypeScript using create-next-app [SMALL]
- [x] 1.2: Configure Tailwind CSS with custom theme, import globals.css [SMALL] (depends: 1.1)
- [x] 1.3: Set up app directory with root layout and default home page [SMALL] (depends: 1.2)
- [x] 1.4: Define TypeScript types for all F1 data entities [SMALL] (depends: 1.3)
- [x] 1.5: Create OpenF1 API client with rate limiting and typed endpoints [SMALL] (depends: 1.4)
- [x] 1.6: Install Firebase SDK, set up config with env vars [SMALL] (depends: 1.3)
- [x] 1.7: Build Firebase Auth context provider with useAuth hook [SMALL] (depends: 1.6)
- [x] 1.8: Implement ProtectedRoute wrapper [SMALL] (depends: 1.7)
- [x] 1.9: Configure Vercel deployment config and env template [SMALL] (depends: 1.3)

---
## Phase 2: SectorOne Branding & Design System [COMPLETE]
- [x] 2.1: Rebrand app layout, metadata, landing page, and favicon to SectorOne [SMALL] (depends: 1.3)
- [x] 2.2: Install Space Grotesk and Inter fonts via next/font/google, update theme config [SMALL] (depends: 2.1)
- [x] 2.3: Build sidebar navigation with Archive, Strategy Lab, Fantasy, Settings sections [MEDIUM] (depends: 2.2)
- [x] 2.4: Build glassmorphic Card component [SMALL] (depends: 2.2)
- [x] 2.5: Build Button components (primary and ghost) [SMALL] (depends: 2.2)
- [x] 2.6: Build Chip component for tyre compounds and status indicators [SMALL] (depends: 2.2)
- [x] 2.7: Build Input component with dark styling and F1 Red focus [SMALL] (depends: 2.2)

---
## Phase 3: Race Archive (Session Browser) [COMPLETE]
- [x] 3.1: Build Archive grid page with GP cards showing circuit outlines, podium, and session info [MEDIUM] (depends: 1.5, 2.3)
- [x] 3.2: Add filters for circuit type, weather, and search to the Archive page [SMALL] (depends: 3.1)
- [x] 3.3: Build session detail page with replay launch and session info [SMALL] (depends: 3.1)

---
## Phase 4: Strategy Lab (Race Replay Engine) [COMPLETE]
- [x] 4.1: Build Canvas track map with circuit rendering, driver dots, active sector highlighting [MEDIUM] (depends: 1.4, 1.5)
- [x] 4.2: Build race data service and frame buffer for sequential replay frames [MEDIUM] (depends: 1.5, 3.1)
- [x] 4.3: Build replay playback engine and bottom timeline controls with event markers [MEDIUM] (depends: 4.1, 4.2)
- [x] 4.4: Build scrollable leaderboard with position, driver, team color, gap, tyre life, stint count, and retired OUT indicators [MEDIUM] (depends: 4.2)
- [x] 4.5: Build floating driver telemetry HUD: speed, gear, RPM bar, DRS, throttle, brake [MEDIUM] (depends: 4.3, 4.4)
- [x] 4.6: Build lap and time display showing current lap, total laps, elapsed race time [SMALL] (depends: 4.2)
- [x] 4.7: Build gap-to-leader chart and tyre degradation heatmap side panels [SMALL] (depends: 4.2)
- [x] 4.8: Build weather radar visualization with precipitation radar and stats [SMALL] (depends: 4.2)
- [x] 4.9: Build safety car visualization on track map with deploy, on-track, return phases [SMALL] (depends: 4.1, 4.2)
- [x] 4.10: Build race control messages feed showing flags, SC/VSC, and session status changes [SMALL] (depends: 4.2)
- [x] 4.11: Build pit stop event display with driver, timing, and tyre compound [SMALL] (depends: 4.2)
- [x] 4.12: Build strategic pit window predictor widget [SMALL] (depends: 4.2, 4.4)

---
## Phase 5: Championship Standings [COMPLETE]
- [x] 5.1: Build driver and constructor standings page with points, wins, podiums, and team color bars [MEDIUM] (depends: 1.5, 2.3)
- [x] 5.2: Build form chart bars (last 5 races) for each driver in standings [SMALL] (depends: 5.1)
- [x] 5.3: Build points progression chart with multi-driver heartbeat lines [SMALL] (depends: 5.1)
- [x] 5.4: Build leading constructor card with driver point split bars [SMALL] (depends: 5.1)
- [x] 5.5: Build year-aware team identity service with historical color mapping [SMALL] (depends: 5.1)
- [x] 5.6: Build power unit component usage tracker showing each driver's ICE/turbo/MGU-H/MGU-K/ES/CE/exhaust counts with penalty indicators [MEDIUM] (depends: 1.5, 5.1)

---
## Phase 6: Fantasy F1 League [PENDING]
- [x] 6.1: Build fantasy team dashboard: team name, total points, budget bar, points history chart [MEDIUM] (depends: 1.7, 2.3, 5.1)
- [ ] 6.2: Build fantasy points scoring system based on real race results [SMALL] (depends: 1.5)
- [ ] 6.3: Build roster editor with driver browsing, budget tracking, and save/revert [MEDIUM] (depends: 6.1, 6.2)
- [ ] 6.4: Build league system: create, join, and view league leaderboards with rank trends [MEDIUM] (depends: 6.1)
- [ ] 6.5: Implement Firestore persistence for fantasy teams and league data [SMALL] (depends: 1.6, 6.1)
