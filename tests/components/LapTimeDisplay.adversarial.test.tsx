import React from 'react'
import { renderToString } from 'react-dom/server'
import LapTimeDisplay from '../../components/LapTimeDisplay'
import type { ReplayFrame } from '../../lib/types'
import { describe, test, expect } from 'bun:test'

// Helper to render component to HTML string for assertion
const render = (frame: ReplayFrame | null, totalLaps: number, sessionStartTimestamp: number | null) => {
  // Cast to any to bypass TS strictness in test scenarios
  const props: any = {
    currentFrame: frame,
    totalLaps,
    sessionStartTimestamp,
  }
  // Use React server-side rendering for a lightweight assertion surface
  const element = React.createElement(LapTimeDisplay as any, props)
  return renderToString(element)
}

describe('LapTimeDisplay adversarial tests', () => {
  test('XSS-like input is not rendered as HTML (frame.lap injected)', () => {
    const frame = {
      timestamp: 1000,
      date: '2026-05-01',
      lap: '<script>alert(1)</script>' as any,
      driver_positions: [],
    } as unknown as ReplayFrame

    const html = render(frame, 10, 0)
    // Ensure no raw script tag is rendered
    expect(html).toContain('--') // Lap becomes placeholder due to NaN lap
    expect(html).not.toContain('<script')
  })

  test('Extremely large lap number renders without crash and shows value', () => {
    const frame = {
      timestamp: 1000,
      date: '2026-05-01',
      lap: 999999,
      driver_positions: [],
    } as unknown as ReplayFrame

    const html = render(frame, 100, 1)
    expect(html).toContain('999999')
    expect(html).toMatch(/width:\s*100%/) // progress bar capped at 100%
  })

  test('Negative values for timestamp and totalLaps render safely', () => {
    const frame = {
      timestamp: -100,
      date: '2026-05-01',
      lap: -3,
      driver_positions: [],
    } as unknown as ReplayFrame

    const html = render(frame, -5, 0)
    // Should display negative lap value and 0% progress due to constraint totalLaps > 0
    expect(html).toContain('-3')
    expect(html).toContain('0%')
  })

  test('NaN/undefined/null values for all props render placeholders', () => {
    const html = render(null, 0, null)
    expect(html).toContain('--')
    expect(html).toContain('--:--')
    expect(html).toContain('0%')
  })

  test('Very large elapsed time (overflow) shows a valid MM:SS-like string', () => {
    const frame = {
      timestamp: Number.MAX_SAFE_INTEGER,
      date: '2026-05-01',
      lap: 1,
      driver_positions: [],
    } as unknown as ReplayFrame

    const html = render(frame, 5, 1)
    // Expect a time string that contains a colon and digits
    const timeMatch = html.match(/\d+:[0-9]+/)
    expect(timeMatch).not.toBe(null)
  })

  test('Missing required ReplayFrame fields on mock do not crash', () => {
    const html = render(({} as unknown) as ReplayFrame, 4, 2)
    expect(html).toContain('0%') // progress should be safe
    expect(html).toContain('--:--')
  })

  test('Zero values on frame produce 0 and --:-- outputs', () => {
    const frame = {
      timestamp: 0,
      date: '2026-05-01',
      lap: 0,
      driver_positions: [],
    } as unknown as ReplayFrame

    const html = render(frame, 10, 0)
    expect(html).toContain('/')
    expect(html).toContain('--:--')
    expect(html).toContain('0%')
  })

  test('Session start after current frame timestamp yields negative elapsed -> --:--', () => {
    const frame = {
      timestamp: 1000,
      date: '2026-05-01',
      lap: 2,
      driver_positions: [],
    } as unknown as ReplayFrame

    const html = render(frame, 5, 5000)
    expect(html).toContain('2')
    expect(html).toContain('--:--')
  })
})
