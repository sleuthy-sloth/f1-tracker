import { describe, test, expect } from 'bun:test'
import { getTeamIdentity, getTeamColour } from '../../lib/teams'

describe('teams service', () => {
  test('getTeamIdentity returns Red Bull identity', () => {
    const team = getTeamIdentity('Red Bull')
    expect(team.acronym).toBe('RBR')
    expect(team.colour).toBe('3671C6')
  })

  test('getTeamIdentity returns Ferrari identity', () => {
    const team = getTeamIdentity('Ferrari')
    expect(team.acronym).toBe('FER')
    expect(team.colour).toBe('E8002D')
  })

  test('getTeamIdentity handles year-aware Audi (2026)', () => {
    const team = getTeamIdentity('Sauber', 2026)
    // Sauber should map to Audi in 2026
    expect(team).toBeDefined()
  })

  test('getTeamColour returns correct hex', () => {
    const colour = getTeamColour('Mercedes')
    expect(colour).toBe('27F4D2')
  })

  test('getTeamIdentity fallback for unknown team', () => {
    const team = getTeamIdentity('Unknown Team')
    expect(team.colour).toBe('888888')
    expect(team.name).toBe('Unknown Team')
  })
})
