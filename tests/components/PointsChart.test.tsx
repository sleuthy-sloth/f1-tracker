// @ts-nocheck
import React from 'react'
import { renderToString } from 'react-dom/server'
import PointsChart from '../../components/PointsChart'

describe('PointsChart', () => {
  test('Component existence', () => {
    expect(typeof PointsChart).toBe('function')
  })

  test('Empty series shows "No points data"', () => {
    const html = renderToString(React.createElement(PointsChart as any, { series: [] }))
    expect(html).toContain('No points data')
  })

  test('Renders chart with driver data', () => {
    const html = renderToString(React.createElement(PointsChart as any, {
      series: [
        { driverNumber: 1, nameAcronym: 'VER', teamColour: '#3671C6', data: [25, 43, 68] },
        { driverNumber: 16, nameAcronym: 'LEC', teamColour: '#E8002D', data: [18, 36, 54] },
      ],
    } as any))
    expect(html).toContain('VER')
    expect(html).toContain('LEC')
    expect(html).toContain('Points Progression')
  })
})
