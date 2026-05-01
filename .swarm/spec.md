# Specification: SectorOne

A high-performance Formula 1 telemetry suite combining race replay visualization, fantasy F1 league management, championship standings, and real-time telemetry analysis — presented as a mission-control dashboard accessible on both mobile and desktop devices.

## Brand Overview

**SectorOne** is the cockpit for the modern F1 enthusiast — blending the analytical depth of a professional pit wall with the competitive thrill of fantasy sports. The brand personality is authoritative, technical, and precision-engineered. Every interface element is designed as part of a mission-critical telemetry suite, using a dark glassmorphism aesthetic inspired by Head-Up Displays (HUD) in modern racing cockpits.

## Feature Description

Users can relive and analyze F1 races through an interactive replay experience, manage fantasy F1 teams with real budgets and points, view championship standings, and explore telemetry data — all within a unified dashboard. Data is sourced from the free OpenF1 API (2023 onwards) for historical race data, with fantasy league scoring derived from actual race results.

The app is organized into four primary sections:
- **Archive**: Browse and replay past races with full telemetry visualization
- **Strategy Lab**: Race replays with live telemetry, gap analysis, tyre degradation, and weather radar
- **Fantasy**: Build and manage fantasy F1 teams with budget caps, leagues, and standings
- **Settings**: Account management and app configuration

## User Scenarios

### Scenario 1: Race Replay (Strategy Lab)
**Given** a user has selected a completed race session from the Archive
**When** they start the replay in Strategy Lab
**Then** they see an animated track visualization showing all drivers' positions updating frame-by-frame with a floating telemetry HUD

**Given** the race replay is running
**When** the user pauses playback
**Then** the visualization freezes and all driver data remains at their current state

**Given** the race replay is paused or playing
**When** the user rewinds or fast-forwards
**Then** the visualization jumps to the corresponding point in the race

**Given** a driver is visible on the track
**When** the user selects them on the leaderboard
**Then** their telemetry data (speed, gear, RPM, DRS, throttle, brake) is displayed in the floating panel

### Scenario 2: Session Browsing
**Given** a user wants to explore F1 sessions
**When** they browse the Archive
**Then** they see a grid of GP cards with circuit outlines, session info, podium results, and a "Watch Replay" button

**Given** a user has previously viewed a session
**When** they return to the app
**Then** recently viewed sessions are available for quick access

### Scenario 3: Fantasy Team Management
**Given** a user is authenticated and on the Fantasy page
**When** they view their dashboard
**Then** they see their team name, total points, budget remaining, roster of drivers, and league standings

**Given** a user wants to change their roster
**When** they click "Edit Team"
**Then** they can browse available drivers with their cost and recent points, and swap drivers within their $100M budget

**Given** a race weekend completes
**When** the fantasy standings update
**Then** user's team points reflect the real race results, and league leaderboards refresh

### Scenario 4: Fantasy Leagues
**Given** a user has joined a fantasy league
**When** they view their league
**Then** they see a leaderboard of all members with rank trends and total points

**Given** a user wants to compete with friends
**When** they create or join a league
**Then** they can invite friends and track performance across race weekends

### Scenario 5: Championship Standings
**Given** a user wants to see season standings
**When** they view the Championship page
**Then** they see driver and constructor rankings with points, wins, podiums, and recent form charts

**Given** a user selects a constructor
**When** the constructor detail is shown
**Then** they see the team's total points with per-driver point splits

### Scenario 6: Telemetry Analysis
**Given** a race replay is in progress
**When** the user views the sidebar panels
**Then** they can see gap-to-leader charts, tyre degradation heatmaps, and weather radar information

**Given** a driver is selected for telemetry analysis
**When** the replay plays through a lap
**Then** the telemetry visualization updates in sync with the race playback

### Scenario 7: User Account
**Given** a user wants to save their preferences
**When** they sign in with their Firebase account
**Then** their fantasy team, league memberships, session history, and favorite sessions are preserved across devices

## Functional Requirements

### FR-001: App Navigation
The system MUST provide a persistent sidebar navigation (desktop) and bottom navigation (mobile) with sections: Archive, Strategy Lab, Fantasy, and Settings.

### FR-002: Session Browser (Archive)
The system MUST present a browsable grid of F1 race weekends showing circuit outline SVGs, round number, event name, podium results, and session type badges — available for replay.

### FR-003: Race Replay Engine (Strategy Lab)
The system MUST provide a frame-by-frame replay of race sessions with driver positions animated on a track map, with an anchored timeline control bar at the bottom.

### FR-004: Playback Controls
The system MUST support pause, resume, rewind, fast-forward, playback speed adjustment (0.5x, 1x, 2x, 4x), and restart controls during replay.

