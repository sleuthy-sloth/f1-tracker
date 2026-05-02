import React from "react";
import { renderToString } from "react-dom/server";
import { describe, test, expect, vi, beforeEach } from "bun:test";

// Mock the OpenF1 API module
vi.mock("@/lib/api/openf1", () => ({
  getSessions: vi.fn(),
  getDrivers: vi.fn(),
  getSessionResult: vi.fn(),
}));

// Must import after mocks
import SessionPage from "../app/archive/[sessionKey]/page";
import { getSessions, getDrivers, getSessionResult } from "@/lib/api/openf1";

describe("Session detail page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function createMockSession(overrides = {}) {
    return {
      session_key: 1001,
      session_name: "Race",
      session_type: "Race",
      meeting_key: 101,
      circuit_key: 1,
      circuit_short_name: "Silverstone",
      country_code: "GB",
      country_key: 1,
      country_name: "United Kingdom",
      date_start: "2025-07-06T14:00:00Z",
      date_end: "2025-07-06T16:00:00Z",
      gmt_offset: "01:00",
      location: "Silverstone",
      year: 2025,
      is_cancelled: false,
      ...overrides,
    };
  }

  function createMockDriver(overrides = {}) {
    return {
      driver_number: 1,
      broadcast_name: "M VERSTAPPEN",
      first_name: "Max",
      last_name: "Verstappen",
      full_name: "Max Verstappen",
      name_acronym: "VER",
      headshot_url: "",
      team_name: "Red Bull Racing",
      team_colour: "1e41ff",
      meeting_key: 101,
      session_key: 1001,
      ...overrides,
    };
  }

  function createMockResult(overrides = {}) {
    return {
      dnf: false,
      dns: false,
      dsq: false,
      driver_number: 1,
      duration: null,
      gap_to_leader: null,
      number_of_laps: 52,
      meeting_key: 101,
      position: 1,
      session_key: 1001,
      ...overrides,
    };
  }

  test("renders session header and results for a valid session", async () => {
    (getSessions as any).mockResolvedValue([createMockSession()]);
    (getDrivers as any).mockResolvedValue([createMockDriver()]);
    (getSessionResult as any).mockResolvedValue([
      createMockResult({ gap_to_leader: 0, number_of_laps: 52 }),
    ]);

    const element = await SessionPage({
      params: Promise.resolve({ sessionKey: "1001" }),
    });
    const html = renderToString(element);

    // Session info
    expect(html).toContain("Race");
    expect(html).toContain("Silverstone");
    expect(html).toContain("2025");

    // Driver info
    expect(html).toContain("Max Verstappen");
    expect(html).toContain("Red Bull Racing");

    // Results table
    expect(html).toContain("Pos");
    expect(html).toContain("Driver");
    expect(html).toContain("Laps");
    expect(html).toContain("52");
  });

  test('renders "Session not found" for invalid session key', async () => {
    (getSessions as any).mockResolvedValue([]);
    (getDrivers as any).mockResolvedValue([]);
    (getSessionResult as any).mockResolvedValue([]);

    const element = await SessionPage({
      params: Promise.resolve({ sessionKey: "9999" }),
    });
    const html = renderToString(element);

    expect(html).toContain("Session not found");
    expect(html).toContain("Back to Archive");
  });

  test('renders "Session not found" for NaN session key', async () => {
    const element = await SessionPage({
      params: Promise.resolve({ sessionKey: "abc" }),
    });
    const html = renderToString(element);

    expect(html).toContain("Session not found");
    expect(html).toContain("Invalid session key.");
  });

  test("shows DNF status in results", async () => {
    (getSessions as any).mockResolvedValue([createMockSession()]);
    (getDrivers as any).mockResolvedValue([
      createMockDriver({ driver_number: 1, full_name: "Max Verstappen" }),
      createMockDriver({
        driver_number: 2,
        full_name: "Lewis Hamilton",
        team_name: "Mercedes",
        team_colour: "00d2be",
      }),
    ]);
    (getSessionResult as any).mockResolvedValue([
      createMockResult({ driver_number: 1, gap_to_leader: 0, dnf: false }),
      createMockResult({
        driver_number: 2,
        dnf: true,
        gap_to_leader: null,
        position: 2,
      }),
    ]);

    const element = await SessionPage({
      params: Promise.resolve({ sessionKey: "1001" }),
    });
    const html = renderToString(element);

    expect(html).toContain("Max Verstappen");
    expect(html).toContain("Lewis Hamilton");
    expect(html).toContain("DNF");
  });

  test('renders "Launch Replay" button', async () => {
    (getSessions as any).mockResolvedValue([createMockSession()]);
    (getDrivers as any).mockResolvedValue([createMockDriver()]);
    (getSessionResult as any).mockResolvedValue([createMockResult()]);

    const element = await SessionPage({
      params: Promise.resolve({ sessionKey: "1001" }),
    });
    const html = renderToString(element);

    expect(html).toContain("Launch Replay");
    expect(html).toContain("strategy-lab");
  });
});
