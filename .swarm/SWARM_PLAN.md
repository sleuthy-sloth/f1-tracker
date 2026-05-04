# Fix Satellite Track Map: SSR + Overlay + Canvas Fallback
Swarm: satellite-map-fix
Phase: 1 [COMPLETE] | Updated: 2026-05-04T16:14:29.861Z

---
## Phase 1: Fix Satellite Map Display in Race Replay [COMPLETE]
- [x] 1.1: Fix SSR issue: Replace static SatelliteTrackMap import in strategy-lab/page.tsx with next/dynamic({ ssr: false }) to prevent maplibre-gl from being evaluated during server rendering [SMALL]
- [x] 1.2: Fix overlay z-index: Change the 'Processing Telemetry' overlay in strategy-lab/page.tsx (lines 506-516) to only block the map while isLoading is true, not while isProcessing (worker running). Map can show satellite tiles/track independently of replay engine having frames. [SMALL]
- [x] 1.3: Add graceful canvas TrackMap fallback: When SatelliteTrackMap hits error state (WebGL failure, unknown circuit, tile load failure), render the existing canvas-based TrackMap component instead. Wire up fallback in strategy-lab/page.tsx with a mapError state that triggers TrackMap rendering. [MEDIUM]
- [x] 1.4: Add React error boundary around the map: Create MapErrorBoundary component that catches runtime errors from maplibre-gl (WebGL unavailable, etc.) and renders TrackMap as fallback instead of crashing the whole page. [SMALL]
