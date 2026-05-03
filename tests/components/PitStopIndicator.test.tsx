// @ts-nocheck
import React from 'react'
import { renderToString } from 'react-dom/server'
import PitStopIndicator from '../../components/PitStopIndicator'

describe('PitStopIndicator', () => {
  test('Component existence', () => {
    expect(typeof PitStopIndicator).toBe('function')
  })

  test('No driver data: empty drivers shows "No driver data"', () => {
    const html = renderToString(React.createElement(PitStopIndicator as any, {
      drivers: [],
      pitStops: [],
      stints: [],
      currentLap: 1,
    } as any))
    expect(html).toContain('No driver data')
  })

  test('No pit stops: empty pitStops shows "No pit stops yet"', () => {
    const html = renderToString(React.createElement(PitStopIndicator as any, {
      drivers: [{ driver_number: 1, name_acronym: 'ALO', team_colour: '#FF0000' }],
      pitStops: [],
      stints: [],
      currentLap: 5,
    } as any))
    expect(html).toContain('No pit stops yet')
  })

  test('Renders pit stop events', () => {
    const html = renderToString(React.createElement(PitStopIndicator as any, {
      drivers: [{ driver_number: 1, name_acronym: 'ALO', team_colour: '#FF0000' }],
      pitStops: [{
        driver_number: 1,
        lap_number: 10,
        stop_duration: 22.5,
        lane_duration: 30,
        date: '2026-01-01T00:10:00Z',
      }],
      stints: [{
        driver_number: 1,
        compound: 'SOFT',
        lap_start: 10,
        lap_end: 25,
        stint_number: 2,
        tyre_age_at_start: 0,
      }],
      currentLap: 15,
    } as any))
    expect(html).toContain('PIT')
    expect(html).toContain('ALO')
    expect(html).toContain('10')
    expect(html).toContain('22.5')
  })
})
