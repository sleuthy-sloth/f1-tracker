import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, test, expect, beforeEach, afterEach, vi } from 'bun:test';

// Mock subcomponents to capture passed props
vi.mock('../../components/FilterSidebar', () => ({
  FilterSidebar: (props: any) => {
    ;(globalThis as any).__FILTER_SIDEBAR_PROPS__ = props;
    return React.createElement('div', { 'data-testid': 'FilterSidebar' }, null);
  }
}));

vi.mock('../../components/SeasonSelector', () => ({
  SeasonSelector: (props: any) => {
    ;(globalThis as any).__SEASON_SELECTOR_PROPS__ = props;
    return React.createElement('div', { 'data-testid': 'SeasonSelector' }, null);
  }
}));

vi.mock('../../components/ArchiveFilters', () => ({
  ArchiveFilters: (props: any) => {
    ;(globalThis as any).__ARCHIVE_FILTERS_PROPS__ = props;
    return React.createElement('div', { 'data-testid': 'ArchiveFilters' }, null);
  }
}));

// Import after mocks to ensure mocks are in effect
import { ArchiveClient } from '../../components/ArchiveClient';

describe('ArchiveClient layout (Archive page redesign)', () => {
  beforeEach(() => {
    // Clear any previous captured props
    (globalThis as any).__FILTER_SIDEBAR_PROPS__ = undefined;
    (globalThis as any).__SEASON_SELECTOR_PROPS__ = undefined;
    (globalThis as any).__ARCHIVE_FILTERS_PROPS__ = undefined;
  });

  test('ArchiveClient is exported, callable, and renders subcomponents with flex min-h-screen layout', () => {
    const props: any = {
      filters: [
        { id: 'gp', label: 'GP' },
        { id: 'weather', label: 'Weather' }
      ],
      hrefBase: '/archive',
      mobileFilterOpen: false
    };

    const { container } = render(React.createElement(ArchiveClient as any, { filters: props.filters, hrefBase: props.hrefBase, mobileFilterOpen: props.mobileFilterOpen }));

    // Layout container should use flex and min-h-screen
    const first = container.firstChild as HTMLElement;
    expect(first).toBeTruthy();
    const className = first.className || '';
    expect(className).toContain('flex');
    expect(className).toContain('min-h-screen');

    // Subcomponents should be rendered (via mocks)
    expect(screen.getByTestId('FilterSidebar')).toBeTruthy();
    expect(screen.getByTestId('SeasonSelector')).toBeTruthy();
    expect(screen.getByTestId('ArchiveFilters')).toBeTruthy();

    // Props passed to subcomponents should be captured
    expect((globalThis as any).__FILTER_SIDEBAR_PROPS__).toBeDefined();
    expect((globalThis as any).__FILTER_SIDEBAR_PROPS__.filters).toEqual(props.filters);
    expect((globalThis as any).__FILTER_SIDEBAR_PROPS__.mobileFilterOpen).toBe(props.mobileFilterOpen);

    expect((globalThis as any).__SEASON_SELECTOR_PROPS__).toBeDefined();
    expect((globalThis as any).__SEASON_SELECTOR_PROPS__.hrefBase).toBe(props.hrefBase);
  });

  test('ArchiveClient passes correct hrefBase to SeasonSelector and exposes ArchiveFilters', () => {
    const props: any = {
      filters: [{ id: 'gp', label: 'GP' }],
      hrefBase: '/archive',
      mobileFilterOpen: true
    };

    render(React.createElement(ArchiveClient as any, { filters: props.filters, hrefBase: props.hrefBase, mobileFilterOpen: props.mobileFilterOpen }));

    expect((globalThis as any).__SEASON_SELECTOR_PROPS__).toBeDefined();
    expect((globalThis as any).__SEASON_SELECTOR_PROPS__.hrefBase).toBe(props.hrefBase);
    // ArchiveFilters should have been rendered via the mock
    expect(screen.getByTestId('ArchiveFilters')).toBeTruthy();
  });
});
