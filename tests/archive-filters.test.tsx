import React from "react";
import { renderToString } from "react-dom/server";
import { describe, test, expect, vi } from "bun:test";

// Mock child components before importing the module under test
vi.mock("@/components/ui/Input", () => ({
  Input: (props: any) =>
    React.createElement("input", {
      "data-testid": "mock-input",
      placeholder: props.placeholder,
    }),
}));

vi.mock("@/components/GpCard", () => ({
  GpCard: ({ meeting }: any) =>
    React.createElement(
      "div",
      { "data-testid": "gp-card" },
      meeting?.meeting_name ?? "GP",
    ),
}));

// Import the component after mocks
import { ArchiveFilters } from "../components/ArchiveFilters";

describe("ArchiveFilters SSR rendering", () => {
  const createMeeting = (overrides = {}) => ({
    meeting_key: 1,
    meeting_name: "Test Grand Prix",
    circuit_short_name: "Test Circuit",
    circuit_type: "racetrack",
    country_code: "GB",
    country_name: "United Kingdom",
    date_start: "2025-01-01",
    date_end: "2025-01-03",
    year: 2025,
    ...overrides,
  });

  test("renders filter controls (circuit type pills and search input)", () => {
    const meetings = [createMeeting()];
    const sessionsByMeeting = new Map();
    sessionsByMeeting.set(1, []);

    const html = renderToString(
      React.createElement(ArchiveFilters, {
        meetings,
        sessionsByMeeting,
        selectedYear: 2025,
      }),
    );

    // Check circuit type filter pills
    expect(html).toContain("All");
    expect(html).toContain("Street");
    expect(html).toContain("Race Track");

    // Check search input
    expect(html).toContain("Search circuits...");
  });

  test("renders GpCard for each meeting by default", () => {
    const meetings = [
      createMeeting({ meeting_key: 1, meeting_name: "British GP" }),
      createMeeting({ meeting_key: 2, meeting_name: "Italian GP" }),
    ];
    const sessionsByMeeting = new Map();
    sessionsByMeeting.set(1, []);
    sessionsByMeeting.set(2, []);

    const html = renderToString(
      React.createElement(ArchiveFilters, {
        meetings,
        sessionsByMeeting,
        selectedYear: 2025,
      }),
    );

    expect(html).toContain("British GP");
    expect(html).toContain("Italian GP");
  });

  test("shows empty state when no meetings provided", () => {
    const html = renderToString(
      React.createElement(ArchiveFilters, {
        meetings: [],
        sessionsByMeeting: new Map(),
        selectedYear: 2025,
      }),
    );

    expect(html).toMatch(/No Grands Prix found for .*2025.* matching your filters/);
  });

  test("renders circuit type pill buttons with aria-pressed", () => {
    const meetings = [createMeeting()];
    const sessionsByMeeting = new Map();
    sessionsByMeeting.set(1, []);

    const html = renderToString(
      React.createElement(ArchiveFilters, {
        meetings,
        sessionsByMeeting,
        selectedYear: 2025,
      }),
    );

    // Check that aria-pressed attributes are present on filter buttons
    // The "All" button should be pressed by default
    expect(html).toContain('aria-pressed="true"');
    // The "Street" and "Race Track" buttons should not be pressed
    expect(html).toContain('aria-pressed="false"');
  });
});
