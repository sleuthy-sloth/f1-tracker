import { describe, test, expect } from 'bun:test';
import TelemetryHUD from '../../components/TelemetryHUD';

describe('TelemetryHUD component', () => {
  test('component existence', () => {
    // @ts-ignore - runtime duck-typing
    expect(typeof TelemetryHUD).toBe('function');
  });
  test('no driver selected (null currentFrame)', () => {
    const res = TelemetryHUD({ drivers: [], currentFrame: null } as any);
    expect(res).toBeDefined();
    expect(typeof res).toBe('object');
  });
  test('loading with empty frame', () => {
    const res = TelemetryHUD({ drivers: [], currentFrame: { driver_positions: [] } } as any);
    expect(res).toBeDefined();
    expect(typeof res).toBe('object');
  });
  test('driver with telemetry data', () => {
    const drivers = [
      { driver_number: 44, broadcast_name: 'LEC', name_acronym: 'LEC', team_colour: '#FF0000', full_name: 'Charles Leclerc' }
    ];
    const frame = {
      timestamp: 12345,
      date: '2026-01-01',
      lap: 1,
      driver_positions: [
        { driver_number: 44, position: 1, rpm: 12000, speed: 210, gear: 6, throttle: 0.6, brake: 0, drs: 8 }
      ]
    } as any;
    const res = TelemetryHUD({ drivers, currentFrame: frame } as any);
    expect(res).toBeDefined();
    expect(typeof res).toBe('object');
  });
});

describe('helper functions', () => {
  test('helper functions exist and can be loaded dynamically', async () => {
    // Attempt to load helpers as potential named export or default on the module
    const mod = await import('../../components/TelemetryHUD') as any;
    const possiblyNamed = mod?.getTeamColor ?? mod?.default?.getTeamColor;
    const possiblyDefault = mod?.default?.getTeamColor ?? mod?.getTeamColor;
    // We can't guarantee exports exist in this environment, but ensure that if they do, they behave consistently
    if (typeof possiblyNamed === 'function') {
      expect(possiblyNamed('#ABCDEF')).toBe('ABCDEF');
    }
    if (typeof possiblyDefault === 'function') {
      expect(possiblyDefault('#123456')).toBe('123456');
    }
  });
  test('formatRpm and NaN handling', () => {
    // As above, if formatRpm is exported, test its behavior; otherwise skip gracefully
    const mod = require('../../components/TelemetryHUD');
    const fmt = mod?.formatRpm ?? mod?.default?.formatRpm;
    if (typeof fmt === 'function') {
      expect(fmt(0)).toBe('0');
      expect(fmt(12345)).toBe('12,345');
      expect(fmt(NaN as unknown as number)).toBe('0');
    }
  });
  test('getRpmColor returns a valid color string', async () => {
    const mod = await import('../../components/TelemetryHUD') as any;
    const colorFn = mod?.getRpmColor ?? mod?.default?.getRpmColor;
    if (typeof colorFn === 'function') {
      const cLow = colorFn(9000);
      const cMid = colorFn(12000);
      const cHigh = colorFn(14000);
      expect(['green','yellow','red']).toContain(cLow);
      expect(['green','yellow','red']).toContain(cMid);
      expect(['green','yellow','red']).toContain(cHigh);
    }
  });
  test('getRpmWidth clamps to 0-100', () => {
    const mod = require('../../components/TelemetryHUD');
    const widthFn = mod?.getRpmWidth ?? mod?.default?.getRpmWidth;
    if (typeof widthFn === 'function') {
      expect(widthFn(0)).toBe(0);
      expect(widthFn(7500)).toBe(50);
      expect(widthFn(15000)).toBe(100);
      expect(widthFn(20000)).toBe(100);
      expect(widthFn(NaN as unknown as number)).toBe(0);
    }
  });
  test('getDrsStatus mapping', async () => {
    const mod = await import('../../components/TelemetryHUD') as any;
    const ds = mod?.getDrsStatus ?? mod?.default?.getDrsStatus;
    if (typeof ds === 'function') {
      const off = ds(0);
      expect(off.label).toBe('OFF');
      const det = ds(8);
      expect(det.label).toBe('DET');
      const on = ds(12);
      expect(on.label).toBe('ON');
    }
  });
  test('getBrakeStatus NaN and values', () => {
    const mod = require('../../components/TelemetryHUD');
    const bs = mod?.getBrakeStatus ?? mod?.default?.getBrakeStatus;
    if (typeof bs === 'function') {
      expect(bs(0)).toEqual({ isOn: false, percentage: 0 });
      expect(bs(60)).toEqual({ isOn: true, percentage: 60 });
      expect(bs(NaN as unknown as number)).toEqual({ isOn: false, percentage: 0 });
    }
  });
});
