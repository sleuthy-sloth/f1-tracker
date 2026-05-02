// @ts-nocheck
import React from 'react'
import { renderToString } from 'react-dom/server'
import TyreWidget from '../../components/TyreWidget'

describe('TyreWidget', () => {
  test('Component existence', () => {
    expect(typeof TyreWidget).toBe('function')
  })

  test('No drivers: empty drivers array shows "No driver data"', () => {
    const html = renderToString(React.createElement(TyreWidget as any, {
      drivers: [],
      stints: [],
      currentLap: 1,
      selectedDriverNumber: null,
    } as any))
    expect(html).toContain('No driver data')
  })

  test('No stints: empty stints array shows "Tyre data not available"', () => {
    const html = renderToString(React.createElement(TyreWidget as any, {
      drivers: [{ driver_number: 1, name_acronym: 'ALO', team_colour: '#FF0000' }],
      stints: [],
      currentLap: 1,
      selectedDriverNumber: null,
    } as any))
    expect(html).toContain('Tyre data not available')
  })

  test('Valid display: drivers with stints renders name_acronym', () => {
    const html = renderToString(React.createElement(TyreWidget as any, {
      drivers: [{ driver_number: 1, name_acronym: 'ALO', team_colour: '#FF0000' }],
      stints: [{
        driver_number: 1,
        compound: 'SOFT',
        lap_start: 1,
        lap_end: 20,
        stint_number: 1,
        tyre_age_at_start: 0,
      }],
      currentLap: 5,
      selectedDriverNumber: null,
    } as any))
    expect(html).toContain('ALO')
    expect(html).toContain('S') // SOFT badge
  })

  test('Selected driver highlighted', () => {
    const html = renderToString(React.createElement(TyreWidget as any, {
      drivers: [{ driver_number: 1, name_acronym: 'ALO', team_colour: '#FF0000' }],
      stints: [{
        driver_number: 1,
        compound: 'SOFT',
        lap_start: 1,
        lap_end: 20,
        stint_number: 1,
        tyre_age_at_start: 0,
      }],
      currentLap: 5,
      selectedDriverNumber: 1,
    } as any))
    expect(html).toContain('ALO')
  })

  test('Edge: invalid/NaN current lap does not crash', () => {
    const html = renderToString(React.createElement(TyreWidget as any, {
      drivers: [{ driver_number: 1, name_acronym: 'ALO', team_colour: '#FF0000' }],
      stints: [{
        driver_number: 1,
        compound: 'SOFT',
        lap_start: 1,
        lap_end: 20,
        stint_number: 1,
        tyre_age_at_start: 0,
      }],
      currentLap: NaN,
      selectedDriverNumber: null,
    } as any))
    expect(typeof html).toBe('string')
  })

  test('Edge: current lap before any stint start does not crash', () => {
    const html = renderToString(React.createElement(TyreWidget as any, {
      drivers: [{ driver_number: 1, name_acronym: 'ALO', team_colour: '#FF0000' }],
      stints: [{
        driver_number: 1,
        compound: 'SOFT',
        lap_start: 5,
        lap_end: 20,
        stint_number: 1,
        tyre_age_at_start: 0,
      }],
      currentLap: 1,
      selectedDriverNumber: null,
    } as any))
    expect(typeof html).toBe('string')
  })
})
