import React from 'react';
import { render, screen } from '@testing-library/react';
import { GpCard } from '../../components/GpCard';

describe('GpCard redesign', () => {
  const baseProps = {
    meeting: { name: 'Tech GP' },
    circuitName: 'Circuit de Monaco',
    sessions: [{ id: 's1', target: true }],
    podium: [
      { position: 1, driver: 'Alice', team: 'Team A' },
      { position: 2, driver: 'Bob', team: 'Team B' }
    ],
  };

  test('exports as named export GpCard', () => {
    expect(typeof GpCard).toBe('function');
    expect(GpCard.name).toBe('GpCard');
  });

  test('card renders with cyan glow variant', () => {
    const props: any = baseProps;
    const { container } = render(<GpCard {...props} />);
    // Expect a cyan glow indicator via data attribute or class name
    const glowElem = container.querySelector('[data-glow="cyan"]') || container.querySelector('.glow-cyan');
    expect(glowElem).not.toBeNull();
  });

  test('renders circuit outline SVG', () => {
    const props: any = baseProps;
    const { container } = render(<GpCard {...props} />);
    // CircuitOutline is rendered as an SVG element
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
  });

  test('displays meeting and circuit names', () => {
    const props: any = baseProps;
    render(<GpCard {...props} />);
    expect(screen.getByText(/Tech GP/i)).toBeTruthy();
    expect(screen.getByText(/Circuit de Monaco/i)).toBeTruthy();
  });

  test('renders podium entries when provided', () => {
    const props: any = baseProps;
    render(<GpCard {...props} />);
    expect(screen.getByText(/Alice/i)).toBeTruthy();
    expect(screen.getByText(/Bob/i)).toBeTruthy();
  });

  test('renders cyan "VIEW FULL TELEMETRY" button when target session exists', () => {
    const props: any = baseProps;
    render(<GpCard {...props} />);
    const btn = screen.getByText(/VIEW FULL TELEMETRY/i);
    expect(btn).toBeTruthy();
  });
});
