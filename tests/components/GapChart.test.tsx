// @ts-nocheck
import React from 'react'
import { renderToString } from 'react-dom/server'
import GapChart from '../../components/GapChart'

describe('GapChart', () => {
  test('Component existence', () => {
    expect(typeof GapChart).toBe('function')
  })

  test('Empty state: currentFrame is null shows "No race data"', () => {
    const html = renderToString(React.createElement(GapChart as any, {
      currentFrame: null,
      drivers: [],
      selectedDriverNumbers: [],
    } as any))
    expect(html).toContain('No race data')
  })

  test('No drivers selected shows "Select drivers to view gaps"', () => {
    const html = renderToString(React.createElement(GapChart as any, {
      currentFrame: { timestamp: 1000, date: '2026-01-01', lap: 1, driver_positions: [] },
      drivers: [],
      selectedDriverNumbers: [],
    } as any))
    expect(html).toContain('Select drivers to view gaps')
  })

  test('No gap data when all driver gaps are null', () => {
    const html = renderToString(React.createElement(GapChart as any, {
      currentFrame: {
        timestamp: 1000,
        date: '2026-01-01',
        lap: 1,
        driver_positions: [
          { driver_number: 1, position: 1, gap_to_leader: null },
          { driver_number: 2, position: 2, gap_to_leader: null },
        ],
      },
      drivers: [
        { driver_number: 1, name_acronym: 'ALO', team_colour: '#FF0000' },
        { driver_number: 2, name_acronym: 'LEC', team_colour: '#00FF00' },
      ],
      selectedDriverNumbers: [1, 2],
    } as any))
    expect(html).toContain('Gap data not available')
  })

  test('Live display with gap data renders driver names and gap values', () => {
    const html = renderToString(React.createElement(GapChart as any, {
      currentFrame: {
        timestamp: 1000,
        date: '2026-01-01',
        lap: 1,
        driver_positions: [
          { driver_number: 1, position: 1, gap_to_leader: 0 },
          { driver_number: 2, position: 2, gap_to_leader: 1.23 },
        ],
      },
      drivers: [
        { driver_number: 1, name_acronym: 'ALO', team_colour: '#FF0000' },
        { driver_number: 2, name_acronym: 'LEC', team_colour: '#00FF00' },
      ],
      selectedDriverNumbers: [1, 2],
    } as any))
    expect(html).toContain('ALO')
    expect(html).toContain('LEC')
    expect(html).toContain('1.23')
  })

  test('LAP string handling: gap_to_leader="LAP" shows "LAP" text', () => {
    const html = renderToString(React.createElement(GapChart as any, {
      currentFrame: {
        timestamp: 1000,
        date: '2026-01-01',
        lap: 1,
        driver_positions: [
          { driver_number: 1, position: 1, gap_to_leader: 0 },
          { driver_number: 2, position: 2, gap_to_leader: 'LAP' },
        ],
      },
      drivers: [
        { driver_number: 1, name_acronym: 'VER', team_colour: '#3671C6' },
        { driver_number: 2, name_acronym: 'PER', team_colour: '#3671C6' },
      ],
      selectedDriverNumbers: [1, 2],
    } as any))
    expect(html).toContain('LAP')
  })
})
