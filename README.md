# SectorOne

> High-performance Formula 1 telemetry suite — real-time race replay, championship standings, fantasy leagues, and historical race archives.

[![Next.js](https://img.shields.io/badge/Next.js-16.2.4-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61dafb?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06b6d4?logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

**Status:** Active development (v0.6.0) — All phases complete, ready for deployment

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Development](#development)
- [Design System](#design-system)
  - [Color Palette](#color-palette)
  - [Typography](#typography)
  - [F1 Team Colors](#f1-team-colors)
  - [Components](#components)
- [Architecture](#architecture)
  - [Data Flow](#data-flow)
  - [Auth Flow](#auth-flow)
  - [OpenF1 API Client](#openf1-api-client)
- [Testing](#testing)
- [Deployment](#deployment)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

SectorOne is a Formula 1 telemetry dashboard built with Next.js 16, React 19, TypeScript, and Tailwind CSS v4. It connects to the [OpenF1 API](https://openf1.org/) to deliver real-time race data, historical session archives, championship standings, and a fantasy F1 league system — all wrapped in a dark carbon-themed UI with glassmorphic panels and F1 team color accents.

The project is organized into six development phases, progressing from foundational infrastructure through to a fully-featured telemetry suite with AI-powered data lookups.

---

## Features

### Current (Phases 1–4)

**Foundation (Phases 1–2):**

- **Next.js 16 App Router** with Turbopack for fast development
- **28+ TypeScript types** matching OpenF1 API response shapes (sessions, drivers, telemetry, laps, weather, pit stops, stints, race control, championships, and more)
- **OpenF1 API client** with 21 typed endpoints, automatic rate limiting (3 req/s), exponential backoff, and retry logic
- **Firebase Authentication** — login, signup, logout, and password reset via React context
- **Protected routes** with `ProtectedRoute` guard wrapper and loading states
- **Dark carbon theme** with F1 Red (`#e10600`) accent and glassmorphism panels
- **Custom Tailwind v4 theme** with surface, text, accent, and radius tokens defined via `@theme inline`
- **10 F1 constructor team colors** for year-aware driver/team branding
- **Font system** — Space Grotesk (headings) and Inter (body) via `next/font`
- **Desktop SideNav** — fixed left sidebar with 5 sections and active route highlighting
- **Mobile bottom navigation** — glassmorphic nav bar with safe-area padding
- **Reusable UI components** — Card (4 variants), Button (4 variants), Chip (tyre compounds), Input (dark styling)
- **SVG favicon** with SectorOne branding

**Race Archive (Phase 3):**

- **GP Card grid** — archive page with circuit outlines, podium data, and session information
- **Archive filters** — circuit type, weather, and search filtering for race sessions
- **Session detail page** — results table with driver/team/gap/laps, back to archive navigation, and **Launch Replay** entry point

**Strategy Lab — Replay Engine (Phase 4):**

- **Real-time race data service** (`lib/raceData.ts`) — fetches OpenF1 API data and builds full `ReplayFrame` objects with driver positions, telemetry, weather, safety car status, and race control messages
- **Frame buffer** (`lib/frameBuffer.ts`) — binary-search indexed array for seeking, stepping, and range extraction across replay frames
- **Canvas track map** (`components/TrackMap.tsx`) — circuit rendering with driver dots, active sector highlighting, safety car visualization, and coordinate normalization
- **Replay playback engine** (`hooks/useReplayEngine.ts`) — custom hook with play/pause, variable speed (0.25x–20x), step forward/back, seek to index/timestamp/progress, accumulator-based sub-1x speeds, and end-of-replay detection
- **Timeline controls** (`components/TimelineControls.tsx`) — bottom bar with play/pause, speed selector, frame counter, elapsed time, clickable progress bar, and safety car/flag event markers with tooltips
- **Scrollable leaderboard** (`components/Leaderboard.tsx`) — driver positions with team color bars, gap-to-leader, tyre compound chips, tyre life bars, stint count, and OUT indicators for retired drivers
- **Driver telemetry HUD** (`components/TelemetryHUD.tsx`) — floating panel showing selected driver's speed, gear, RPM bar with redline zone, DRS status (OFF/DET/ON), throttle percentage, and brake ON/OFF with percentage
- **Lap & time display** (`components/LapTimeDisplay.tsx`) — glassmorphic card showing current lap, total laps, elapsed race time (MM:SS), and lap progress bar
- **Gap-to-leader chart** (`components/GapChart.tsx`) — live horizontal bar visualization with team colors, proportional widths, and lapped driver detection
- **Tyre degradation widget** (`components/TyreWidget.tsx`) — compound badges, tyre life bars with green/yellow/red coloring, stint count, and tyre age per driver
- **Weather radar** (`components/WeatherRadar.tsx`) — conditions grid (track/air temp, humidity, rainfall, wind), SVG precipitation radar with intensity-based coloring, pressure display
- **Safety car indicator** (`components/SafetyCar.tsx`) — status visualization with pulsing orange for deployed, yellow for returning, and dimmed for inactive
- **Race control feed** (`components/RaceControlFeed.tsx`) — scrollable message feed with color-coded flag dots, category badges, lap numbers, and timestamps
- **Pit stop indicator** (`components/PitStopIndicator.tsx`) — chronological pit event feed with driver, lap, stop duration, and tyre compound badges
- **Pit window predictor** (`components/PitWindowWidget.tsx`) — strategic insights: optimal pit window, tyre life estimation, pit loss time, undercut delta, and recommendation engine

**Championship Standings (Phase 5):**

- **Driver & constructor standings** (`components/StandingsTable.tsx`, `app/standings/`) — server-rendered page with Drivers/Constructors toggle, podium color badges (gold/silver/bronze), team color bars, and points-change indicators
- **Form chart bars** (`components/FormChart.tsx`) — last 5 race results displayed as color-coded blocks (P1=gold, P2-3=silver, P4-5=green, P6-10=yellow, >P10=orange, DNF=red)
- **Points progression chart** (`components/PointsChart.tsx`) — pure SVG multi-driver line chart with smooth bezier paths, custom axis scales, and team-colored traces
- **Leading constructor card** (`components/ConstructorCard.tsx`) — prominent leader card with driver point-split bars showing each driver's contribution percentage
- **Year-aware team identity service** (`lib/teams.ts`) — historical color mapping for 2024–2026 including Audi (2026) and Cadillac (2025+) entries with fallback handling
- **Power Unit component tracker** (`components/PuUsageTable.tsx`, `app/standings/components/`) — ICE/turbo/MGU-H/MGU-K/ES/CE/exhaust usage counts with green/yellow/red penalty indicators

**Neon Telemetry HUD Redesign (Phase 5.5):**

- **Top navigation bar** (`components/TopNav.tsx`) — horizontal nav bar replacing sidebar: logo left, tabs center (LIVE, ANALYSIS, HISTORY, SETTINGS), profile icon right. Collapses to hamburger drawer on mobile with Escape-key and click-outside dismissal
- **Hexagonal background pattern** (`public/hex-pattern.svg`, `app/globals.css`) — seamless SVG hex grid at 8% opacity applied globally via CSS multi-background
- **Neon glow design tokens** (`app/globals.css`) — CSS custom properties for cyan, yellow, and green neon glow effects with matching utility classes (`.glow-{color}`, `.text-glow-{color}`) and `--color-cyan-accent: #00D2BE`
- **Card glow variants** (`components/ui/Card.tsx`) — new `glow` prop (`"cyan" | "red" | "yellow" | "green"`) with base neon shadow that intensifies 1.5× on hover
- **Button cyan variant** (`components/ui/Button.tsx`) — new `"cyan"` variant with `#00D2BE` background, neon glow shadow, and brighter hover state
- **Archive filter sidebar** (`components/FilterSidebar.tsx`) — collapsible left sidebar with 5 filter sections (Year pills, Circuit Type, Weather, Team checkboxes, Driver Wins dropdown). Desktop: fixed sidebar. Mobile: slide-in drawer with overlay
- **Season selector** (`components/SeasonSelector.tsx`) — reusable pill-bar year selector with link mode (server routing via `hrefBase`) and button mode (client-side `onYearChange`). Selected year highlighted in cyan with glow
- **Circuit outline SVG** (`components/CircuitOutline.tsx`) — built-in simplified SVG paths for 10 F1 circuits with SVG `feGaussianBlur` neon glow filter. Supports custom glow colors via `glowColor` prop. Uses React `useId` for unique filter IDs per instance
- **DataCard** (`components/DataCard.tsx`) — reusable metric display with uppercase monospace label, large Space Grotesk value, optional unit suffix, and trend indicator (up/down/neutral arrow + text label)
- **Archive page redesign** (`components/ArchiveClient.tsx`, `app/archive/page.tsx`) — new two-column layout with FilterSidebar + SeasonSelector + GP card grid. Filter state flows from sidebar through ArchiveClient to ArchiveFilters
- **GP card redesign** (`components/GpCard.tsx`) — circuit outline SVG with cyan glow on the left, enhanced metadata layout, podium position badges, session chips, and cyan "VIEW FULL TELEMETRY" CTA link
- **Fantasy page enhancements** (`app/fantasy/page.tsx`, `components/FantasyDashboard.tsx`) — 4 DataCard metrics row (Total Points, Budget Remaining, Team Value, League Rank), Card glow wrapper for dashboard container, DataCard budget display replacing static bar
- **Standings page redesign** (`app/standings/page.tsx`, `app/standings/StandingsClient.tsx`, `components/StandingsTable.tsx`) — SeasonSelector replacing inline year pills, DataCard metrics row, Card glow wrapper, team-colored position bars with glow
- **Session replay redesign** (`app/archive/[sessionKey]/page.tsx`) — DataCard metrics row (Drivers, Finishers, Total Laps, Session Type), Card glow wrapper for results table, cyan "Launch Replay" button
- **Speed gauge** (`components/SpeedGauge.tsx`) — SVG arc gauge showing speed in KM/H with color-coded zones (green <50%, yellow <80%, red ≥80%), smooth CSS transitions
- **Tire indicator** (`components/TireIndicator.tsx`) — SVG circular progress for each position (FL, FR, RL, RR) with color-coded wear states (green >60%, yellow >30%, red ≤30%)

**OSM Satellite Track Map (Phase 6a):**

- **Satellite track map** (`components/SatelliteTrackMap.tsx`) — MapLibre GL-based track visualization with ESRI World Imagery satellite tiles, replacing the Canvas 2D TrackMap. Features geographic circuit overlay via equirectangular coordinate projection, animated driver dots colored by team identity, 3-letter driver name labels (VER, HAM, LEC), and safety car indicator. Driver positions update in real-time via GeoJSON `setData()` at 5fps with data-driven MapLibre styling
- **Coordinate projection** (`lib/circuit-projection.ts`) — equirectangular projection from local circuit X/Y meters to lat/lng for MapLibre GeoJSON overlay
- **Circuit lookup** (`lib/circuit-lookup.ts`) — reference table with 24 F1 circuits mapped to approximate geographic center coordinates
- **Strategy Lab page** (`app/strategy-lab/page.tsx`) — full-screen race replay with SatelliteTrackMap, floating TelemetryHUD, scrollable right sidebar (Leaderboard, GapChart, LapTimeDisplay, TyreWidget, WeatherRadar, RaceControlFeed, PitStopIndicator, SafetyCar, PitWindowWidget), and TimelineControls for playback at 0.25x–20x speed

**Fantasy F1 League (Phase 6b):**

- **Fantasy team dashboard** (`components/FantasyDashboard.tsx`) — team name, total points, DataCard budget bar, SVG points history chart, driver roster with team color bars, constructor display. Handles loading, empty, and populated states with neon glow card styling
- **Fantasy scoring system** (`lib/fantasy-scoring.ts`) — position-based points (25 for P1 down to 1 for P10), fastest lap bonus (+1), qualifying bonus (+3/+2/+1 for top 3). Pure functions for single driver, full race, and season total calculations
- **Roster editor** (`components/RosterEditor.tsx`) — driver browsing with search, budget tracking ($100M cap), add/remove drivers, salary cap $40M per driver, save/revert with change detection. Fetches live driver data from AI API instead of mock data
- **League system** (`components/LeagueLeaderboard.tsx`) — create/join leagues via invite codes (`FF-XXXX`), leaderboard with position medals, rank trends, gap-to-leader, and DataCard stats row
- **Firestore persistence** (`lib/fantasy-firestore.ts`) — full CRUD for fantasy teams (`/fantasy-teams/{uid}`) and leagues (`/leagues/{leagueId}` with member arrays). Invite code queries, member management, and user league discovery

**AI-Powered Data Integration (Phase 6c):**

- **AI API client** (`lib/api/openrouter.ts`) — multi-provider client supporting NVIDIA NIM (primary) and OpenRouter (fallback). Uses `deepseek-ai/deepseek-v4-pro` via NVIDIA's OpenAI-compatible endpoint with retry logic, JSON extraction, and structured schema enforcement
- **Fantasy driver data API** (`app/api/data/fantasy/route.ts`) — fetches 22 current F1 drivers (2026 season, 11 teams including Cadillac/GM) with real team colors, fantasy costs, and points via AI web search
- **PU component data API** (`app/api/data/pu/route.ts`) — fetches real power unit usage data (ICE/turbo/MGU-H/MGU-K/ES/CE/exhaust counts per driver) with grid penalty information via AI web search

**Pre-Deployment Polish (Phase 7):**

- **Error boundaries** (`app/*/error.tsx`) — route-level error.tsx components for archive, fantasy, standings, and strategy-lab with branded error messaging and Try Again buttons
- **Loading skeletons** (`app/*/loading.tsx`) — animated pulse skeletons for archive (6 GP card grid), standings (year pills + DataCards + table rows), and strategy-lab (map + side panel layout) for smoother perceived performance
- **SEO metadata** — `generateMetadata` exports on all pages with OpenGraph tags, title templates, and dynamic session-aware titles for the session detail page
- **Landing page polish** (`components/HeroDashboard.tsx`) — updated CTA buttons linking to real app routes (/archive, /standings, /fantasy), keeping telemetry showcase intact
- **Session search** — archive page search via ArchiveFilters component with circuit type, weather, and text search filtering
- **Settings page** (`app/settings/page.tsx`) — new settings hub with Account (links to /auth), Preferences (placeholder), and About (version info) sections
- **Auth flow polish** (`app/auth/page.tsx`) — sign-in/sign-up form with password reset flow, email verification, and smooth error handling

### Planned (Phases 6–7)

- ~~**Fantasy F1 League** — team dashboard, roster editor with $100M budget, league system with leaderboards, Firestore persistence~~ ✅
- **Mobile & Polish** — responsive layouts, loading skeletons, error boundaries, touch replay controls, performance optimization

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16.2.4 (App Router, Turbopack) |
| **Language** | TypeScript 5.x (strict mode) |
| **UI Library** | React 19.2 |
| **Styling** | Tailwind CSS v4 (CSS-based `@theme inline`) |
| **Runtime** | Node.js 20+ |
| **Package Manager** | npm (Bun-compatible) |
| **Authentication** | Firebase Auth |
| **Database** | Firestore |
| **Data Source** | [OpenF1 API](https://openf1.org/), AI-powered lookups via NVIDIA NIM / OpenRouter |
| **Map Engine** | MapLibre GL JS with ESRI World Imagery satellite tiles |
| **Fonts** | Space Grotesk (display), Inter (body) |
| **Linting** | ESLint 9 + `eslint-config-next` |
| **Testing** | Bun native test runner |
| **Deployment** | Vercel |

---

## Project Structure

```
├── app/
│   ├── api/
│   │   └── data/
│   │       ├── fantasy/route.ts   # AI-fetched F1 driver data endpoint
│   │       └── pu/route.ts        # AI-fetched PU component data endpoint
│   ├── archive/
│   │   ├── error.tsx              # Error boundary for archive
│   │   ├── loading.tsx            # Skeleton loading state
│   │   ├── page.tsx               # Archive grid: GP cards with circuit, podium, session info
│   │   └── [sessionKey]/
│   │       ├── page.tsx           # Session detail: results table + DataCard metrics + Card glow
│   │       ├── loading.tsx        # Skeleton loading state
│   │       └── error.tsx          # Error boundary for session detail
│   ├── auth/
│   │   └── page.tsx               # Sign in / sign up with password reset
│   ├── fantasy/
│   │   ├── error.tsx              # Error boundary for fantasy
│   │   ├── layout.tsx             # SEO metadata wrapper
│   │   └── page.tsx               # Fantasy F1 dashboard with API-fetched driver data
│   ├── settings/
│   │   └── page.tsx               # Settings page (account, preferences, about)
│   ├── standings/
│   │   ├── error.tsx              # Error boundary for standings
│   │   ├── loading.tsx            # Skeleton loading state
│   │   ├── page.tsx               # Championship standings with SeasonSelector + DataCards
│   │   ├── StandingsClient.tsx    # ViewToggle wrapper with Card glow
│   │   └── components/
│   │       └── page.tsx           # Power Unit component usage (AI-fetched data)
│   ├── strategy-lab/
│   │   ├── error.tsx              # Error boundary for replay
│   │   ├── layout.tsx             # SEO metadata wrapper
│   │   ├── loading.tsx            # Skeleton loading state
│   │   └── page.tsx               # Race replay with SatelliteTrackMap + all side panels
│   └── page.tsx                   # Landing page with SectorOne HeroDashboard
├── components/
│   ├── ArchiveClient.tsx     # Client wrapper: FilterSidebar + SeasonSelector + ArchiveFilters
│   ├── ArchiveFilters.tsx    # GP card grid with circuit type / search filtering
│   ├── CircuitOutline.tsx    # SVG circuit paths with feGaussianBlur neon glow filter
│   ├── ConstructorCard.tsx   # Leading constructor with driver point split bars
│   ├── DataCard.tsx          # Metric display: label, value, unit, trend indicator
│   ├── FantasyDashboard.tsx  # Fantasy team: roster, budget, points history + DataCard
│   ├── FilterSidebar.tsx     # Collapsible archive filter sidebar (5 sections)
│   ├── FormChart.tsx         # Last 5 race results as color-coded blocks
│   ├── GapChart.tsx          # Live gap-to-leader horizontal bar chart
│   ├── GpCard.tsx            # GP card: CircuitOutline SVG + cyan telemetry CTA
│   ├── LapTimeDisplay.tsx    # Lap counter, elapsed time, progress bar
│   ├── Leaderboard.tsx       # Scrollable leaderboard: positions, gaps, tyres, stints, OUT
│   ├── MobileNav.tsx         # Mobile bottom navigation bar (5 items)
│   ├── PitStopIndicator.tsx  # Pit stop event feed with tyre compounds
│   ├── PitWindowWidget.tsx   # Strategic pit window predictor
│   ├── PointsChart.tsx       # SVG multi-driver points progression chart
│   ├── ProtectedRoute.tsx    # Auth guard wrapper with loading spinner
│   ├── PuUsageTable.tsx      # PU component usage tracker with penalty indicators
│   ├── RaceControlFeed.tsx   # Scrollable race control messages feed
│   ├── RosterEditor.tsx      # Fantasy roster editor (API-fetched drivers, budget tracking)
│   ├── SafetyCar.tsx         # Safety car status visualization
│   ├── SatelliteTrackMap.tsx # MapLibre GL satellite track map with team-colored driver dots
│   ├── SeasonSelector.tsx    # Pill-bar year selector (link/button modes)
│   ├── SideNav.tsx           # Desktop fixed sidebar navigation
│   ├── SpeedGauge.tsx        # SVG arc speed gauge with color-coded zones
│   ├── StandingsTable.tsx    # Driver/constructor standings with team-colored position bars
│   ├── TelemetryHUD.tsx      # Floating driver telemetry: speed, gear, RPM, DRS, throttle, brake
│   ├── TimelineControls.tsx  # Bottom replay bar: play/pause, speed, progress, event markers
│   ├── TireIndicator.tsx     # SVG circular tire wear progress (FL, FR, RL, RR)
│   ├── TopNav.tsx            # Horizontal top nav bar with mobile hamburger drawer
│   ├── TrackMap.tsx          # Canvas circuit map (deprecated, kept for reference)
│   ├── TyreWidget.tsx        # Tyre degradation with compound badges and life bars
│   ├── WeatherRadar.tsx      # Weather conditions grid with SVG precipitation radar
│   └── ui/
│       ├── Button.tsx        # 5 variants (primary, secondary, ghost, outline, cyan), loading
│       ├── Card.tsx          # Glassmorphic card (4 variants + glow prop), 4 padding levels
│       ├── Chip.tsx          # Tyre compound and status indicators
│       └── Input.tsx         # Dark-styled input with F1 Red focus
├── hooks/
│   └── useReplayEngine.ts  # Replay playback: play/pause, variable speed, seek, accumulation
├── lib/
│   ├── api/
│   │   ├── openf1.ts        # OpenF1 API client (23 endpoints, rate limited, exponential backoff)
│   │   └── openrouter.ts    # AI API client (NVIDIA NIM + OpenRouter fallback)
│   ├── auth/
│   │   ├── AuthContext.tsx  # Firebase Auth context provider
│   │   └── useAuth.ts       # useAuth() hook
│   ├── circuit-lookup.ts    # 24 F1 circuit lat/lng reference table
│   ├── circuit-projection.ts # Equirectangular X/Y → lat/lng projection utilities
│   ├── fantasy-firestore.ts  # Firestore CRUD for fantasy teams + leagues
│   ├── fantasy-scoring.ts    # Fantasy points calculation engine
│   ├── firebase.ts           # Firebase config and lazy initialization
│   ├── frameBuffer.ts        # Replay frame buffer: binary search, seeking, range extraction
│   ├── raceData.ts           # Race data service: fetch, merge, build ReplayFrame objects
│   ├── teams.ts              # Year-aware team identity service (2024-2026)
│   ├── track-map.ts          # Track coordinate normalization, circuit bounds, grid alignment
│   └── types.ts              # 28+ TypeScript types for F1 data entities + replay types
├── tests/
│   ├── archive-filters.test.tsx
│   ├── archive.test.tsx
│   ├── components/
│   │   ├── Leaderboard.test.tsx
│   │   ├── TelemetryHUD.test.tsx
│   │   ├── TimelineControls.test.tsx
│   │   └── TrackMap.test.tsx
│   ├── lib/
│   │   ├── frameBuffer.test.ts
│   │   └── raceData.test.ts
│   ├── session-page.test.tsx
│   ├── adversarial/
│   │   └── track-map.adversarial.test.ts
│   └── verification/
│       ├── button_verification.test.tsx
│       ├── card_verification.test.tsx
│       ├── input_verification.test.tsx
│       └── navigation_verification.test.ts
├── public/                  # Static assets
├── .env.local.example       # Environment variables template
├── next.config.ts           # Next.js configuration
├── postcss.config.mjs       # PostCSS with @tailwindcss/postcss
├── tsconfig.json            # TypeScript config (strict, path aliases)
├── vercel.json              # Vercel deployment configuration
├── eslint.config.mjs        # ESLint configuration
└── package.json
```

---

## Getting Started

### Prerequisites

- **Node.js** 20 or later
- **npm** (or Bun 1.3+ as an alternative runtime)
- A **Firebase project** with Authentication enabled (for auth features)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/sectorone.git
cd sectorone
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.local.example .env.local
```

4. Fill in your Firebase credentials in `.env.local` (see [Environment Variables](#environment-variables) below).

5. Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Environment Variables

Create a `.env.local` file with the following variables. All values are available in your Firebase Console under **Project Settings → General → Your apps → Web app**:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# NVIDIA NIM API Key (for AI-powered data lookups — fantasy drivers, PU components)
# Get yours at https://build.nvidia.com/
NVIDIA_API_KEY=nvapi-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

> **Never commit `.env.local` to version control.** The `.env.local.example` file contains placeholder values for reference.

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Create production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint checks |
| `bun test <path>` | Run tests with Bun native test runner |

---

## Design System

SectorOne uses a dark carbon theme inspired by F1 broadcast graphics, with glassmorphic panels and constructor team color accents.

### Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--surface` | `#141414` | Page background |
| `--surface-container-low` | `#1c1b1b` | Card backgrounds |
| `--surface-container` | `#242424` | Elevated surfaces |
| `--surface-container-highest` | `#383838` | Top-level containers |
| `--on-surface` | `#e5e2e1` | Primary text (warm white) |
| `--on-surface-variant` | `#e9bcb5` | Secondary text |
| `--color-primary` | `#e10600` | F1 Red — CTAs, accents, active states |
| `--color-secondary` | `#00d2be` | Teal — secondary accents |
| `--color-tertiary` | `#fffb00` | Yellow — warnings, highlights |
| `--error` | `#ffb4ab` | Error states |

All tokens are defined in `app/globals.css` via CSS custom properties and exposed to Tailwind through `@theme inline`.

### Typography

| Role | Font | Usage |
|------|------|-------|
| Display / Headings | **Space Grotesk** | Brand text, page titles, section headers |
| Body / UI | **Inter** | Navigation labels, card content, data tables |

Both fonts are loaded via `next/font/google` with `display: "swap"` for optimal performance. CSS variables `--font-space-grotesk` and `--font-inter` are mapped to Tailwind's `font-heading` and `font-sans` utilities.

### F1 Team Colors

Constructor brand colors are available as CSS custom properties for year-aware team branding:

| Team | Variable | Color |
|------|----------|-------|
| Red Bull | `--team-redbull` | `#3671C6` |
| Ferrari | `--team-ferrari` | `#E8002D` |
| Mercedes | `--team-mercedes` | `#27F4D2` |
| McLaren | `--team-mclaren` | `#FF8000` |
| Aston Martin | `--team-aston` | `#00594F` |
| Williams | `--team-williams` | `#005AFF` |
| Haas | `--team-haas` | `#B6BABD` |
| RB | `--team-rb` | `#4E7FCD` |
| Alpine | `--team-alpine` | `#FF87BC` |
| Sauber | `--team-sauber` | `#00E700` |

### Components

#### Card

A reusable glassmorphic card with configurable variants and padding levels.

```tsx
import { Card } from "@/components/ui/Card";

// Default card with medium padding
<Card>Content here</Card>

// Glass variant with hover effect
<Card variant="glass" hoverable>Hover me</Card>

// Clickable card (renders as <button>)
<Card onClick={() => console.log("clicked")}>Navigate</Card>

// Outlined, no padding
<Card variant="outlined" padding="none">Custom layout</Card>

// Elevated with custom className
<Card variant="elevated" padding="lg" className="max-w-md">
  Elevated content
</Card>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `"default" \| "glass" \| "outlined" \| "elevated"` | `"default"` | Visual style |
| `padding` | `"none" \| "sm" \| "md" \| "lg"` | `"md"` | Internal spacing |
| `hoverable` | `boolean` | `false` | Enable hover state transitions |
| `onClick` | `() => void` | — | Makes card clickable (renders as `<button>`) |
| `glow` | `"cyan" \| "red" \| "yellow" \| "green"` | — | Applies neon glow border that intensifies on hover |
| `className` | `string` | — | Additional Tailwind classes |

**Glow variant example:**
```tsx
// Cyan neon glow that intensifies on hover
<Card glow="cyan" variant="glass">
  Neon glow card
</Card>
```

#### Button

A reusable button with 5 visual variants, 3 sizes, and loading state.

```tsx
import { Button } from "@/components/ui/Button";

// Primary (F1 Red)
<Button variant="primary">Browse Sessions</Button>

// Cyan accent with neon glow
<Button variant="cyan">VIEW FULL TELEMETRY</Button>

// Ghost with loading state
<Button variant="ghost" loading>Loading...</Button>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `"primary" \| "secondary" \| "ghost" \| "outline" \| "cyan"` | `"primary"` | Visual style |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Button size |
| `loading` | `boolean` | `false` | Show spinner and disable |
| `icon` | `ReactNode` | — | Icon slot |
| `iconPosition` | `"left" \| "right"` | `"left"` | Icon alignment |
| `fullWidth` | `boolean` | `false` | Stretch to container width |

#### ProtectedRoute

Wraps authenticated pages with a loading spinner and automatic redirect to `/auth/login`.

```tsx
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <h1>Authenticated Content</h1>
    </ProtectedRoute>
  );
}
```

#### useAuth Hook

Access Firebase auth state anywhere in the component tree.

```tsx
import { useAuth } from "@/lib/auth/useAuth";

function UserProfile() {
  const { user, loading, login, logout } = useAuth();

  if (loading) return <p>Loading...</p>;
  if (!user) return <p>Not signed in</p>;

  return (
    <div>
      <p>Welcome, {user.email}</p>
      <button onClick={logout}>Sign out</button>
    </div>
  );
}
```

---

## Architecture

### Replay Engine

The Strategy Lab's race replay system follows a data pipeline architecture:

```
┌─────────────────────┐
│   OpenF1 API        │  Fetches 5 data streams in parallel:
│   (api.openf1.org)  │  drivers, location, car_data, weather, race_control
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Race Data Service  │  Merges by timestamp, creates ReplayFrame
│  lib/raceData.ts    │  objects: DriverPosition[], weather, safety_car,
│                     │  race_control_messages. 200ms sample interval.
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  FrameBuffer       │  Ordered array with binary-search seek,
│  lib/frameBuffer.ts│  sequential next()/prev() access, range queries
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  useReplayEngine   │  React hook: play/pause, variable speed
│  (hook)             │  (0.25x-20x), step, seek to index/timestamp/progress
└──────────┬──────────┘
           │
     ┌─────┴──────────┐
     ▼                ▼
┌──────────┐   ┌──────────────┐
│ TrackMap │   │ Side Panels  │  Leaderboard, TelemetryHUD,
│ (canvas) │   │ (React)      │  GapChart, TyreWidget, WeatherRadar
└──────────┘   └──────────────┘

     ▼
┌─────────────────────┐
│ TimelineControls    │  Bottom bar: play/pause, progress bar with
│ (component)         │  event markers (SC, flags), speed selector
└─────────────────────┘
```

**Frame structure** — each `ReplayFrame` captures a single point in time:
- `timestamp` and `date` for temporal positioning
- `lap` number (estimated from elapsed time)
- `driver_positions[]` — every driver's position, coordinates, speed, RPM, gear, throttle, brake, DRS, and gap/interval
- `weather` — air/track temperature, humidity, rainfall, wind
- `safety_car` — deployed/returning/none status with position
- `race_control_messages[]` — full flag and messaging history up to this frame

### Data Flow

```
┌─────────────────────┐
│   OpenF1 API        │  Real-time F1 timing data
│   (api.openf1.org)  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  OpenF1 Client      │  Rate limited (3 req/s)
│  lib/api/openf1.ts  │  Exponential backoff, retry
│  21 typed endpoints │  Custom OpenF1Error class
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  React Components   │  Server & Client Components
│  (App Router)       │  Data fetching & display
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  UI Components      │  Design system tokens
│  Card, Nav, etc.    │  Glassmorphism, team colors
└─────────────────────┘
```

### Auth Flow

```
┌──────────────────┐
│  Firebase Auth   │  Email/password authentication
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  AuthProvider    │  React context (app/layout.tsx)
│  (context)       │  onAuthStateChanged listener
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  useAuth()       │  Hook for consuming auth state
│  (hook)          │  Returns user, loading, login, signup, logout, resetPassword
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  ProtectedRoute  │  Guard wrapper for authenticated pages
│  (component)     │  Redirects to /auth/login if unauthenticated
└──────────────────┘
```

### OpenF1 API Client

The API client (`lib/api/openf1.ts`) provides typed access to all OpenF1 endpoints:

| Endpoint | Function | Return Type |
|----------|----------|-------------|
| `/meetings` | `getMeetings()` | `Meeting[]` |
| `/sessions` | `getSessions()` | `Session[]` |
| `/drivers` | `getDrivers()` | `Driver[]` |
| `/car_data` | `getCarData()` | `CarData[]` |
| `/location` | `getLocation()` | `LocationData[]` |
| `/laps` | `getLaps()` | `LapData[]` |
| `/position` | `getPosition()` | `PositionData[]` |
| `/intervals` | `getIntervals()` | `IntervalData[]` |
| `/weather` | `getWeather()` | `WeatherData[]` |
| `/pit` | `getPit()` | `PitData[]` |
| `/stints` | `getStints()` | `StintData[]` |
| `/race_control` | `getRaceControl()` | `RaceControlData[]` |
| `/session_result` | `getSessionResult()` | `SessionResult[]` |
| `/starting_grid` | `getStartingGrid()` | `StartingGridEntry[]` |
| `/championship_drivers` | `getChampionshipDrivers()` | `ChampionshipDriver[]` |
| `/championship_teams` | `getChampionshipTeams()` | `ChampionshipTeam[]` |

**Helper functions:**

| Function | Description |
|----------|-------------|
| `getSessionsByYear(year)` | All sessions for a given year |
| `getMeetingsByYear(year)` | All meetings for a given year |
| `getAvailableYears()` | Sorted array of years with data |
| `getSessionFlags(sessionKey)` | Race control messages for a session |

**Rate limiting & resilience:**

- Sliding window rate limiter (3 requests/second, matching OpenF1 free tier)
- Exponential backoff with jitter (1s initial, 30s max)
- Up to 3 retries per request
- Custom `OpenF1Error` class with status code and endpoint info

```tsx
import { getSessions, getDrivers, getCarData } from "@/lib/api/openf1";

// Fetch all 2024 sessions
const sessions = await getSessions({ year: 2024 });

// Get drivers for a specific session
const drivers = await getDrivers({ session_key: 5628 });

// Fetch telemetry for a single driver
const telemetry = await getCarData({
  session_key: 5628,
  driver_number: 1,
});
```

---

## Testing

Tests use Bun's native test runner. Run all tests or target specific files:

```bash
# Run all tests
bun test

# Run specific test file
bun test tests/verify-task2-2.test.ts

# Run verification suite
bun test tests/verification/
```

**Current test coverage (222+ tests across 33 files):**

| Test File | Coverage |
|-----------|----------|
| `tests/archive-filters.test.tsx` | ArchiveFilters component rendering and filter behavior |
| `tests/archive.test.tsx` | Archive page session browsing and GP card grid |
| `tests/components/ConstructorCard.test.tsx` | Constructor card states (loading, empty, data) |
| `tests/components/FormChart.test.tsx` | Form chart color mapping, DNF handling, result display |
| `tests/components/GapChart.test.tsx` | Gap chart states (no data, no selection, live, LAP strings) |
| `tests/components/LapTimeDisplay.test.tsx` | Lap/time display states (null, NaN, elapsed calculation) |
| `tests/components/LapTimeDisplay.adversarial.test.tsx` | XSS injection, overflow, NaN, boundary values |
| `tests/components/Leaderboard.test.tsx` | Leaderboard component exports and DriverPosition integration |
| `tests/components/PitStopIndicator.test.tsx` | Pit stop feed states (empty, events, durations) |
| `tests/components/PitWindowWidget.test.tsx` | Pit strategy states (fresh tyres, critical degradation) |
| `tests/components/PointsChart.test.tsx` | Points chart empty state and multi-driver rendering |
| `tests/components/PuUsageTable.test.tsx` | PU table loading, empty, and data states |
| `tests/components/RaceControlFeed.test.tsx` | Race control feed states and maxMessages limit |
| `tests/components/SafetyCar.test.tsx` | Safety car deployed/returning/none states |
| `tests/components/StandingsTable.test.tsx` | Standings table loading, empty, driver/constructor views |
| `tests/components/TelemetryHUD.test.tsx` | TelemetryHUD states (null, loading, full data) and helper functions |
| `tests/components/TimelineControls.test.tsx` | TimelineControls component exports and ReplayEngineState integration |
| `tests/components/TrackMap.test.tsx` | TrackMap exports, coordinate normalization, props |
| `tests/components/TyreWidget.test.tsx` | Tyre widget compound badges, stint data, NaN lap handling |
| `tests/components/WeatherRadar.test.tsx` | Weather radar states, null fields, rainfall rendering |
| `tests/lib/fantasy-firestore.test.ts` | Firestore fantasy team and league CRUD operations (14 tests) |
| `tests/lib/frameBuffer.test.ts` | Frame buffer operations (load, seek, binary search, range) |
| `tests/lib/raceData.test.ts` | Race data service fetch, frame building, safety car detection |
| `tests/lib/teams.test.ts` | Team identity service mapping and year-aware lookups |
| `tests/session-page.test.tsx` | Session detail page rendering with driver results table |
| `tests/adversarial/track-map.adversarial.test.ts` | Track map adversarial edge cases |
| `tests/verification/` | Button, Card, Input, Navigation, TopNav, layout, hex pattern, neon glow, FilterSidebar, CircuitOutline, DataCard, archive layout, GpCard redesign verification |

---

## Deployment

SectorOne is configured for deployment on [Vercel](https://vercel.com/).

### Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Environment Variables

Set the following environment variables in your Vercel project settings (or via `vercel env add`):

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | ✅ | Firebase Web API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | ✅ | Firebase auth domain (e.g., `project.firebaseapp.com`) |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | ✅ | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | ✅ | Firebase storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | ✅ | Firebase sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | ✅ | Firebase app ID |
| `NVIDIA_API_KEY` | ⬜ | For AI-powered data lookups (fantasy/PU) via NVIDIA NIM |
| `OPENROUTER_API_KEY` | ⬜ | Fallback AI provider if NVIDIA key is absent |

> **Note:** The AI API keys are optional — if neither is configured, the fantasy and PU pages will show loading states gracefully. Functional features (archive, standings, replay) work without them.

The `vercel.json` configuration specifies the Next.js framework, build command, and output directory.

---

## Roadmap

| Phase | Name | Status | Key Deliverables |
|-------|------|--------|-----------------|
| **1** | Project Setup & Foundation | ✅ Complete | Next.js scaffold, TypeScript types, OpenF1 client, Firebase Auth, Vercel config |
| **2** | SectorOne Branding & Design System | ✅ Complete | Dark theme, glassmorphism, SideNav, MobileNav, Card/Button/Chip/Input components, landing page |
| **3** | Race Archive | ✅ Complete | Session browser, GP cards, circuit outlines, archive filters, session detail page with results |
| **4** | Strategy Lab — Replay Engine | ✅ Complete | Track map, race data service, frame buffer, replay engine, timeline controls, leaderboard, telemetry HUD, lap/time display, gap chart, tyre widget, weather radar, safety car, race control feed, pit stop indicator, pit window predictor |
| **5** | Championship Standings | ✅ Complete | Driver/constructor tables, form charts, points progression, constructor card, team identity service, PU component tracker |
| **5.5** | Neon Telemetry HUD Redesign | ✅ Complete | TopNav, hex pattern, neon glow tokens, Card glow, Button cyan, FilterSidebar, SeasonSelector, CircuitOutline, DataCard, SpeedGauge, TireIndicator, page redesigns |
| **6** | Fantasy F1 League | ✅ Complete | Team dashboard, roster editor, league system, Firestore persistence |
| **6a** | OSM Satellite Track Map | ✅ Complete | MapLibre GL satellite map, circuit projection, strategy-lab replay page |
| **6b** | AI Data Integration | ✅ Complete | NVIDIA NIM / OpenRouter client, fantasy driver API, PU component API |
| **7** | Pre-Deployment Polish | ✅ Complete | Error boundaries, loading skeletons, SEO metadata, settings page, auth polish |

---

## Contributing

Contributions are welcome! Here's how to get started:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- **TypeScript strict mode** is enforced — all code must be fully typed
- **ESLint** runs as part of the development workflow — fix lint errors before committing
- **Component naming** follows PascalCase for React components
- **File naming** follows kebab-case for non-component files
- **Path aliases** — use `@/` for imports (configured in `tsconfig.json`)

---

## License

[MIT](LICENSE) — feel free to use, modify, and distribute.

---

*SectorOne is not affiliated with Formula 1, Formula One Licensing B.V., or any F1 team. All F1 data is sourced from the community-driven [OpenF1 API](https://openf1.org/).*
