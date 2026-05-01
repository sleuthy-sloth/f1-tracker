# Specification: F1 Tracker

A web-based Formula 1 tracking and race replay application that provides real-time race visualization, telemetry analysis, and historical session review — accessible on both mobile and desktop devices.

## Feature Description

Users want to relive and analyze F1 races through an interactive replay experience similar to dedicated desktop applications, but accessible from any device with a web browser. The app provides frame-by-frame race replay with driver positions on a track map, live timing data, telemetry insights, and session information — all without installing software.

Data is sourced from the free OpenF1 API, covering sessions from 2023 onwards for historical replay. Live race tracking is a future stretch goal.

## User Scenarios

### Scenario 1: Race Replay
**Given** a user has selected a completed race session
**When** they start the replay
**Then** they see an animated track visualization showing all drivers' positions updating frame-by-frame

**Given** the race replay is running
**When** the user pauses playback
**Then** the visualization freezes and all driver positions remain at their current state

**Given** the race replay is paused or playing
**When** the user rewinds or fast-forwards
**Then** the visualization jumps to the corresponding point in the race

**Given** a driver is visible on the track
**When** the user selects them
**Then** their telemetry data (speed, gear, throttle, brake, DRS status) is displayed

### Scenario 2: Live Race Tracking
**Given** a race session is currently underway
**When** the user opens the live tracking view
**Then** they see driver positions updating in near-real-time with a small delay

**Given** the live tracking is active
**When** the user taps or clicks a driver on the leaderboard
**Then** the track view centers on that driver and shows their current telemetry

### Scenario 3: Session Browsing
**Given** a user wants to explore F1 sessions
**When** they browse the available years, rounds, and session types
**Then** they can select any race, sprint, or qualifying session to replay

**Given** a user has previously viewed a session
**When** they return to the app
**Then** recently viewed sessions are available for quick access

### Scenario 4: Telemetry Analysis
**Given** a race replay is in progress
**When** the user opens the insights panel
**Then** they can view detailed telemetry charts for any driver

**Given** a driver is selected for telemetry analysis
**When** the replay plays through a lap
**Then** the telemetry visualization updates in sync with the race playback

### Scenario 5: User Account
**Given** a user wants to save their browsing preferences
**When** they sign in with their Firebase account
**Then** their favorite sessions and watch history are preserved across devices

## Functional Requirements

### FR-001: Session Browser
The system MUST present a browsable list of F1 race weekends (years, rounds, session types) available for replay.

### FR-002: Race Replay Engine
The system MUST provide a frame-by-frame replay of race sessions with driver positions animated on a track map.

### FR-003: Playback Controls
The system MUST support pause, resume, rewind, fast-forward, playback speed adjustment, and restart controls during replay.

### FR-004: Leaderboard
The system MUST display a live leaderboard showing current driver positions and lap counts during replay.

### FR-005: Driver Telemetry Overlay
The system MUST display telemetry data (speed, gear, throttle, brake, DRS) for a selected driver during replay.

### FR-006: Lap & Time Display
The system MUST show the current lap number and elapsed race time during replay.

### FR-007: Driver Status Tracking
The system MUST indicate drivers who have retired or are otherwise no longer competing (e.g., "OUT" status).

### FR-008: Safety Car Visualization
The system MUST display the Safety Car on track when deployed, with appropriate visual indicators.

### FR-009: Weather Information
The system MUST show current weather conditions (track temperature, air temperature, humidity, wind) during race sessions.

### FR-010: Live Session Tracking (Stretch Goal)
The system MAY support near-real-time tracking of live race sessions in a future release. Initial release focuses on historical replay only.

### FR-011: Race Control Messages
The system MUST display race control messages, flags, and session status changes during replay.

### FR-012: Session Type Support
The system MUST support replay of Race, Sprint, Sprint Qualifying, and Qualifying session types.

### FR-013: Driver Selection & Focus
The system MUST allow users to select individual drivers on the track or leaderboard to view their detailed information.

