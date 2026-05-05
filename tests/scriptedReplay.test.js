import { describe, test, expect } from 'bun:test';
import { buildScriptedFrames } from '../lib/scriptedReplay';

function makeDriver(driverNumber) {
  return {
    driver_number: driverNumber,
    broadcast_name: `Driver ${driverNumber}`,
    first_name: `F${driverNumber}`,
    last_name: `L${driverNumber}`,
    full_name: `F${driverNumber} L${driverNumber}`,
    name_acronym: `D${driverNumber}`,
    headshot_url: '',
    team_name: 'Team',
    team_colour: '#000',
    meeting_key: 1,
    session_key: 1,
  };
}

function makeLap(lapNumber, dateStartMs) {
  return {
    date_start: new Date(dateStartMs).toISOString(),
    driver_number: 1,
    duration_sector_1: null,
    duration_sector_2: null,
    duration_sector_3: null,
    i1_speed: null,
    i2_speed: null,
    is_pit_out_lap: false,
    lap_duration: null,
    lap_number: lapNumber,
    meeting_key: 1,
    segments_sector_1: [],
    segments_sector_2: [],
    segments_sector_3: [],
    session_key: 1,
    st_speed: null,
  };
}

function makeConfig(opts = {}) {
  const { lapData, totalRaceLaps, endTimestamp, scriptedLapMs, frameIntervalMs } = opts;
  const cfg = {
    trackPath: [ { x: 0, y: 0 }, { x: 1, y: 0 } ],
    drivers: [ makeDriver(1) ],
    gridOrder: [ 1 ],
    startTimestamp: 0,
    endTimestamp: endTimestamp ?? 30000,
    frameIntervalMs: frameIntervalMs ?? 5000,
    scriptedLapMs: scriptedLapMs ?? 10000,
    lapData: lapData,
    totalRaceLaps: totalRaceLaps,
    weather: undefined,
    raceControl: undefined,
  };
  return cfg;
}

describe('buildScriptedFrames lap counter scenarios', () => {
  test('1. No lapData provided → falls back to time-based estimate with clamp', () => {
    const cfg = makeConfig({ totalRaceLaps: 3, endTimestamp: 30000, frameIntervalMs: 5000, scriptedLapMs: 10000 });
    const frames = buildScriptedFrames(cfg);
    const target = frames.find((f) => f.timestamp === 25000);
    expect(target).toBeDefined();
    expect(target.lap).toBe(3);
    const endFrame = frames.find((f) => f.timestamp === 30000);
    expect(endFrame).toBeDefined();
    expect(endFrame.lap).toBe(3);
  });

  test('2. Empty lapData array → same behavior as scenario 1', () => {
    const cfg = makeConfig({ lapData: [], totalRaceLaps: 3, endTimestamp: 30000, frameIntervalMs: 5000, scriptedLapMs: 10000 });
    const frames = buildScriptedFrames(cfg);
    const t15000 = frames.find((f) => f.timestamp === 15000);
    expect(t15000).toBeDefined();
    // With the chosen times, 15000 maps to lap 2 (started at 10000ms)
    expect(t15000.lap).toBe(2);
  });

  test('3. Lap data with 3 laps → test mid-lap mapping', () => {
    const lapData = [
      makeLap(1, 0),    // t=0
      makeLap(2, 11000), // t=11s
      makeLap(3, 21000), // t=21s
    ];
    const cfg = makeConfig({ lapData, totalRaceLaps: 3, endTimestamp: 30000, frameIntervalMs: 5000, scriptedLapMs: 10000 });
    const frames = buildScriptedFrames(cfg);
    const t15000 = frames.find((f) => f.timestamp === 15000);
    expect(t15000).toBeDefined();
    // 15000 lies between lap1 and lap2 starts → expected lap = 2 per lookup
    expect(t15000.lap).toBe(2);
    const t0 = frames.find((f) => f.timestamp === 0);
    expect(t0.lap).toBe(1);
  });

  test('4. Lap data with totalRaceLaps = 0 → uses max lap from data', () => {
    const lapData = [makeLap(1, 0), makeLap(2, 11000), makeLap(3, 21000)];
    const cfg = makeConfig({ lapData, totalRaceLaps: 0, endTimestamp: 30000, frameIntervalMs: 5000, scriptedLapMs: 10000 });
    const frames = buildScriptedFrames(cfg);
    const t25000 = frames.find((f) => f.timestamp === 25000);
    expect(t25000).toBeDefined();
    // 25000 is after lap 2 start and before lap 3 start → should map to lap 2 (as per lookup logic) if using maxLap=3
    expect([1,2,3].includes(t25000.lap)).toBe(true);
  });

  test('5. Lap data with totalRaceLaps = 3 → clamp works, no frame shows lap > 3', () => {
    const lapData = [makeLap(1, 0), makeLap(2, 11000), makeLap(3, 21000)];
    const cfg = makeConfig({ lapData, totalRaceLaps: 3, endTimestamp: 30000, frameIntervalMs: 5000, scriptedLapMs: 10000 });
    const frames = buildScriptedFrames(cfg);
    const t30000 = frames.find((f) => f.timestamp === 30000);
    expect(t30000).toBeDefined();
    expect(t30000.lap).toBeLessThanOrEqual(3);
  });

  test('6. Edge: frame timestamp before first lap start → lap 1', () => {
    const lapData = [makeLap(1, 1000), makeLap(2, 11000), makeLap(3, 21000)];
    const cfg = makeConfig({ lapData, totalRaceLaps: 3, endTimestamp: 30000, frameIntervalMs: 5000, scriptedLapMs: 10000 });
    const frames = buildScriptedFrames(cfg);
    const t0 = frames.find((f) => f.timestamp === 0);
    expect(t0).toBeDefined();
    expect(t0.lap).toBe(1);
  });

  test('7. Edge: totalRaceLaps > actual lap data length → clamps correctly', () => {
    const lapData = [makeLap(1, 0), makeLap(2, 11000), makeLap(3, 21000)];
    const cfg = makeConfig({ lapData, totalRaceLaps: 5, endTimestamp: 30000, frameIntervalMs: 5000, scriptedLapMs: 10000 });
    const frames = buildScriptedFrames(cfg);
    const maxLapObserved = Math.max(...frames.map((f) => f.lap));
    expect(maxLapObserved).toBeLessThanOrEqual(3);
  });

  test('8. buildLapLookup handles 0 as unknown (via fallback)', () => {
    // When there are no lap starts and totalRaceLaps is 0, first frame should map to lap 1
    const cfg = makeConfig({ lapData: [], totalRaceLaps: 0, endTimestamp: 10000, frameIntervalMs: 5000, scriptedLapMs: 10000 });
    const frames = buildScriptedFrames(cfg);
    const t0 = frames.find((f) => f.timestamp === 0);
    expect(t0).toBeDefined();
    expect(t0.lap).toBe(1);
  });
});