### FR-005: Leaderboard
The system MUST display a scrollable leaderboard showing driver positions, gaps to leader, tyre compound (with life bar), stint/pit count, and team affiliation with team color indicators.

### FR-006: Driver Telemetry HUD
The system MUST display a floating telemetry panel for a selected driver showing speed, gear, RPM (with bar), DRS status, throttle percentage, and brake status.

### FR-007: Lap & Time Display
The system MUST show the current lap number, total laps, and elapsed race time during replay.

### FR-008: Driver Status Tracking
The system MUST indicate drivers who have retired or are otherwise no longer competing.

### FR-009: Safety Car Visualization
The system MUST display the Safety Car on track when deployed, with appropriate visual indicators and timeline markers.

### FR-010: Weather Information
The system MUST show current weather conditions (track temperature, air temperature, humidity, rainfall, wind) during race sessions, with a weather radar visualization.

### FR-011: Race Control Messages
The system MUST display race control messages, flags, and session status changes during replay.

### FR-012: Session Type Support
The system MUST support replay of Race, Sprint, Sprint Qualifying, and Qualifying session types.

### FR-013: Driver Selection & Focus
The system MUST allow users to select individual drivers on the track or leaderboard to view their detailed telemetry and information.

### FR-014: Mobile Responsiveness
The system MUST provide a fully functional experience on both mobile devices and desktop screens through responsive layout adaptation and adaptive navigation.

### FR-015: Gap Analysis Chart
The system SHOULD display gap-to-leader line charts for selected drivers during replay, with colored traces for each driver.

### FR-016: Tyre Degradation Display
The system SHOULD display tyre degradation heatmaps showing remaining tyre life percentage for each driver during replay.

### FR-017: Weather Radar
The system SHOULD provide a weather radar visualization showing precipitation zones during race sessions.

### FR-018: Strategic Pit Window
The system SHOULD show estimated optimal pit window, pit loss time, and undercut delta during race replay.

### FR-019: Pit Stop Information
The system MUST display pit stop events including timing, duration, and tyre compound changes.

### FR-020: Track Map Visualization
The system MUST render the track layout with active sector highlighting and driver position markers, using a minimalist circuit outline aesthetic.

### FR-021: Session Information Display
The system MUST show session metadata including event name, circuit name, country, date, and total lap count.

### FR-022: Color-Coded Drivers
The system MUST display each driver using their official F1 team colors for easy identification.

### FR-023: Championship Standings
The system MUST display driver and constructor championship standings with points, wins, podiums, and recent form (last 5 races) charts.

### FR-024: Points Progression Chart
The system SHOULD show season-long points progression charts for selected drivers, with a "heartbeat" line chart style.

### FR-025: Fantasy Team Dashboard
The system MUST display a fantasy team dashboard showing team name, total points, budget remaining (with progress bar), active roster, and points history chart.

### FR-026: Fantasy Roster Management
The system MUST allow users to build and edit a fantasy team roster consisting of 5 drivers and 1 constructor within a $100M budget, with pricing based on real-world performance.

### FR-027: Fantasy League Standings
The system MUST support creating and joining fantasy leagues, with leaderboards showing rank, team name, points, and rank trend indicators.

### FR-028: Fantasy Points Scoring
The system MUST calculate fantasy points based on real race results (position points, overtakes, fastest laps, qualifying performance).

### FR-029: User Authentication
The system MUST support user authentication via Firebase, allowing users to create accounts and sign in to save fantasy teams, league memberships, preferences, and watch history.

### FR-030: Global Search
The system MAY provide a global search bar in the header for searching sessions, drivers, and circuits.

## Non-Functional Requirements

### NFR-001: Performance
The track visualization MUST render smoothly at 60 frames per second on modern devices during replay playback.

### NFR-002: Responsiveness
The application MUST adapt its layout across mobile phones, tablets, and desktop screens without loss of functionality.

### NFR-003: Glassmorphism Design
The UI MUST use glassmorphic cards (semi-transparent backgrounds with backdrop blur, 1px ghost borders) for telemetry readouts and dashboard panels.

### NFR-004: Typography
The system MUST use Space Grotesk for headings and telemetry data, Inter for body text, and monospace for tabular data to prevent horizontal jittering.

### NFR-005: Data Latency
Historical replay data SHOULD load within 5 seconds for a full race session on a standard broadband connection.

### NFR-006: Offline Graceful Degradation
The application SHOULD handle data source unavailability gracefully, displaying clear error states rather than breaking.

### NFR-007: First Load Performance
The initial page load SHOULD deliver meaningful content within 3 seconds on a standard broadband connection.

## Success Criteria

### SC-001: Session Selection
A user can browse all available race weekends in the Archive and begin replaying any session within 2 clicks/taps.

### SC-002: Smooth Playback
Race replay maintains smooth animation (no visible stuttering) across the duration of a full race session on modern devices.

