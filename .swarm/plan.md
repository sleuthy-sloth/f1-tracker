<!-- PLAN_HASH: 1o1usl5ddygmg -->
# F1 Tracker
Swarm: default
Phase: 1 [PENDING] | Updated: 2026-05-01T03:14:03.528Z

---
## Phase 1: Project Setup & Foundation [PENDING]
- [ ] 1.1: Scaffold Next.js project with TypeScript using create-next-app - targets: package.json, tsconfig.json, next.config.ts [SMALL]
- [ ] 1.2: Configure Tailwind CSS with custom theme, import globals.css - targets: tailwind.config.ts, app/globals.css [SMALL] (depends: 1.1)
- [ ] 1.3: Set up app directory with root layout and default home page - targets: app/layout.tsx, app/page.tsx [SMALL] (depends: 1.2)
- [ ] 1.4: Define TypeScript types for all F1 data entities: Session, Driver, Lap, TelemetrySnapshot, TrackLayout, RaceEvent, WeatherReading - targets: lib/types.ts [SMALL] (depends: 1.3)
- [ ] 1.5: Create OpenF1 API client with base URL, fetch wrapper, exponential-backoff rate-limit handling, typed endpoint functions - targets: lib/api/openf1.ts [SMALL] (depends: 1.4)
- [ ] 1.6: Install Firebase SDK, set up config with env vars, initialize Firebase app - targets: lib/firebase.ts, .env.local [SMALL] (depends: 1.3)
- [ ] 1.7: Build Firebase Auth context provider with sign-up, login, logout, session persistence, useAuth hook - targets: lib/auth/AuthContext.tsx, lib/auth/useAuth.ts [SMALL] (depends: 1.6)
- [ ] 1.8: Implement ProtectedRoute wrapper that redirects unauthenticated users - targets: components/ProtectedRoute.tsx [SMALL] (depends: 1.7)
- [ ] 1.9: Configure Vercel deployment: env vars template, build settings - targets: .env.local.example, vercel.json [SMALL] (depends: 1.3)

---
## Phase 2: Session Browser & User Accounts [PENDING]
- [ ] 2.1: Build session listing page: fetch years, rounds, session types from OpenF1 API - targets: app/sessions/page.tsx, components/SessionBrowser.tsx [MEDIUM] (depends: 1.5)
- [ ] 2.2: Build session detail page with event info, circuit, country, date - targets: app/sessions/[year]/[round]/page.tsx [SMALL] (depends: 2.1)
- [ ] 2.3: Build Firebase Auth sign-up page - targets: app/auth/signup/page.tsx [SMALL] (depends: 1.7, 1.8)
- [ ] 2.4: Build Firebase Auth login page with password reset - targets: app/auth/login/page.tsx [SMALL] (depends: 2.3)
- [ ] 2.5: Build user account settings page - targets: app/auth/account/page.tsx [SMALL] (depends: 2.4)
- [ ] 2.6: Implement Firestore user preferences: save and load favorite sessions - targets: lib/userPreferences.ts, components/FavoriteButton.tsx [SMALL] (depends: 2.2, 2.5)
- [ ] 2.7: Build watch history component showing recently viewed sessions - targets: components/WatchHistory.tsx [SMALL] (depends: 2.6)

---
## Phase 3: Race Replay Engine [PENDING]
- [ ] 3.1: Build Canvas track map component rendering circuit from coordinate array - targets: components/TrackMap.tsx [SMALL] (depends: 1.4)
- [ ] 3.2: Build track rendering utilities: coordinate scaling, rotation, driver positioning - targets: utils/trackRenderer.ts [SMALL] (depends: 3.1)
- [ ] 3.3: Build race data service fetching telemetry, positions, laps, weather from OpenF1 - targets: lib/raceData.ts [MEDIUM] (depends: 1.5, 2.2)
- [ ] 3.4: Build frame buffer with sequential access and pre-fetching - targets: lib/frameBuffer.ts [SMALL] (depends: 3.3)
- [ ] 3.5: Implement replay playback engine hook: play/pause, seek, speed multiplier - targets: hooks/useReplayEngine.ts [SMALL] (depends: 3.2, 3.4)
- [ ] 3.6: Build leaderboard: positions, names, team colors, lap counts, OUT status - targets: components/Leaderboard.tsx [MEDIUM] (depends: 3.4)
- [ ] 3.7: Implement driver selection and telemetry HUD: speed, gear, throttle, brake, DRS - targets: components/DriverTelemetryHUD.tsx, hooks/useDriverSelection.ts [SMALL] (depends: 3.5, 3.6)

---
## Phase 4: Telemetry & Insights [PENDING]
- [ ] 4.1: Build weather and session info panel: lap, time, temps, humidity, wind - targets: components/WeatherPanel.tsx, components/SessionInfoBar.tsx [SMALL] (depends: 3.4)
- [ ] 4.2: Build race control messages feed: flags, SC/VSC status, session changes - targets: components/RaceControlFeed.tsx [SMALL] (depends: 3.4)
- [ ] 4.3: Implement safety car visualization on track map with deploy/on-track/return phases - targets: components/SafetyCar.tsx [SMALL] (depends: 3.1, 3.4)
- [ ] 4.4: Build pit stop event display: driver, timing, tyre compound - targets: components/PitStopIndicator.tsx [SMALL] (depends: 3.4)
- [ ] 4.5: Build per-driver telemetry charts: speed trace, gear distribution, throttle/brake timeline - targets: components/TelemetryCharts.tsx, utils/chartRenderer.ts [MEDIUM] (depends: 3.4, 3.7)

---
## Phase 5: Mobile Responsiveness & Polish [PENDING]
- [ ] 5.1: Implement responsive mobile-first layout for replay: collapsible panels, touch targets - targets: app/replay/[sessionId]/page.tsx, styles/replay.css [MEDIUM] (depends: 3.5, 3.6)
- [ ] 5.2: Add touch replay controls: tap to play/pause, swipe seek, pinch zoom - targets: hooks/useTouchControls.ts, components/ReplayControls.tsx [SMALL] (depends: 5.1)
- [ ] 5.3: Add loading skeletons and error boundaries for API failures - targets: components/ErrorBoundary.tsx, components/LoadingSkeleton.tsx [SMALL] (depends: 2.1, 3.5)
- [ ] 5.4: Add ARIA accessibility attributes to TrackMap component - targets: components/TrackMap.tsx [SMALL] (depends: 5.3)
- [ ] 5.5: Add ARIA accessibility attributes to Leaderboard component - targets: components/Leaderboard.tsx [SMALL] (depends: 5.4)
- [ ] 5.6: Add ARIA accessibility attributes to ReplayControls component - targets: components/ReplayControls.tsx [SMALL] (depends: 5.5)
- [ ] 5.7: Performance optimization: lazy-load panels, memoize canvas render, code-split with dynamic imports - targets: app/replay/[sessionId]/page.tsx, next.config.ts [MEDIUM] (depends: 5.6)
- [ ] 5.8: Final Vercel deployment, env var audit, README with setup docs - targets: README.md [SMALL] (depends: 5.7)
