<!-- PLAN_HASH: 3glu4bimb8f3o -->
# Fix Race Replay Session Loading: Timeouts, Error Handling, Circuit Lookup
Swarm: satellite-map-fix
Phase: 2 [PENDING] | Updated: 2026-05-04T16:47:22.609Z

---
## Phase 2: Fix Session Loading Pipeline [COMPLETE]
- [x] 2.1: Add fetch timeout: Add AbortController with 30s timeout to all fetchOpenF1 calls to prevent hanging requests from blocking the entire session load [SMALL]
- [x] 2.2: Fix worker error handling: Add worker.onerror handler to catch worker load/runtime failures, move worker.onmessage before postMessage to avoid race condition [SMALL]
- [x] 2.3: Add processing status indicator: Show a subtle status bar/badge during isProcessing phase so user knows data is loading, handle empty replay frames gracefully [SMALL]
- [x] 2.4: Expand circuit lookup table: Add newer F1 circuits (2025 season) to circuit-lookup.ts to prevent SatelliteTrackMap from failing on unknown circuit keys [SMALL]
