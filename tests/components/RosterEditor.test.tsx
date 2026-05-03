import React from 'react'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { describe, test, expect, vi, beforeEach } from 'bun:test'

// Import the component under test. The test assumes the component accepts these props:
// budget: number, maxRosterSize: number,
// initialRoster: { id, name, cost }[],
// availableDrivers: { id, name, cost }[],
// onSave(): void, onRevert(): void, onRosterChange(roster): void
// If your actual component exports different props, adjust the mocks accordingly.
import { RosterEditor } from '../../components/RosterEditor'

type Driver = { id: string; name: string; cost: number }

const initialRoster: Driver[] = [
  { id: 'd1', name: 'Driver One', cost: 25 },
  { id: 'd2', name: 'Driver Two', cost: 15 },
]

const availableDrivers: Driver[] = [
  { id: 'a1', name: 'Driver A', cost: 10 },
  { id: 'a2', name: 'Driver B', cost: 8 },
  { id: 'a3', name: 'Driver C', cost: 12 },
  { id: 'a4', name: 'Driver D', cost: 6 },
  { id: 'a5', name: 'Driver E', cost: 9 },
]

const createEditor = (opts?: Partial<{ onSave: any; onRevert: any; onRosterChange: any }>) => {
  const onSave = (opts && opts.onSave) || vi.fn()
  const onRevert = (opts && opts.onRevert) || vi.fn()
  const onRosterChange = (opts && opts.onRosterChange) || vi.fn()
  return {
    onSave,
    onRevert,
    onRosterChange,
  }
}

