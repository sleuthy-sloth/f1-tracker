<!-- PLAN_HASH: 4xovlmytqjjn -->
# Fix Race Replay Layout: TelemetryHUD, Mobile, Satellite
Swarm: satellite-map-fix
Phase: 2 [COMPLETE] | Updated: 2026-05-05T16:43:13.732Z

---
## Phase 2: Fix Session Loading Pipeline [COMPLETE]
- [x] 2.1: Add fetch timeout to all fetchOpenF1 calls [SMALL]
- [x] 2.2: Fix worker error handling [SMALL]
- [x] 2.3: Add processing status indicator [SMALL]
- [x] 2.4: Expand circuit lookup table [SMALL]

---
## Phase 3: Fix Lap Counter & Progressive Loading [COMPLETE]
- [x] 3.1: Fix lap counter to use real OpenF1 lap data [MEDIUM]
- [x] 3.2: Hide unloaded drivers from TrackMap during progressive streaming [SMALL]
- [x] 3.3: Add streaming indicator overlay on TrackMap while driver data loads [SMALL]

---
## Phase 4: Fix Map Overlay, Mobile Layout & Satellite [COMPLETE]
- [x] 4.1: Fix TelemetryHUD: hide when no driver selected, add close button, responsive sizing [SMALL]
- [x] 4.2: Add mobile tab bar (MAP | STANDINGS | STRATEGY) for Strategy Lab [MEDIUM]
- [x] 4.3: Fix SatelliteTrackMap: swap to CartoDB dark tiles, fix fonts, increase timeout [MEDIUM]
