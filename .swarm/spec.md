# Specification: SectorOne Visual Redesign — "Neon Telemetry HUD"

A comprehensive visual redesign of SectorOne's layout, navigation, and component styling to match a "Neon Telemetry HUD" aesthetic — featuring top navigation, enhanced neon glow effects, modular dashboard cards, circuit outline visualizations with team-colored glows, and a subtle hexagonal background pattern across all pages.

## Feature Description

The redesign transforms SectorOne from a sidebar-navigation layout to a top-navigation dashboard layout with enhanced visual depth. Every page receives updated styling with neon glow borders, glassmorphic cards with colored accents, and a cohesive "mission control" aesthetic. The redesign preserves all existing functionality while elevating the visual presentation to match professional F1 telemetry dashboards.

The redesign covers:
- **Global Shell**: Top navigation bar replacing sidebar, hexagonal background pattern, updated design tokens
- **Component Library**: Enhanced cards with glow variants, cyan accent buttons, new filter sidebar and circuit outline components
- **Archive Page**: Left filter panel, neon circuit outline cards, season selector pill bar
- **Fantasy Page**: Dashboard grid with driver cards, standings table, budget tracker, countdown timer
- **Standings Page**: Dashboard cards, enhanced tables with position color bars
- **Strategy Lab**: Modular dashboard layout with speed gauge, track position, tire status, live standings

## User Scenarios

### Scenario 1: Top Navigation
**Given** a user is on any page of SectorOne
**When** they look at the top of the viewport
**Then** they see a horizontal navigation bar with the SectorOne logo on the left, navigation tabs (LIVE, ANALYSIS, HISTORY, SETTINGS) in the center, and user profile on the right

**Given** a user clicks a navigation tab
**When** the page changes
**Then** the active tab shows an underline/glow indicator and the content area updates

### Scenario 2: Archive Browsing with Filters
**Given** a user navigates to the Archive page
**When** they view the page
**Then** they see a left sidebar with collapsible filter sections (Year, Circuit, Team, Weather, Driver Wins) and a grid of GP cards with neon-glowing circuit outlines

**Given** a user selects filter options
**When** the filters are applied
**Then** the GP card grid updates to show only matching sessions

**Given** a user hovers over a GP card
**When** the hover state activates
**Then** the circuit outline glow intensifies and the card border brightens

### Scenario 3: Fantasy Dashboard
**Given** a user navigates to the Fantasy page
**When** they view their dashboard
**Then** they see a modular grid layout with: driver cards showing team color gradients, a league standings table with colored position bars, a budget tracker with progress bar, and a next-race countdown timer

### Scenario 4: Standings Dashboard
**Given** a user navigates to the Standings page
**When** they view the page
**Then** they see driver and constructor standings in dashboard cards with team color indicators, form charts, and points progression

### Scenario 5: Strategy Lab Dashboard
**Given** a user opens a race replay in Strategy Lab
**When** they view the page
**Then** they see modular dashboard cards: speed gauge, track position map, live standings, tire status indicators, brake temperatures, and speed/RPM charts

## Functional Requirements

### FR-031: Top Navigation Bar
The system MUST provide a persistent horizontal top navigation bar with: SectorOne logo (left), navigation tabs (center: LIVE/DASHBOARD, ANALYSIS/STRATEGY, HISTORY/ARCHIVE, SETTINGS), and user profile icon (right). The active tab MUST show a visual indicator (underline or glow).

### FR-032: Hexagonal Background Pattern
The system MUST display a subtle hexagonal grid pattern as the background across ALL pages, rendered at low opacity (5-10%) to avoid distracting from content.

