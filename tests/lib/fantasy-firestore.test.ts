// @ts-nocheck
import { describe, test, expect, vi, beforeEach } from 'vitest';

// vi.mock is hoisted to top. Use vi.hoisted() to define mock implementations.
const { mockDoc, mockGetDoc, mockSetDoc, mockDeleteDoc, mockCollection, mockGetDocs, mockWhere, mockServerTimestamp } = vi.hoisted(() => {
  const md = vi.fn();
  const mgd = vi.fn();
  const msd = vi.fn();
  const mdd = vi.fn();
  const mc = vi.fn();
  const mgds = vi.fn();
  const mw = vi.fn();
  const mst = vi.fn(() => ({ seconds: 0, nanoseconds: 0 }));

  return {
    mockDoc: md,
    mockGetDoc: mgd,
    mockSetDoc: msd,
    mockDeleteDoc: mdd,
    mockCollection: mc,
    mockGetDocs: mgds,
    mockWhere: mw,
    mockServerTimestamp: mst,
  };
});

vi.mock('firebase/firestore', () => ({
  doc: mockDoc,
  getDoc: mockGetDoc,
  setDoc: mockSetDoc,
  deleteDoc: mockDeleteDoc,
  collection: mockCollection,
  query: (...args) => args,
  where: mockWhere,
  getDocs: mockGetDocs,
  serverTimestamp: mockServerTimestamp,
}));

vi.mock('../../lib/firebase', () => ({
  getFirebaseDb: () => ({}),
}));

import {
  generateInviteCode,
  saveFantasyTeam,
  loadFantasyTeam,
  deleteFantasyTeam,
  createLeague,
  joinLeague,
  leaveLeague,
  loadLeague,
  loadUserLeagues,
} from '../../lib/fantasy-firestore';

