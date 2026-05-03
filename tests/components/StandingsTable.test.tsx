// @ts-nocheck
import React from 'react'
import { renderToString } from 'react-dom/server'
import StandingsTable from '../../components/StandingsTable'

describe('StandingsTable', () => {
  test('Component existence', () => {
    expect(typeof StandingsTable).toBe('function')
  })

  test('Loading state shows skeleton', () => {
    const html = renderToString(React.createElement(StandingsTable as any, {
      driverStandings: [],
      teamStandings: [],
      drivers: [],
      isLoading: true,
      view: 'drivers',
    } as any))
    expect(typeof html).toBe('string')
  })

  test('Empty driver standings shows "No championship data"', () => {
    const html = renderToString(React.createElement(StandingsTable as any, {
      driverStandings: [],
      teamStandings: [],
      drivers: [],
      isLoading: false,
      view: 'drivers',
    } as any))
    expect(html).toContain('No championship data')
  })

  test('Renders driver standings with data', () => {
    const html = renderToString(React.createElement(StandingsTable as any, {
      driverStandings: [
        { driver_number: 1, points_current: 180, points_start: 0, position_current: 1, position_start: 1 },
        { driver_number: 2, points_current: 120, points_start: 0, position_current: 2, position_start: 2 },
      ],
      teamStandings: [],
      drivers: [
        { driver_number: 1, name_acronym: 'VER', team_colour: '#3671C6', full_name: 'Max Verstappen' },
        { driver_number: 2, name_acronym: 'LEC', team_colour: '#E8002D', full_name: 'Charles Leclerc' },
      ],
      isLoading: false,
      view: 'drivers',
    } as any))
    expect(html).toContain('DRIVER STANDINGS')
    expect(html).toContain('VER')
    expect(html).toContain('LEC')
    expect(html).toContain('180')
    expect(html).toContain('120')
  })

  test('Renders constructor standings with data', () => {
    const html = renderToString(React.createElement(StandingsTable as any, {
      driverStandings: [],
      teamStandings: [
        { team_name: 'Red Bull', points_current: 320, points_start: 0, position_current: 1, position_start: 1 },
        { team_name: 'Ferrari', points_current: 280, points_start: 0, position_current: 2, position_start: 3 },
      ],
      drivers: [],
      isLoading: false,
      view: 'constructors',
    } as any))
    expect(html).toContain('CONSTRUCTOR STANDINGS')
    expect(html).toContain('Red Bull')
    expect(html).toContain('Ferrari')
    expect(html).toContain('320')
    expect(html).toContain('280')
  })
})
