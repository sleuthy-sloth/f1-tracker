// @ts-nocheck
import React from 'react'
import { renderToString } from 'react-dom/server'
import WeatherRadar from '../../components/WeatherRadar'

describe('WeatherRadar', () => {
  test('Component existence', () => {
    expect(typeof WeatherRadar).toBe('function')
  })

  test('Empty state: currentFrame is null shows "No race data"', () => {
    const html = renderToString(React.createElement(WeatherRadar as any, {
      currentFrame: null,
    } as any))
    expect(html).toContain('No race data')
  })

  test('Weather data not available when weather is undefined', () => {
    const html = renderToString(React.createElement(WeatherRadar as any, {
      currentFrame: { timestamp: 1000, date: '2026-01-01', lap: 1, driver_positions: [] },
    } as any))
    expect(html).toContain('Weather data not available')
  })

  test('Renders temperature values correctly', () => {
    const html = renderToString(React.createElement(WeatherRadar as any, {
      currentFrame: {
        timestamp: 1000,
        date: '2026-01-01',
        lap: 1,
        driver_positions: [],
        weather: {
          track_temperature: 42,
          air_temperature: 28,
          humidity: 65,
          rainfall: 0,
          wind_speed: 3.2,
          wind_direction: 180,
          pressure: 1013,
        },
      },
    } as any))
    expect(html).toContain('WEATHER')
    expect(html).toContain('42')
    expect(html).toContain('28')
    expect(html).toContain('65')
  })

  test('Renders dry condition for rainfall=0', () => {
    const html = renderToString(React.createElement(WeatherRadar as any, {
      currentFrame: {
        timestamp: 1000,
        date: '2026-01-01',
        lap: 1,
        driver_positions: [],
        weather: {
          track_temperature: 30,
          air_temperature: 22,
          humidity: 50,
          rainfall: 0,
          wind_speed: 2,
          wind_direction: 270,
        },
      },
    } as any))
    expect(html).toContain('DRY')
  })

  test('Renders precipitation for rainfall > 0', () => {
    const html = renderToString(React.createElement(WeatherRadar as any, {
      currentFrame: {
        timestamp: 1000,
        date: '2026-01-01',
        lap: 1,
        driver_positions: [],
        weather: {
          track_temperature: 25,
          air_temperature: 18,
          humidity: 80,
          rainfall: 35,
          wind_speed: 5,
          wind_direction: 90,
        },
      },
    } as any))
    expect(html).toContain('35')
  })

  test('Handles null weather fields gracefully', () => {
    const html = renderToString(React.createElement(WeatherRadar as any, {
      currentFrame: {
        timestamp: 1000,
        date: '2026-01-01',
        lap: 1,
        driver_positions: [],
        weather: {
          track_temperature: 30,
          air_temperature: 22,
          humidity: null,
          rainfall: 0,
          wind_speed: null,
          wind_direction: null,
          pressure: null,
        },
      },
    } as any))
    expect(typeof html).toBe('string')
  })
})