### FR-014: Mobile Responsiveness
The system MUST provide a fully functional experience on both mobile devices and desktop screens through responsive layout adaptation.

### FR-015: Telemetry Insights Panel
The system SHOULD provide detailed telemetry charts and analysis tools accessible alongside the race replay.

### FR-016: Pit Stop Information
The system MUST display pit stop events including timing, duration, and tyre compound changes.

### FR-017: Track Map Visualization
The system MUST render an accurate track layout map with driver positions plotted in real-time during replay.

### FR-018: Session Information Display
The system MUST show session metadata including event name, circuit name, country, date, and total lap count.

### FR-019: Color-Coded Drivers
The system MUST display each driver using their official F1 team colors for easy identification.

### FR-020: Data Freshness Indicator
The system SHOULD indicate the freshness or delay of data when viewing live sessions.

### FR-021: User Authentication
The system MUST support user authentication via Firebase, allowing users to create accounts and sign in to save preferences, favorite sessions, and watch history.

## Non-Functional Requirements

### NFR-001: Performance
The track visualization MUST render smoothly at 60 frames per second on modern devices during replay playback.

### NFR-002: Responsiveness
The application MUST adapt its layout across mobile phones, tablets, and desktop screens without loss of functionality.

### NFR-003: Data Latency
Live session data display SHOULD be no more than 5 seconds behind the real-world timing.

### NFR-004: Offline Graceful Degradation
The application SHOULD handle data source unavailability gracefully, displaying clear error states rather than breaking.

### NFR-005: First Load Performance
The initial page load SHOULD deliver meaningful content within 3 seconds on a standard broadband connection.

## Success Criteria

### SC-001: Session Selection
A user can browse at least three completed race weekends and begin replaying any available session type within 3 clicks/taps.

### SC-002: Smooth Playback
Race replay maintains smooth animation (no visible stuttering) across the duration of a full race session on modern devices.

### SC-003: Full Playback Control
Users can pause, rewind, fast-forward, and adjust speed without losing synchronization between track positions and telemetry data.

### SC-004: Driver Identification
Any driver visible on the track map is identifiable by their team color and driver identifier (number or abbreviation).

### SC-005: Mobile Parity
All core features (session browsing, replay, leaderboard, driver selection, telemetry) are accessible on mobile devices without requiring landscape orientation or external accessories.

### SC-006: Data Accuracy
Telemetry data displayed during replay matches the source data from the public timing feeds within acceptable tolerance.

## Key Entities

- Session (race weekend event with specific session type)
- Driver (participant with number, abbreviation, team, colors)
- Lap (single circuit traversal with timing data)
- Telemetry Snapshot (speed, gear, throttle, brake, DRS, position at a moment in time)
- Track Layout (circuit path coordinates for rendering)
- Race Event (safety car, flags, pit stops, incidents)
- Weather Reading (temperatures, humidity, wind, rainfall)

## Edge Cases and Known Failure Modes

- **Data availability gaps**: Some historical sessions may have incomplete telemetry or position data
- **Live data interruptions**: Network issues or feed outages during live tracking should show a clear reconnection indicator
- **Unscheduled sessions**: Session schedule changes (e.g., weather delays, red flags) must be handled gracefully
- **Driver substitutions**: Mid-season driver changes must be reflected correctly
- **New circuits**: Track layouts for new or modified circuits must be renderable from coordinate data
- **Large data volumes**: Full race sessions contain thousands of frames — lazy loading and efficient rendering are required
- **Concurrent users**: Multiple live viewers share the same data source — no state conflicts should occur
- **Time zone handling**: Session times must be displayed in the user's local timezone

## Design Decisions

- **Data scope**: Free OpenF1 API only, covering 2023 onwards. Live tracking and pre-2023 data are deferred to future releases.
- **Authentication**: Firebase Auth for user accounts. Anonymous browsing is supported for non-personalized features.
- **Live tracking**: Not included in initial release — identified as a stretch goal for future iteration.