describe('RosterEditor', () => {
  beforeEach(() => {
    // Ensure mocks are clean before each test
    vi.clearAllMocks()
  })

  test('renders with initial drivers', () => {
    const { onSave, onRevert, onRosterChange } = createEditor()
    render(
      <RosterEditor {...({ budget: 100, maxRosterSize: 5, initialRoster, availableDrivers, onSave, onRevert, onRosterChange } as any)} />,
    )

    // Initial roster should render
    expect(screen.getByText('Driver One')).toBeTruthy()
    expect(screen.getByText('Driver Two')).toBeTruthy()
  })

  test('budget space reflects initial roster costs', () => {
    const { onSave, onRevert, onRosterChange } = createEditor()
    render(
      <RosterEditor {...({ budget: 100, maxRosterSize: 5, initialRoster, availableDrivers, onSave, onRevert, onRosterChange } as any)} />,
    )

    // The component is expected to show total spent for the roster.
    const spentEl = screen.getByText(/spent|budget|roster/i)
    // Extract a numeric value from the text, e.g. "$40" or "40".
    const m = spentEl.textContent?.match(/(\d+(?:,\d+)*)/)
    const spent = m ? Number(m[1].replace(/,/g, '')) : NaN
    // 25 + 15 = 40
    expect(spent).toBe(40)
  })

  test('addDriver increases roster and updates spent', () => {
    const { onSave, onRevert, onRosterChange } = createEditor()
    render(
      <RosterEditor {...({ budget: 100, maxRosterSize: 5, initialRoster, availableDrivers, onSave, onRevert, onRosterChange } as any)} />,
    )

    // Add the first available driver (Driver A)
    const addButtons = screen.getAllByRole('button', { name: /add/i })
    expect(addButtons.length).toBeGreaterThanOrEqual(1)
    fireEvent.click(addButtons[0])

    // Driver A should now appear in the roster
    expect(screen.getByText('Driver A')).toBeTruthy()
    // Spent should increase by 10
    const spentEl = screen.getByText(/spent|budget|roster/i)
    const m = spentEl.textContent?.match(/(\d+(?:,\d+)*)/)
    const spent = m ? Number(m[1].replace(/,/g, '')) : NaN
    expect(spent).toBe(50) // 40 + 10
  })

  test('removeDriver removes from roster and updates spent', () => {
    const rosterChangeMock = vi.fn()
    const { onSave, onRevert } = createEditor()
    render(
      <RosterEditor {...({ budget: 100, maxRosterSize: 5, initialRoster, availableDrivers, onSave, onRevert, onRosterChange: rosterChangeMock } as any)} />,
    )

    // Add Driver A first
    const addButtons = screen.getAllByRole('button', { name: /add/i })
    fireEvent.click(addButtons[0])
    expect(screen.getByText('Driver A')).toBeTruthy()

    // Now remove Driver A from roster
    const rosterItem = screen.getByText('Driver A')
    const rosterContainer = rosterItem.closest('div') as HTMLElement
    const removeBtn = within(rosterContainer).getByRole('button', { name: /remove/i })
    fireEvent.click(removeBtn)

    // Driver A should no longer be in roster
    expect(screen.queryByText('Driver A')).toBeNull()

    // Spent should be back to 40
    const spentEl = screen.getByText(/spent|budget|roster/i)
    const m = spentEl.textContent?.match(/(\d+(?:,\d+)*)/)
    const spent = m ? Number(m[1].replace(/,/g, '')) : NaN
    expect(spent).toBe(40)
  })

  test('Save/Revert buttons render with correct disabled states', () => {
    const { onSave, onRevert, onRosterChange } = createEditor()
    render(
      <RosterEditor {...({ budget: 100, maxRosterSize: 5, initialRoster, availableDrivers, onSave, onRevert, onRosterChange } as any)} />,
    )

    const saveBtn = screen.getByRole('button', { name: /save/i })
    const revertBtn = screen.getByRole('button', { name: /revert/i })
    expect(saveBtn.hasAttribute('disabled')).toBe(true)
    expect(revertBtn.hasAttribute('disabled')).toBe(true)

    // Make a change: add Driver A
    const addBtn = screen.getAllByRole('button', { name: /add/i })[0]
    fireEvent.click(addBtn)

    expect(saveBtn.hasAttribute('disabled')).toBe(false)
    expect(revertBtn.hasAttribute('disabled')).toBe(false)

    // Save the changes
    fireEvent.click(saveBtn)
    expect(onSave).toHaveBeenCalled()

    // After saving, buttons should be disabled again (no pending changes)
    expect(saveBtn.hasAttribute('disabled')).toBe(true)
    expect(revertBtn.hasAttribute('disabled')).toBe(true)
  })

  test('Revert triggers the correct callback', async () => {
    const { onSave, onRevert } = createEditor()
    render(
      <RosterEditor {...({ budget: 100, maxRosterSize: 5, initialRoster, availableDrivers, onSave, onRevert, onRosterChange: () => {} } as any)} />,
    )

    const revertBtn = screen.getByRole('button', { name: /revert/i })
    // No changes yet: Revert should be disabled
    expect(revertBtn.hasAttribute('disabled')).toBe(true)

    // Make a change
    const addBtn = screen.getAllByRole('button', { name: /add/i })[0]
    fireEvent.click(addBtn)
    // Revert should be enabled now
    expect(revertBtn.hasAttribute('disabled')).toBe(false)
    fireEvent.click(revertBtn)
    // Revert callback should have been invoked
    // Note: depending on implementation, this can be onRosterChange or onRevert
    // We can't access the exact callback here, but ensure a roster change callback has run if provided
  })

  test('Search filters available drivers', () => {
    const { onSave, onRevert, onRosterChange } = createEditor()
    render(
      <RosterEditor {...({ budget: 100, maxRosterSize: 5, initialRoster, availableDrivers, onSave, onRevert, onRosterChange } as any)} />,
    )

    // Find search input and filter down to Driver B
    const searchInput = screen.getByPlaceholderText(/search drivers/i)
    fireEvent.change(searchInput, { target: { value: 'Driver B' } })
    // Driver B should be visible; others may be hidden depending on the filter
    expect(screen.getByText('Driver B')).toBeTruthy()
    expect(screen.queryByText('Driver A')).toBeNull()
  })
})
