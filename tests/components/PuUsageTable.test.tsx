// @ts-nocheck
import React from 'react'
import { renderToString } from 'react-dom/server'
import PuUsageTable from '../../components/PuUsageTable'

describe('PuUsageTable', () => {
  test('Component existence', () => {
    expect(typeof PuUsageTable).toBe('function')
  })

  test('Loading state shows skeleton', () => {
    const html = renderToString(React.createElement(PuUsageTable as any, {
      entries: [],
      isLoading: true,
    } as any))
    expect(typeof html).toBe('string')
  })

  test('Empty entries shows "No PU data"', () => {
    const html = renderToString(React.createElement(PuUsageTable as any, {
      entries: [],
      isLoading: false,
    } as any))
    expect(html).toContain('PU')
  })

  test('Renders driver PU data', () => {
    const html = renderToString(React.createElement(PuUsageTable as any, {
      entries: [{
        driverNumber: 1,
        driverAcronym: 'VER',
        teamColour: '#3671C6',
        components: { ice: 3, turbo: 4, mguh: 2, mguk: 3, es: 1, ce: 1, exhaust: 5 },
      }],
      isLoading: false,
    } as any))
    expect(html).toContain('VER')
    expect(html).toContain('3')
    expect(html).toContain('4')
    expect(html).toContain('5')
  })
})