### SC-003: Full Playback Control
Users can pause, rewind, fast-forward, and adjust speed without losing synchronization between track positions and telemetry data.

### SC-004: Driver Identification
Any driver on the track map or leaderboard is identifiable by team color, number, and name acronym.

### SC-005: Mobile Parity
All core features (Archive browsing, replay, leaderboard, fantasy dashboard, standings) are accessible on mobile devices.

### SC-006: Fantasy Budget System
A user can build a complete roster within the $100M budget cap, with clear cost visibility per driver.

### SC-007: Daily Refresh
Championship standings and fantasy point calculations refresh automatically after each race weekend.

### SC-008: Brand Consistency
All UI components follow the SectorOne design system: F1 Red primary (#E10600), glassmorphism cards, Space Grotesk/Inter typography, and dark theme throughout.

## Key Entities

- **Meeting**: A Grand Prix weekend (e.g., "Singapore Grand Prix") with dates, circuit, location
- **Session**: A specific session within a meeting (Practice, Qualifying, Sprint, Race)
- **Driver**: Participant with number, name acronym, full name, team, team color
- **Lap**: Single circuit traversal with sector times, speeds, segments
- **Telemetry Snapshot**: Speed, RPM, gear, throttle, brake, DRS, position at a point in time
- **Track Layout**: Circuit coordinate path for rendering with active sector highlighting
- **Race Event**: Safety car, flags, pit stops, incidents, VSC periods
- **Weather Reading**: Track/air temperature, humidity, rainfall, wind
- **Race Result**: Final standings with position, points, gap, DNF/DNS/DSQ status
- **Fantasy Team**: User's selected roster of 5 drivers + 1 constructor within budget
- **Fantasy League**: Group of users competing with cumulative fantasy points
- **Championship Season**: Year-long driver and constructor standings

## Edge Cases and Known Failure Modes

- **Data availability gaps**: Some historical sessions may have incomplete telemetry or position data
- **Driver substitutions**: Mid-season driver changes must be reflected in both telemetry and fantasy rosters
- **New circuits**: Track layouts for new or modified circuits must be renderable from coordinate data
- **Large data volumes**: Full race sessions contain thousands of frames — lazy loading and efficient rendering required
- **Budget edge cases**: Driver prices must fluctuate based on performance, and users must be able to reorganize rosters between race weekends
- **Tiebreaker scenarios**: Fantasy league standings must define tiebreaker rules (most recent race points, then most wins)
- **Session schedule changes**: Weather delays, red flags, and schedule changes must be handled gracefully
- **Time zone handling**: Session times displayed in user's local timezone

## Design System (SectorOne)

### Colors
- **Background**: #131313 (deep charcoal carbon)
- **Surface**: #1A1A1A with glass overlays (backdrop-blur: 20px, fill: rgba(255,255,255,0.05))
- **Primary/F1 Red**: #E10600 (buttons, active states, SC markers)
- **Secondary/Teal**: #00D2BE (positive deltas, data highlights)
- **Tertiary/Yellow**: #FFFB00 (soft compound indication, pit open status)
- **Data Readouts**: Pure white (#FFFFFF) on dark backgrounds
- **Ghost Borders**: rgba(255,255,255,0.1) for card boundaries

### Typography
- **Headlines & Telemetry**: Space Grotesk (48px/24px/18px variants)
- **Body Text**: Inter (14px)
- **Tabular Data**: Monospace (13px, letter-spacing 0.05em)
- **Labels**: Inter, 11px, uppercase, letter-spacing 0.1em

### Components
- **Glassmorphic Cards**: background: rgba(26,26,26,0.8), backdrop-filter: blur(20px), border: 1px solid rgba(255,255,255,0.1)
- **Primary Buttons**: Solid F1 Red (#E10600), white text
- **Secondary Buttons**: Ghost style, 1px white border, 10% fill
- **Telemetry Graphs**: 2px stroke width, "heartbeat" line motif
- **Track Maps**: Minimalist circuit outlines (2px), active sector in F1 Red
- **Timeline**: Bottom-anchored bar, F1 Red playhead, colored event markers
- **Chips**: Pill-shaped for tyre compounds (Red=Soft, Yellow=Medium, White=Hard)
- **Input Fields**: #121212 background, 1px border, F1 Red on focus

## Design Decisions

- **Data scope**: Free OpenF1 API only, covering 2023 onwards. Live tracking is deferred.
- **Authentication**: Firebase Auth for user accounts. Anonymous browsing supported.
- **Fantasy scoring**: Based on real race results from OpenF1 API data.
- **Navigation**: Sidebar on desktop, bottom tab bar on mobile.
- **Design language**: Glassmorphism + High-Performance Minimalism, dark mode only.
- **Font strategy**: Space Grotesk for display/telemetry, Inter for body, monospace for data tables.
