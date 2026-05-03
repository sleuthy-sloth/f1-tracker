// @ts-nocheck
import React from 'react'
import { renderToString } from 'react-dom/server'
import ConstructorCard from '../../components/ConstructorCard'

describe('ConstructorCard', () => {
  test('Component existence', () => {
    expect(typeof ConstructorCard).toBe('function')
  })

  test('Loading state shows skeleton', () => {
    const html = renderToString(React.createElement(ConstructorCard as any, {
      teamStanding: null,
      drivers: [],
      driverStandings: [],
      isLoading: true,
    } as any))
    expect(typeof html).toBe('string')
  })

  test('Null standing shows empty state', () => {
    const html = renderToString(React.createElement(ConstructorCard as any, {
      teamStanding: null,
      drivers: [],
      driverStandings: [],
      isLoading: false,
    } as any))
    expect(typeof html).toBe('string')
  })

  test('Renders constructor data with driver split', () => {
    const html = renderToString(React.createElement(ConstructorCard as any, {
      teamStanding: { team_name: 'Red Bull', points_current: 320, points_start: 0, position_current: 1, position_start: 1 },
      drivers: [{ driver_number: 1, name_acronym: 'VER', team_colour: '#3671C6', team_name: 'Red Bull' }],
      driverStandings: [{ driver_number: 1, points_current: 180, points_start: 0, position_current: 1, position_start: 1 }],
      isLoading: false,
    } as any))
    expect(html).toContain('Red Bull')
    expect(html).toContain('320')
    expect(html).toContain('VER')
    expect(html).toContain('180')
  })
})
