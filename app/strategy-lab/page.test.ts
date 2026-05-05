// Phase 2 verification tests: hide unloaded drivers + streaming overlay
// These tests focus on the pure filtering logic mimicking the useMemo
// used in app/strategy-lab/page.tsx to compute visibleDriverPositions

// @ts-nocheck
const { describe, test, expect } = require('bun:test')

type Position = {
  driverNumber: number
  // other fields are irrelevant for filtering logic in tests
  lat?: number
  lon?: number
}

type Frame = {
  positions: Position[]
}

// Pure helper that mimics the memoized filter in the component:
// show only positions whose driverNumber exists in loadedDriverNumbers
function filterVisibleDriverPositions(currentFrame: Frame | null, loadedDriverNumbers: Set<number>): Position[] {
  if (!currentFrame || !currentFrame.positions) return []
  return currentFrame.positions.filter((p) => loadedDriverNumbers.has(p.driverNumber))
}

// Streaming badge visibility logic: show when partially loaded (0 < size < total)
function isStreamingBadgeVisible(loadedDriverNumbers: Set<number>, totalDrivers: number): boolean {
  const count = loadedDriverNumbers.size
  return count > 0 && count < totalDrivers
}

describe('Phase 2: visibleDriverPositions filtering (pure logic)', () => {
  test('1. Empty Set: visibleDriverPositions is empty when no drivers loaded', () => {
    const frame: Frame = { positions: [
      { driverNumber: 1 },
      { driverNumber: 2 },
      { driverNumber: 3 },
    ]}
    const loaded = new Set<number>()
    const result = filterVisibleDriverPositions(frame, loaded)
    expect(result).toEqual([])
  })

  test('2. Filtering works: engine.currentFrame has 20 drivers, loadedDriverNumbers has 3 -> 3 visible', () => {
    const frame: Frame = { positions: Array.from({ length: 20 }, (_, i) => ({ driverNumber: i + 1 })) }
    const loaded = new Set<number>([5, 12, 19])
    const result = filterVisibleDriverPositions(frame, loaded)
    const numbers = result.map((p) => p.driverNumber)
    expect(numbers).toEqual([5, 12, 19])
  })

  test('3. Null frame: visibleDriverPositions returns empty array when currentFrame is null', () => {
    const loaded = new Set<number>([1, 2, 3])
    const result = filterVisibleDriverPositions(null, loaded)
    expect(result).toEqual([])
  })

  test('4. All loaded: visibleDriverPositions has all 20 when loadedDriverNumbers has all 20', () => {
    const frame: Frame = { positions: Array.from({ length: 20 }, (_, i) => ({ driverNumber: i + 1 })) }
    const loaded = new Set<number>(Array.from({ length: 20 }, (_, i) => i + 1))
    const result = filterVisibleDriverPositions(frame, loaded)
    const numbers = result.map((p) => p.driverNumber)
    expect(numbers).toEqual(Array.from({ length: 20 }, (_, i) => i + 1))
  })

  test('5. Set membership: only drivers in loadedDriverNumbers appear', () => {
    const frame: Frame = { positions: [
      { driverNumber: 1 }, { driverNumber: 2 }, { driverNumber: 3 }, { driverNumber: 4 }
    ]}
    const loaded = new Set<number>([2, 4])
    const result = filterVisibleDriverPositions(frame, loaded)
    const numbers = result.map((p) => p.driverNumber)
    expect(numbers).toEqual([2, 4])
  })
})

describe('Phase 2: streaming overlay badge visibility (pure logic)', () => {
  test('6. Streaming badge visible when partially loaded (3/10)', () => {
    const loaded = new Set<number>([1,2,3])
    const visible = isStreamingBadgeVisible(loaded, 10)
    expect(visible).toBe(true)
  })

  test('7. Streaming badge hidden when none loaded (0/10)', () => {
    const loaded = new Set<number>()
    const visible = isStreamingBadgeVisible(loaded, 10)
    expect(visible).toBe(false)
  })

  test('8. Streaming badge hidden when all loaded (10/10)', () => {
    const loaded = new Set<number>(Array.from({ length: 10 }, (_, i) => i + 1))
    const visible = isStreamingBadgeVisible(loaded, 10)
    expect(visible).toBe(false)
  })
})
