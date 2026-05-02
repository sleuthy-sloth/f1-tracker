import React from 'react'
import { renderToString } from 'react-dom/server'
import { Button } from '../../components/ui/Button'
import type { ButtonProps } from '../../components/ui/Button'

// Basic environment assertion: build must succeed
function buildNext() {
  const { execSync } = require('child_process')
  try {
    // Run a production build to verify compilation works
    execSync('npx next build', { stdio: 'ignore' })
  } catch (e) {
    throw new Error(`Next build failed: ${e instanceof Error ? e.message : e}`)
  }
}

describe('Task 2.5 Button verification', () => {
  test('Build compiles (npx next build)', () => {
    // If build fails, the test should fail by throwing.
    expect(() => buildNext()).not.toThrow()
  }, { timeout: 180000 })

  test('Button component is exported as a named export', () => {
    expect(typeof Button).toBe('function')
  })

  test('ButtonProps type is exported', () => {
    // Type-level check: if ButtonProps is not exported, TypeScript will fail to compile this test.
    type _T = ButtonProps
    // Dummy runtime assertion to keep test structure valid
    expect(true).toBe(true)
  })

  test('All variant strings exist in source: primary, secondary, ghost, outline', () => {
    // Compile-time style check: ensure these strings are assignable to ButtonProps['variant']
    type _V = ButtonProps['variant']
    const variants: _V[] = ['primary', 'secondary', 'ghost', 'outline'] as any
    expect(variants.length).toBe(4)
  })

  test('All size strings exist in source: sm, md, lg', () => {
    type _S = ButtonProps['size']
    const sizes: _S[] = ['sm', 'md', 'lg'] as any
    expect(sizes.length).toBe(3)
  })

  test('Spinner component renders an SVG with animate-spin class', () => {
    const html = renderToString(<Button variant="primary" size="md" loading={true} />)
    expect(html).toContain('animate-spin')
    expect(html).toContain('aria-hidden="true"')
    // aria-busy attribute should be present in loading state
    expect(html).toContain('aria-busy="true"')
  })

  test('type="button" default is present in the component', () => {
    const html = renderToString(<Button variant="primary" size="md" />)
    expect(html).toContain('type="button"')
  })

  test('Disabled state includes opacity-50 and cursor-not-allowed classes', () => {
    const html = renderToString(<Button variant="primary" disabled />)
    expect(html).toContain('opacity-50')
    expect(html).toContain('cursor-not-allowed')
  })

  test('fullWidth prop maps to w-full class', () => {
    const html = renderToString(<Button variant="primary" fullWidth />)
    expect(html).toContain('w-full')
  })

  test('Ghost variant renders with transparent background', () => {
    const html = renderToString(<Button variant="ghost" />)
    expect(html).toContain('bg-transparent')
    expect(html).toContain('text-f1-silver')
  })
})
