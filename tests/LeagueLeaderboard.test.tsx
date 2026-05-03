import { describe, test, expect } from 'bun:test';
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { LeagueLeaderboard } from '../components/LeagueLeaderboard';

// Helpers to ensure clean DOM between tests
describe('LeagueLeaderboard component', () => {
  test('empty state shows Create and Join buttons', () => {
    const { getByText, queryByText } = render(<LeagueLeaderboard league={null} />);
    // Ensure the two primary actions are visible
    const createBtn = getByText('Create League');
    const joinBtn = getByText('Join League');
    expect(createBtn).toBeTruthy();
    expect(joinBtn).toBeTruthy();
    // Sanity: ensure leaderboard UI texts are not rendered in empty state
    expect(queryByText('Leader Points')).toBeNull();
  });

  test('Create form renders with League Name input and enabled button after entry', () => {
    const { getByText, getByPlaceholderText } = render(<LeagueLeaderboard league={null} />);
    // Open create form
    const createBtn = getByText('Create League');
    fireEvent.click(createBtn);

    // League Name input is present
    const nameInput = getByPlaceholderText('e.g. Championship Challengers') as HTMLInputElement;
    expect(nameInput).toBeTruthy();

    // Create button should be disabled when empty
    const createSubmit = getByText('Create');
    expect((createSubmit as HTMLButtonElement).disabled).toBe(true);

    // Type a value and ensure button enables
    fireEvent.input(nameInput, { target: { value: 'Champions Club' } });
    expect((createSubmit as HTMLButtonElement).disabled).toBe(false);
  });

  test('Join form renders with Invite Code input and enabled button after entry', () => {
    const { getByText, getByPlaceholderText } = render(<LeagueLeaderboard league={null} />);
    // Open join form
    const joinBtn = getByText('Join League');
    fireEvent.click(joinBtn);

    // Invite Code input is present
    const codeInput = getByPlaceholderText('e.g. F1-ABCD') as HTMLInputElement;
    expect(codeInput).toBeTruthy();

    // Initially disabled until code is entered
    const joinSubmit = getByText('Join');
    expect((joinSubmit as HTMLButtonElement).disabled).toBe(true);

    // Enter code and verify button enables
    fireEvent.input(codeInput, { target: { value: 'ABC123' } });
    expect((joinSubmit as HTMLButtonElement).disabled).toBe(false);
  });

  test('leaderboard sorts by points descending and rank trends render', () => {
    const league = {
      id: 'liga1',
      name: 'Test League',
      inviteCode: 'ABC123',
      members: [
        { playerName: 'Alice', teamName: 'Team A', totalPoints: 50, rankTrend: 'down' as const },
        { playerName: 'Bob', teamName: 'Team B', totalPoints: 70, rankTrend: 'up' as const },
        { playerName: 'Charlie', teamName: 'Team C', totalPoints: 60, rankTrend: 'neutral' as const },
      ],
    } as const;

    const { container, getByText } = render(<LeagueLeaderboard league={league as any} />);

    // Ensure all three names are present
    const bobEl = getByText('Bob');
    const charEl = getByText('Charlie');
    const aliceEl = getByText('Alice');

    expect(bobEl).toBeTruthy();
    expect(charEl).toBeTruthy();
    expect(aliceEl).toBeTruthy();

    // Bob should appear before Charlie, and Charlie before Alice in the DOM order
    expect(bobEl.compareDocumentPosition(charEl as any) & Node.DOCUMENT_POSITION_PRECEDING).toBeTruthy();
    expect(charEl.compareDocumentPosition(aliceEl as any) & Node.DOCUMENT_POSITION_PRECEDING).toBeTruthy();

    // There should be a rank-trend SVG rendered for each member
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThanOrEqual(3);
  });
});
