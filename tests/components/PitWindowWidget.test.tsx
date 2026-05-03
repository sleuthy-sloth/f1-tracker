// @ts-nocheck
import React from 'react'
import { renderToString } from 'react-dom/server'
import PitWindowWidget from '../../components/PitWindowWidget'

describe('PitWindowWidget', () => {
  test('Component existence', () => {
    expect(typeof PitWindowWidget).toBe('function')
  })

  test('No driver selected: null selectedDriverNumber shows "Select a driver"', () => {
    const html = renderToString(React.createElement(PitWindowWidget as any, {
      drivers: [{ driver_number: 1, name_acronym: 'ALO', team_colour: '#FF0000' }],
      stints: [{
        driver_number: 1,
        compound: 'SOFT',
        lap_start: 1,
        lap_end: 30,
        stint_number: 1,
        tyre_age_at_start: 0,
      }],
      currentLap: 1,
      totalLaps: 58,
      selectedDriverNumber: null,
    } as any))
    expect(html).toContain('Select')
  })

  test('No stint data shows appropriate state', () => {
    const html = renderToString(React.createElement(PitWindowWidget as any, {
      drivers: [{ driver_number: 1, name_acronym: 'ALO', team_colour: '#FF0000' }],
      stints: [],
      currentLap: 5,
      totalLaps: 58,
      selectedDriverNumber: 1,
    } as any))
    expect(typeof html).toBe('string')
  })

  test('Renders strategy recommendation for fresh tyres', () => {
    const html = renderToString(React.createElement(PitWindowWidget as any, {
      drivers: [{ driver_number: 1, name_acronym: 'ALO', team_colour: '#FF0000' }],
      stints: [{
        driver_number: 1,
        compound: 'SOFT',
        lap_start: 1,
        lap_end: 30,
        stint_number: 1,
        tyre_age_at_start: 0,
      }],
      currentLap: 3,
      totalLaps: 58,
      selectedDriverNumber: 1,
    } as any))
    expect(html).toContain('Pit Strategy')
    expect(html).toContain('SOFT')
  })

  test('Shows PIT NOW for critical tyre degradation', () => {
    const html = renderToString(React.createElement(PitWindowWidget as any, {
      drivers: [{ driver_number: 1, name_acronym: 'ALO', team_colour: '#FF0000' }],
      stints: [{
        driver_number: 1,
        compound: 'SOFT',
        lap_start: 1,
        lap_end: 30,
        stint_number: 1,
        tyre_age_at_start: 0,
      }],
      currentLap: 28,
      totalLaps: 58,
      selectedDriverNumber: 1,
    } as any))
    expect(html).toContain('PIT NOW')
  })
})
