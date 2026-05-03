// @ts-nocheck
import React from 'react'
import { renderToString } from 'react-dom/server'
import SafetyCar from '../../components/SafetyCar'

describe('SafetyCar', () => {
  test('Component existence', () => {
    expect(typeof SafetyCar).toBe('function')
  })

  test('Empty state: currentFrame is null shows "No race data"', () => {
    const html = renderToString(React.createElement(SafetyCar as any, {
      currentFrame: null,
    } as any))
    expect(html).toContain('No race data')
  })

  test('Not deployed when safety_car is undefined', () => {
    const html = renderToString(React.createElement(SafetyCar as any, {
      currentFrame: { timestamp: 1000, date: '2026-01-01', lap: 1, driver_positions: [] },
    } as any))
    expect(html).toContain('Not deployed')
  })

  test('Not deployed when safety_car status is "none"', () => {
    const html = renderToString(React.createElement(SafetyCar as any, {
      currentFrame: {
        timestamp: 1000,
        date: '2026-01-01',
        lap: 1,
        driver_positions: [],
        safety_car: { status: 'none' },
      },
    } as any))
    expect(html).toContain('Not deployed')
  })

  test('Shows DEPLOYED when safety_car status is "deployed"', () => {
    const html = renderToString(React.createElement(SafetyCar as any, {
      currentFrame: {
        timestamp: 2000,
        date: '2026-01-01',
        lap: 5,
        driver_positions: [],
        safety_car: { status: 'deployed' },
      },
    } as any))
    expect(html).toContain('DEPLOYED')
  })

  test('Shows RETURNING when safety_car status is "returning"', () => {
    const html = renderToString(React.createElement(SafetyCar as any, {
      currentFrame: {
        timestamp: 3000,
        date: '2026-01-01',
        lap: 8,
        driver_positions: [],
        safety_car: { status: 'returning' },
      },
    } as any))
    expect(html).toContain('RETURNING')
  })
})
