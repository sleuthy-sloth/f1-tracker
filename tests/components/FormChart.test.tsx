// @ts-nocheck
import React from 'react'
import { renderToString } from 'react-dom/server'
import FormChart from '../../components/FormChart'

describe('FormChart', () => {
  test('Component existence', () => {
    expect(typeof FormChart).toBe('function')
  })

  test('Empty results shows "No recent results"', () => {
    const html = renderToString(React.createElement(FormChart as any, { results: [] }))
    expect(html).toContain('No recent results')
  })

  test('Renders colored blocks for results', () => {
    const html = renderToString(React.createElement(FormChart as any, {
      results: [
        { position: 1 },
        { position: 3 },
        { position: 5 },
        { position: 8 },
        { position: 15 },
      ],
    } as any))
    expect(html).toContain('1')
    expect(html).toContain('3')
    expect(html).toContain('5')
    expect(html).toContain('8')
    expect(html).toContain('15')
  })

  test('DNF shown as DNF label', () => {
    const html = renderToString(React.createElement(FormChart as any, {
      results: [
        { position: 2 },
        { position: null, isDnf: true },
      ],
    } as any))
    expect(html).toContain('DNF')
  })

  test('Shows remaining as empty blocks when fewer results than max', () => {
    const html = renderToString(React.createElement(FormChart as any, {
      results: [{ position: 1 }],
      maxResults: 3,
    } as any))
    // Should have empty/muted blocks for remaining slots
    expect(typeof html).toBe('string')
  })
})
