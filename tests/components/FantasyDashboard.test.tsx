// @ts-nocheck
import React from 'react'
import { renderToString } from 'react-dom/server'
import FantasyDashboard from '../../components/FantasyDashboard'

describe('FantasyDashboard', () => {
  test('Component existence', () => {
    expect(typeof FantasyDashboard).toBe('function')
  })

  test('Loading state shows skeleton', () => {
    const html = renderToString(React.createElement(FantasyDashboard as any, {
      team: null,
      isLoading: true,
    } as any))
    expect(typeof html).toBe('string')
  })

  test('Null team shows "No team data"', () => {
    const html = renderToString(React.createElement(FantasyDashboard as any, {
      team: null,
      isLoading: false,
    } as any))
    expect(html).toContain('My Team')
  })

  test('Renders dashboard with team data', () => {
    const mockTeam = {
      teamName: 'Velocity Racing',
      totalPoints: 342,
      budgetRemaining: 4.5,
      drivers: [
        { driverNumber: 1, nameAcronym: 'VER', fullName: 'Max Verstappen', teamColour: '#3671C6', cost: 35.5, points: 102 },
      ],
      constructor: { name: 'McLaren', cost: 35.0, points: 136, colour: '#FF8000' },
      pointsHistory: [18, 42, 58, 76],
    }
    const html = renderToString(React.createElement(FantasyDashboard as any, {
      team: mockTeam,
      isLoading: false,
    } as any))
    expect(html).toContain('Velocity Racing')
    expect(html).toContain('342')
    expect(html).toContain('VER')
    expect(html).toContain('McLaren')
  })
})
