<!-- PLAN_HASH: 8jkq3sfk8j9n -->
# SectorOne
Swarm: default
Phase: 1 [PENDING] | Updated: 2026-05-04T05:24:29.444Z

---
## Phase 1: OSM Satellite Track Map with MapLibre GL [PENDING]
- [ ] 1.1: Create circuit coordinate projection utility and circuit lat/lng reference lookup [SMALL]
- [ ] 1.2: Create SatelliteTrackMap component using MapLibre GL with ESRI satellite tiles [MEDIUM]
- [ ] 1.3: Create strategy-lab replay page with satellite track map and replay side panels [MEDIUM]
- [ ] 1.4: Fix driver dot colors to team colors, add name labels, remove cyan track [SMALL]

---
## Phase 2: OpenRouter Integration for Real Data [PENDING]
- [ ] 2.1: Create OpenRouter API client with web search support [SMALL]
- [ ] 2.2: Create fantasy driver data API route [SMALL]
- [ ] 2.3: Create PU component data API route [SMALL]
- [ ] 2.4: Replace mock fantasy data with API-fetched data in components [MEDIUM]
- [ ] 2.5: Replace mock PU data with API-fetched data [SMALL]

---
## Phase 3: Mobile, Polish & Deploy [PENDING]
- [ ] 3.1: Write tests for API routes and SatelliteTrackMap component [MEDIUM]
- [ ] 3.2: Add client-side localStorage caching for AI API responses [SMALL]
- [ ] 3.3: Polish Strategy Lab UX (loading, error states, keyboard shortcuts) [MEDIUM]
- [ ] 3.4: Make strategy-lab layout responsive for mobile [SMALL]
- [ ] 3.5: Vercel deploy setup with env var checklist [SMALL]

---
## Phase 4: Pre-Deployment Polish [COMPLETE]
- [x] 4.1: Add error.tsx boundaries for archive, fantasy, standings, strategy-lab routes [MEDIUM]
- [x] 4.2: Add loading.tsx skeletons for archive, standings, strategy-lab [MEDIUM]
- [x] 4.3: Add SEO metadata (titles, descriptions, OG) for all pages [MEDIUM]
- [x] 4.4: Polish landing page HeroDashboard component [SMALL]
- [x] 4.5: Add session search functionality to archive [MEDIUM]
- [x] 4.6: Build basic Settings page (theme toggle container, preferences shell) [SMALL]
- [x] 4.7: Polish auth flow (password reset UX, email verification badge) [SMALL]
