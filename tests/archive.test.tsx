// Archive page & GpCard SSR tests
// Note: These tests render server components to string to verify output.
// They mock the OpenF1 API client to avoid real HTTP calls.

import { describe, test, expect, vi } from 'bun:test';
import React from 'react';
import { renderToString } from 'react-dom/server';

// Mock OpenF1 API client before loading production modules
vi.mock('@/lib/api/openf1', () => {
  return {
    getAvailableYears: vi.fn(),
    getMeetingsByYear: vi.fn(),
    getSessions: vi.fn(),
  };
});

describe('Archive page (server components)', () => {
  // Helper to lazily load the real page module after mocks are in place
  const loadArchivePage = async () => {
    const mod = await import('../app/archive/page');
    return mod.default as any;
  };

  test('renders year selector and GP card for a valid year', async () => {
    const api = await import('@/lib/api/openf1');
    const getAvailableYears = api.getAvailableYears as any;
    const getMeetingsByYear = api.getMeetingsByYear as any;
    const getSessions = api.getSessions as any;

    const meeting1: any = {
      meeting_key: 101,
      meeting_name: 'Italian Grand Prix',
      circuit_short_name: 'Monza',
      circuit_type: 'racetrack',
      country_code: 'IT',
      country_name: 'Italy',
      date_start: '2024-09-06',
      date_end: '2024-09-08',
      year: 2024,
    };

    const sessionsFor101: any[] = [
      {
        session_key: 1001,
        session_type: 'Race',
        meeting_key: 101,
        date_start: '2024-09-06T14:00:00',
        date_end: '2024-09-06T15:00:00',
        session_name: 'Race 1',
        country_code: 'IT',
        country_name: 'Italy',
        year: 2024,
      },
      {
        session_key: 1002,
        session_type: 'Qualifying',
        meeting_key: 101,
        date_start: '2024-09-06T12:00:00',
        date_end: '2024-09-06T12:30:00',
        session_name: 'Quali',
        country_code: 'IT',
        country_name: 'Italy',
        year: 2024,
      },
    ];

    // Mock API responses
    getAvailableYears.mockResolvedValue([2024, 2023]);
    getMeetingsByYear.mockResolvedValue([meeting1]);
    getSessions.mockResolvedValue(sessionsFor101);

    const ArchivePage = await loadArchivePage();
    const pageEl = await ArchivePage({ searchParams: Promise.resolve({ year: '2024' }) });
    const html = renderToString(pageEl);

    // Basic content checks
    expect(html).toContain('Italian Grand Prix');
    expect(html).toContain('/archive/1001');
    expect(html).toContain('🇮🇹'); // Italian flag emoji
    expect(html).toContain('Sep 6-8, 2024');
    expect(html).toContain('Race');
    expect(html).toContain('Qualifying'); // Session type chip display
  });

  test('renders empty state when API returns no data', async () => {
    const api = await import('@/lib/api/openf1');
    const getAvailableYears = api.getAvailableYears as any;
    const getMeetingsByYear = api.getMeetingsByYear as any;
    const getSessions = api.getSessions as any;
    getAvailableYears.mockResolvedValue([]);
    getMeetingsByYear.mockResolvedValue([]);
    getSessions.mockResolvedValue([]);

    const ArchivePage = await loadArchivePage();
    const pageEl = await ArchivePage({ searchParams: Promise.resolve({ year: '2024' }) });
    const html = renderToString(pageEl);

    expect(html).toMatch(/No Grands Prix found for/);
  });

  test('invalid year param falls back to first available year (or current year)', async () => {
    const api = await import('@/lib/api/openf1');
    const getAvailableYears = api.getAvailableYears as any;
    const getMeetingsByYear = api.getMeetingsByYear as any;
    const getSessions = api.getSessions as any;
    getAvailableYears.mockResolvedValue([2024, 2023]);
    const meeting1: any = {
      meeting_key: 101,
      meeting_name: 'Italian Grand Prix',
      circuit_short_name: 'Monza',
      circuit_type: 'racetrack',
      country_code: 'IT',
      country_name: 'Italy',
      date_start: '2024-09-06',
      date_end: '2024-09-08',
      year: 2024,
    };
    getMeetingsByYear.mockResolvedValue([meeting1]);
    getSessions.mockResolvedValue([
      {
        session_key: 1001,
        session_type: 'Race',
        meeting_key: 101,
        date_start: '2024-09-06T14:00:00',
        date_end: '2024-09-06T15:00:00',
        session_name: 'Race 1',
        country_code: 'IT',
        country_name: 'Italy',
        year: 2024,
      },
    ]);

    const ArchivePage = await loadArchivePage();
    const pageEl = await ArchivePage({ searchParams: Promise.resolve({ year: 'abc' }) });
    const html = renderToString(pageEl);

    // We still render pills for available years, and the selected year should be 2024
    expect(html).toContain('2024');
    expect(html).toContain('bg-f1-red'); // selected pill styling
  });
});

describe('GpCard component', () => {
  test('renders meeting card with flag, date and race chip and archive link', async () => {
    const { GpCard } = await import('../components/GpCard');
    const meeting: any = {
      meeting_key: 555,
      meeting_name: 'Test GP',
      circuit_short_name: 'Test Circuit',
      circuit_type: 'street',
      country_code: 'US',
      country_name: 'United States',
      date_start: '2024-01-01',
      date_end: '2024-01-02',
      year: 2024,
    };

    const sessions: any[] = [
      { session_key: 301, session_type: 'Race', meeting_key: 555, date_start: '2024-01-01T14:00:00', date_end: '2024-01-01T15:00:00', session_name: 'Race 1', country_code: 'US', country_name: 'United States', year: 2024 },
    ];

    const html = renderToString(React.createElement(GpCard, { meeting, sessions }));
    expect(html).toContain('Test GP');
    expect(html).toContain('🇺🇸');
    expect(html).toContain('/archive/301');
    expect(html).toContain('Race');
    expect(html).toContain('Jan 1-2, 2024');
  });

  test('GpCard shows fallback when country code is invalid', async () => {
    const { GpCard } = await import('../components/GpCard');
    const meeting: any = {
      meeting_key: 556,
      meeting_name: 'Faulty GP',
      circuit_short_name: 'Test Circuit',
      circuit_type: 'racetrack',
      country_code: '',
      country_name: '',
      date_start: '2024-01-01',
      date_end: '2024-01-01',
      year: 2024,
    };
    const sessions: any[] = [
      { session_key: 302, session_type: 'Race', meeting_key: 556, date_start: '2024-01-01T14:00:00', date_end: '2024-01-01T15:00:00', session_name: 'Race 1', country_code: '', country_name: '', year: 2024 },
    ];
    const html = renderToString(React.createElement(GpCard, { meeting, sessions }));
    expect(html).toContain('🏁'); // fallback flag
  });
});
