// @ts-nocheck
import React from 'react'
import { renderToString } from 'react-dom/server'
import RaceControlFeed from '../../components/RaceControlFeed'

describe('RaceControlFeed', () => {
  test('Component existence', () => {
    expect(typeof RaceControlFeed).toBe('function')
  })

  test('Empty state: currentFrame is null shows "No race data"', () => {
    const html = renderToString(React.createElement(RaceControlFeed as any, {
      currentFrame: null,
    } as any))
    expect(html).toContain('No race data')
  })

  test('No messages when race_control_messages is undefined', () => {
    const html = renderToString(React.createElement(RaceControlFeed as any, {
      currentFrame: { timestamp: 1000, date: '2026-01-01', lap: 1, driver_positions: [] },
    } as any))
    expect(html).toContain('No race control messages')
  })

  test('Renders messages when provided', () => {
    const html = renderToString(React.createElement(RaceControlFeed as any, {
      currentFrame: {
        timestamp: 1000,
        date: '2026-01-01',
        lap: 1,
        driver_positions: [],
        race_control_messages: [
          { category: 'Flag', flag: 'GREEN', message: 'Track is green', lap_number: 1, date: '2026-01-01T00:00:00Z' },
          { category: 'SafetyCar', flag: 'SCD', message: 'Safety Car deployed', lap_number: 5, date: '2026-01-01T00:05:00Z' },
        ],
      },
    } as any))
    expect(html).toContain('Track is green')
    expect(html).toContain('Safety Car deployed')
    expect(html).toContain('RACE CONTROL')
  })

  test('Limits to maxMessages', () => {
    const messages = Array.from({ length: 10 }, (_, i) => ({
      category: 'Flag',
      flag: 'GREEN',
      message: `MSG_${i + 1}`,
      lap_number: i + 1,
      date: new Date(2026, 0, 1, 0, i).toISOString(),
    }))
    const html = renderToString(React.createElement(RaceControlFeed as any, {
      currentFrame: {
        timestamp: 1000,
        date: '2026-01-01',
        lap: 1,
        driver_positions: [],
        race_control_messages: messages,
      },
      maxMessages: 3,
    } as any))
    expect(html).toContain('MSG_10')
    expect(html).toContain('MSG_8')
    expect(html).not.toContain('MSG_2')
  })
})