describe('Fantasy Firestore Persistence Service', () => {
  const uid1 = 'user-1';

  beforeEach(() => {
    vi.clearAllMocks();

    // Default: doc(path) returns mock doc reference
    mockDoc.mockImplementation((_db, ...pathSegments) => ({
      id: pathSegments[pathSegments.length - 1] || 'auto-id',
      path: pathSegments.join('/'),
    }));

    // getDoc: not found by default
    mockGetDoc.mockResolvedValue({
      exists: () => false,
      data: () => null,
      id: 'doc-id',
    });

    mockSetDoc.mockResolvedValue(undefined);
    mockDeleteDoc.mockResolvedValue(undefined);

    // getDocs: empty by default
    mockGetDocs.mockResolvedValue({
      empty: true,
      docs: [],
      forEach: () => {},
    });

    mockWhere.mockReturnValue({ field: 'inviteCode', op: '==', value: '' });
    mockCollection.mockImplementation((_db, name) => ({ id: 'col-auto', path: name }));
  });

  test('generateInviteCode format', () => {
    const code = generateInviteCode();
    expect(code).toMatch(/^FF-[A-Z0-9]{4}$/);
    expect(code.startsWith('FF-')).toBe(true);
    expect(code.length).toBe(7);
  });

  test('saveFantasyTeam writes via setDoc', async () => {
    const team = { teamName: 'Alpha', totalPoints: 0, budgetRemaining: 100, drivers: [], constructor: null, pointsHistory: [], uid: uid1, createdAt: null, updatedAt: null };
    await saveFantasyTeam(uid1, team);

    expect(mockDoc).toHaveBeenCalledWith(expect.anything(), 'fantasy-teams', uid1);
    expect(mockSetDoc).toHaveBeenCalledOnce();
    const callArgs = mockSetDoc.mock.calls[0][1];
    expect(callArgs).toMatchObject({
      teamName: 'Alpha',
      totalPoints: 0,
      uid: uid1,
    });
  });

  test('loadFantasyTeam returns null when doc does not exist', async () => {
    const result = await loadFantasyTeam(uid1);
    expect(result).toBeNull();
  });

  test('loadFantasyTeam returns parsed document when doc exists', async () => {
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      id: 'user-1',
      data: () => ({
        teamName: 'Speed Racers',
        totalPoints: 100,
        budgetRemaining: 25,
        drivers: [{ driverNumber: 1, nameAcronym: 'VER', fullName: 'Max Verstappen', teamColour: '#3671C6', cost: 35.5, points: 102 }],
        constructor: { name: 'McLaren', cost: 35, points: 136, colour: '#FF8000' },
        pointsHistory: [18, 42, 58],
        uid: uid1,
        createdAt: null,
        updatedAt: null,
      }),
    });
    const result = await loadFantasyTeam(uid1);
    expect(result).not.toBeNull();
    expect(result.teamName).toBe('Speed Racers');
    expect(result.totalPoints).toBe(100);
    expect(result.drivers).toHaveLength(1);
    expect(result.drivers[0].nameAcronym).toBe('VER');
  });

  test('deleteFantasyTeam calls deleteDoc', async () => {
    await deleteFantasyTeam(uid1);
    expect(mockDoc).toHaveBeenCalledWith(expect.anything(), 'fantasy-teams', uid1);
    expect(mockDeleteDoc).toHaveBeenCalledOnce();
  });

  test('createLeague creates a league doc with inviteCode and members', async () => {
    mockDoc.mockImplementation((_db, ...segments) => ({
      id: segments.length > 1 ? segments[segments.length - 1] : 'league-auto-id',
      path: segments.join('/'),
    }));

    mockGetDoc.mockResolvedValue({
      exists: () => true,
      id: 'league-auto-id',
      data: () => ({
        id: 'league-auto-id',
        name: 'Champions',
        inviteCode: 'FF-ABCD',
        members: [{ playerName: 'creator-1', teamName: 'Creator Team', totalPoints: 0, rankTrend: 'neutral' }],
        createdAt: null,
        createdBy: 'creator-1',
      }),
    });

    const leagueId = await createLeague('Champions', 'creator-1', 'Creator Team');
    expect(typeof leagueId).toBe('string');
    expect(mockSetDoc).toHaveBeenCalledOnce();
    expect(mockSetDoc.mock.calls[0][1]).toMatchObject({ name: 'Champions' });
    expect(mockSetDoc.mock.calls[0][1].inviteCode).toMatch(/^FF-[A-Z0-9]{4}$/);
    expect(mockSetDoc.mock.calls[0][1].createdBy).toBe('creator-1');
    expect(mockSetDoc.mock.calls[0][1].members).toHaveLength(1);
  });

  test('createLeague initial member has zero points', async () => {
    mockDoc.mockImplementation((_db, ...segments) => ({
      id: segments[segments.length - 1] || 'abc',
      path: segments.join('/'),
    }));

    await createLeague('Test League', 'u1', 'Team A');
    const member = mockSetDoc.mock.calls[0][1].members[0];
    expect(member.totalPoints).toBe(0);
    expect(member.rankTrend).toBe('neutral');
  });

  test('joinLeague queries by invite code and returns league id', async () => {
    const leagueId = 'league-xyz';
    mockDoc.mockImplementation((_db, col, id) => ({
      id: id || 'auto',
      path: `${col}/${id || 'auto'}`,
    }));

    // getDocs returns matching league
    mockGetDocs.mockResolvedValue({
      empty: false,
      docs: [{
        id: leagueId,
        data: () => ({
          id: leagueId,
          name: 'Joinable',
          inviteCode: 'FF-TEST',
          members: [{ playerName: 'creator', teamName: 'Original', totalPoints: 0, rankTrend: 'neutral' }],
        }),
      }],
      forEach: () => {},
    });

    const result = await joinLeague('FF-TEST', 'new-user', 'New Team');
    expect(result).toBe(leagueId);
    expect(mockWhere).toHaveBeenCalledWith('inviteCode', '==', 'FF-TEST');
  });

  test('joinLeague returns null for invalid invite code', async () => {
    const result = await joinLeague('FF-INVALID', 'user', 'Team');
    expect(result).toBeNull();
  });

  test('leaveLeague removes member from league', async () => {
    const leagueId = 'league-rm';
    mockDoc.mockImplementation((_db, col, id) => ({ id: id || leagueId, path: `${col}/${id || leagueId}` }));

    mockGetDoc.mockResolvedValue({
      exists: () => true,
      id: leagueId,
      data: () => ({
        members: [
          { playerName: 'owner', teamName: 'Owner', totalPoints: 10, rankTrend: 'neutral' },
          { playerName: 'leaver', teamName: 'Leaver', totalPoints: 5, rankTrend: 'up' },
        ],
      }),
    });

    await leaveLeague(leagueId, 'leaver');
    expect(mockSetDoc).toHaveBeenCalledOnce();
    const updatedMembers = mockSetDoc.mock.calls[0][1].members;
    expect(updatedMembers).toHaveLength(1);
    expect(updatedMembers[0].playerName).toBe('owner');
  });

  test('leaveLeague throws for non-existent league', async () => {
    await expect(leaveLeague('phantom', 'user')).rejects.toThrow('League not found');
  });

  test('loadLeague returns null when league does not exist', async () => {
    const result = await loadLeague('ghost');
    expect(result).toBeNull();
  });

  test('loadLeague returns parsed league document', async () => {
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      id: 'league-1',
      data: () => ({
        name: 'Test League',
        inviteCode: 'FF-ABCD',
        members: [{ playerName: 'u1', teamName: 'Team', totalPoints: 50, rankTrend: 'up' }],
        createdBy: 'u1',
        createdAt: null,
      }),
    });
    const result = await loadLeague('league-1');
    expect(result).not.toBeNull();
    expect(result.name).toBe('Test League');
    expect(result.members).toHaveLength(1);
  });

  test('loadUserLeagues returns leagues where user is a member', async () => {
    const userUid = 'target-user';

    mockGetDocs.mockResolvedValue({
      empty: false,
      docs: [
        {
          id: 'league-1',
          data: () => ({
            name: 'League One',
            inviteCode: 'FF-001',
            members: [{ playerName: userUid, teamName: 'My Team', totalPoints: 50, rankTrend: 'neutral' }],
            createdBy: 'someone',
          }),
        },
        {
          id: 'league-2',
          data: () => ({
            name: 'League Two',
            inviteCode: 'FF-002',
            members: [{ playerName: 'other-user', teamName: 'Other', totalPoints: 30, rankTrend: 'down' }],
            createdBy: 'someone-else',
          }),
        },
      ],
      forEach: (cb) => {
        cb({ id: 'league-1', data: () => ({ name: 'League One', inviteCode: 'FF-001', members: [{ playerName: userUid, teamName: 'My Team', totalPoints: 50, rankTrend: 'neutral' }], createdBy: 'someone' }) });
        cb({ id: 'league-2', data: () => ({ name: 'League Two', inviteCode: 'FF-002', members: [{ playerName: 'other-user', teamName: 'Other', totalPoints: 30, rankTrend: 'down' }], createdBy: 'someone-else' }) });
      },
    });

    const leagues = await loadUserLeagues(userUid);
    expect(leagues).toHaveLength(1);
    expect(leagues[0].id).toBe('league-1');
    expect(leagues[0].name).toBe('League One');
  });
});
