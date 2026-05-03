# SectorOne

> High-performance Formula 1 telemetry suite — real-time race replay, championship standings, fantasy leagues, and historical race archives.

[![Next.js](https://img.shields.io/badge/Next.js-16.2.4-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61dafb?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06b6d4?logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

**Status:** Active development (v0.3.0) — Phase 5 of 7 complete

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

The project is organized into seven development phases, progressing from foundational infrastructure through to a fully-featured telemetry suite with mobile-responsive layouts.

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

### Planned (Phases 6–7)

- **Fantasy F1 League** — team dashboard, roster editor with $100M budget, league system with leaderboards, Firestore persistence
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
| **Database** | Firestore (planned) |
| **Data Source** | [OpenF1 API](https://openf1.org/) |
| **Fonts** | Space Grotesk (display), Inter (body) |
| **Linting** | ESLint 9 + `eslint-config-next` |
| **Testing** | Bun native test runner |
| **Deployment** | Vercel |

---

## Project Structure

```
├── app/
│   ├── archive/
│   │   ├── page.tsx         # Archive grid: GP cards with circuit, podium, session info
│   │   └── [sessionKey]/
│   │       └── page.tsx     # Session detail: results table, Launch Replay entry
│   ├── globals.css          # Theme tokens, glassmorphism, telemetry glow, scrollbar styling
│   ├── icon.svg             # SVG favicon (S1 branding)
│   ├── layout.tsx           # Root layout: SideNav + MobileNav + AuthProvider
│   └── page.tsx             # Landing page with SectorOne branding
├── app/
│   ├── archive/...
│   ├── standings/
│   │   ├── page.tsx                    # Championship standings with year selector
│   │   └── components/
│   │       └── page.tsx                # Power Unit component usage page
├── components/
│   ├── ArchiveFilters.tsx   # Circuit type, weather, and search filters
│   ├── ConstructorCard.tsx  # Leading constructor with driver point split bars
│   ├── FormChart.tsx        # Last 5 race results as color-coded blocks
│   ├── GapChart.tsx         # Live gap-to-leader horizontal bar chart
│   ├── GpCard.tsx           # Grand Prix card with circuit outline and podium
│   ├── LapTimeDisplay.tsx   # Lap counter, elapsed time, progress bar
│   ├── Leaderboard.tsx      # Scrollable leaderboard: positions, gaps, tyres, stints, OUT
│   ├── MobileNav.tsx        # Mobile bottom navigation bar (5 items)
│   ├── PitStopIndicator.tsx # Pit stop event feed with tyre compounds
│   ├── PitWindowWidget.tsx  # Strategic pit window predictor
│   ├── PointsChart.tsx      # SVG multi-driver points progression chart
│   ├── ProtectedRoute.tsx   # Auth guard wrapper with loading spinner
│   ├── PuUsageTable.tsx     # PU component usage tracker with penalty indicators
│   ├── RaceControlFeed.tsx  # Scrollable race control messages feed
│   ├── SafetyCar.tsx        # Safety car status visualization
│   ├── SideNav.tsx          # Desktop fixed sidebar navigation
│   ├── StandingsTable.tsx   # Driver and constructor standings table
│   ├── TelemetryHUD.tsx     # Floating driver telemetry: speed, gear, RPM, DRS, throttle, brake
│   ├── TimelineControls.tsx # Bottom replay bar: play/pause, speed, progress, event markers
│   ├── TrackMap.tsx         # Canvas circuit map with driver dots and sector highlights
│   ├── TyreWidget.tsx       # Tyre degradation with compound badges and life bars
│   ├── WeatherRadar.tsx     # Weather conditions grid with SVG precipitation radar
│   └── ui/
│       ├── Button.tsx       # 4 variants (primary, secondary, ghost, outline), 3 sizes, loading
│       ├── Card.tsx         # Glassmorphic card (4 variants, 4 padding levels)
│       ├── Chip.tsx         # Tyre compound and status indicators
│       └── Input.tsx        # Dark-styled input with F1 Red focus
├── hooks/
│   └── useReplayEngine.ts  # Replay playback: play/pause, variable speed, seek, accumulation
├── lib/
│   ├── api/
│   │   └── openf1.ts        # OpenF1 API client (23 endpoints, rate limited, exponential backoff)
│   ├── auth/
│   │   ├── AuthContext.tsx  # Firebase Auth context provider
│   │   └── useAuth.ts       # useAuth() hook
│   ├── firebase.ts          # Firebase config and lazy initialization
│   ├── frameBuffer.ts       # Replay frame buffer: binary search, seeking, range extraction
│   ├── raceData.ts          # Race data service: fetch, merge, build ReplayFrame objects
│   ├── teams.ts             # Year-aware team identity service (2024-2026)
│   ├── track-map.ts         # Track coordinate normalization, circuit bounds, grid alignment
│   └── types.ts             # 28+ TypeScript types for F1 data entities + replay types
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

# OpenF1 API Base URL (optional — defaults to https://api.openf1.org/v1)
NEXT_PUBLIC_OPENF1_API_URL=https://api.openf1.org/v1
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
| `className` | `string` | — | Additional Tailwind classes |

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
| `tests/lib/frameBuffer.test.ts` | Frame buffer operations (load, seek, binary search, range) |
| `tests/lib/raceData.test.ts` | Race data service fetch, frame building, safety car detection |
| `tests/lib/teams.test.ts` | Team identity service mapping and year-aware lookups |
| `tests/session-page.test.tsx` | Session detail page rendering with driver results table |
| `tests/adversarial/track-map.adversarial.test.ts` | Track map adversarial edge cases |
| `tests/verification/` | Button, Card, Input, and Navigation component verification |

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

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

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
| **6** | Fantasy F1 League | 🔜 Planned | Team dashboard, roster editor, league system, Firestore |
| **7** | Mobile & Final Polish | 🔜 Planned | Responsive layouts, skeletons, error boundaries, performance |

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