### FR-033: Neon Glow Card Variants
The system MUST support card components with colored neon glow borders that intensify on hover. Glow colors should match team colors or use cyan (#00D2BE) as the default accent.

### FR-034: Circuit Outline Visualization
The system MUST render simplified circuit outlines as SVG paths with neon stroke effects (2-3px stroke with glow filter). Circuit outlines MUST support team-colored or cyan glow variants.

### FR-035: Archive Filter Sidebar
The system MUST provide a collapsible left sidebar on the Archive page with filter sections: Year (checkboxes), Circuit Type (Street/Circuit/Hybrid), Weather (Dry/Wet/Mixed), Team (checkboxes), and Driver Wins (dropdown).

### FR-036: Season Selector Pill Bar
The system MUST display a horizontal pill-style year selector at the top of Archive and Standings pages, with the selected year highlighted in cyan/teal.

### FR-037: Enhanced GP Cards
The system MUST display GP cards with: circuit outline SVG (neon glow), winner name, date, fastest lap, top speed, total laps, and a cyan "VIEW FULL TELEMETRY" button.

### FR-038: Fantasy Driver Cards
The system MUST display fantasy roster drivers as cards with team color gradient backgrounds, driver name, points per race, and total points.

### FR-039: Fantasy Standings Table
The system MUST display league standings as a clean table with: position number with colored bar, player name, team affiliation, total points, and gap to leader.

### FR-040: Budget Tracker
The system MUST display a budget tracker with: current spending, remaining budget, progress bar with color-coded fill (green/yellow/red based on remaining percentage), and a "MANAGE TEAM" button.

### FR-041: Next Race Countdown
The system MUST display a countdown timer to the next race showing days, hours, minutes, and seconds with a "Predictions" button.

### FR-042: Dashboard Metric Cards
The system MUST provide reusable DataCard components displaying: label (uppercase, tracked), large numeric value (Space Grotesk, bold), and optional trend indicator.

### FR-043: Standings Table with Position Bars
The system MUST display standings tables with colored vertical bars next to position numbers, matching team colors.

### FR-044: Tire Status Indicators
The system MUST display tire status as circular progress indicators showing percentage remaining for each tire position (FL, FR, RL, RR).

### FR-045: Speed Gauge
The system MUST display a speed gauge visualization (arc or circular) showing current speed in KM/H with color-coded zones (green/yellow/red).

## Non-Functional Requirements

### NFR-008: Glow Performance
Neon glow effects MUST use CSS box-shadow and SVG filters efficiently to maintain 60fps rendering. Glow animations SHOULD use CSS transitions (not JavaScript) for smooth performance.

### NFR-009: Background Pattern Performance
The hexagonal background pattern MUST use a lightweight SVG or CSS pattern that does not impact scroll performance or increase bundle size significantly.

### NFR-010: Responsive Top Navigation
The top navigation MUST collapse to a hamburger menu on mobile screens (< 768px) with a slide-down navigation drawer.

### NFR-011: Filter Sidebar Responsiveness
The Archive filter sidebar MUST become a collapsible drawer on mobile screens, accessible via a "Filters" button.

## Success Criteria

### SC-009: Navigation Consistency
All pages display the same top navigation bar with correct active state indication.

### SC-010: Visual Cohesion
All pages share the same hexagonal background pattern, neon glow aesthetic, and glassmorphic card styling.

### SC-011: Archive Filter Functionality
Users can filter the Archive GP grid by year, circuit type, weather, team, and driver, with results updating in real-time.

### SC-012: Circuit Outline Rendering
Circuit outlines render as SVG paths with visible neon glow effects that intensify on hover.

### SC-013: Fantasy Dashboard Completeness
The Fantasy page displays all required dashboard elements: driver cards, standings table, budget tracker, and countdown timer.

### SC-014: Mobile Responsiveness
All redesigned pages function correctly on mobile devices with appropriate navigation and layout adaptations.

## Key Entities (Design)

- **TopNav**: Horizontal navigation bar with logo, tabs, and profile
- **FilterSidebar**: Collapsible left panel with checkbox/dropdown filters
- **SeasonSelector**: Horizontal pill bar for year selection
- **CircuitOutline**: SVG circuit renderer with neon glow filter
- **DataCard**: Dashboard metric card (label + value + trend)
- **GlowCard**: Glassmorphic card with colored neon border glow
- **DriverCard**: Fantasy driver display with team color gradient
- **StandingsTable**: Clean table with colored position bars
- **SpeedGauge**: Arc/circular speed visualization
- **TireIndicator**: Circular progress for tire status

## Design System Updates

### Colors (Additions)
- **Cyan Accent**: #00D2BE (secondary CTAs, active states, data highlights)
- **Neon Glow Cyan**: 0 0 10px rgba(0, 210, 190, 0.4), 0 0 20px rgba(0, 210, 190, 0.2)
- **Neon Glow Red**: 0 0 10px rgba(225, 6, 0, 0.4), 0 0 20px rgba(225, 6, 0, 0.2)
- **Neon Glow Yellow**: 0 0 10px rgba(255, 251, 0, 0.4), 0 0 20px rgba(255, 251, 0, 0.2)
- **Neon Glow Green**: 0 0 10px rgba(34, 197, 94, 0.4), 0 0 20px rgba(34, 197, 94, 0.2)

### Typography (No Changes)
- Headlines: Space Grotesk
- Body: Inter
- Data: Monospace

### Components (Additions)
- **TopNav**: Replaces SideNav for desktop navigation
- **FilterSidebar**: Left panel for Archive filters
- **SeasonSelector**: Horizontal year pill bar
- **CircuitOutline**: SVG circuit with glow filter
- **DataCard**: Metric display card
- **GlowCard**: Enhanced Card variant with colored glow

### Background
- **Hexagonal Pattern**: Subtle SVG hex grid at 5-10% opacity, applied globally

## Design Decisions

- **Navigation**: Top horizontal bar replaces sidebar for wider content area and modern dashboard feel
- **Primary Accent**: F1 Red (#E10600) retained for critical actions and active states
- **Secondary Accent**: Cyan (#00D2BE) used for data highlights and secondary CTAs
- **Glow Effects**: CSS box-shadow for cards, SVG filters for circuit outlines
- **Background Pattern**: SVG hex grid at very low opacity to avoid visual noise
- **Circuit Outlines**: Simplified SVG paths with neon stroke, not full coordinate rendering
- **Responsive Strategy**: Top nav → hamburger, filter sidebar → drawer on mobile
