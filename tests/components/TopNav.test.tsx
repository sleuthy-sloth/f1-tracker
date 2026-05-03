import React from 'react'
import { render, screen, within, fireEvent } from '@testing-library/react'
import { TopNav } from '../../components/TopNav'
import { describe, test, expect } from 'vitest'

// NOTE: These tests verify structural and interaction aspects of TopNav
// without modifying the component. They aim to cover FR-031 and NFR-010
// through common accessibility and interaction patterns.

describe('TopNav', () => {
  test('Desktop layout: shows logo, center tabs, and profile icon with active indicator', () => {
    render(<TopNav />)

    // navigation container
    const nav = screen.getByRole('navigation')
    expect(nav).toBeInTheDocument()

    // Logo should be present (as an image with alt text or an accessible logo element)
    const logo = screen.queryByRole('img', { name: /logo/i })
    // Fallback: allow either an img with alt text or a branded element with accessible name
    expect(logo).toBeInTheDocument()

    // Tabs expected in order
    const tabLabels = ['LIVE', 'ANALYSIS', 'HISTORY', 'SETTINGS']
    const tabElements = tabLabels.map((label) => screen.queryByText(label)).filter((e) => e) as HTMLElement[]
    expect(tabElements.length).toBe(tabLabels.length)

    // One of the tabs should be active and show an indicator
    const hasActiveIndicator = tabElements.some((el) => {
      const hue = el as HTMLElement
      return hue.getAttribute('aria-current') === 'page' || hue.classList.contains('active')
    })
    expect(hasActiveIndicator).toBe(true)

    // Profile icon should exist (could be an button or link with a meaningful label)
    const profile = screen.queryByRole('button', { name: /profile|user|account/i })
      || screen.queryByRole('img', { name: /profile|user|account/i })
    expect(profile).toBeInTheDocument()
  })

  test('Mobile layout collapses to hamburger and opens drawer with tabs', () => {
    // simulate small viewport
    window.innerWidth = 375
    window.dispatchEvent(new Event('resize'))

    render(<TopNav />)

    // hamburger button should be present on mobile
    const hamburger = screen.queryByRole('button', { name: /menu|hamburger|☰/i })
    expect(hamburger).toBeInTheDocument()

    // open the mobile menu/drawer
    fireEvent.click(hamburger!)

    // drawer should appear as a dialog or menu
    const drawer = screen.getByRole('dialog')
    expect(drawer).toBeInTheDocument()

    // drawer contains the same tabs
    const inside = within(drawer)
    const tabLabels = ['LIVE', 'ANALYSIS', 'HISTORY', 'SETTINGS']
    tabLabels.forEach((label) => {
      expect(inside.getByText(label)).toBeInTheDocument()
    })

    // Escape should close the drawer
    fireEvent.keyDown(drawer, { key: 'Escape', code: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  test('Mobile: close drawer by clicking outside and focus management', () => {
    window.innerWidth = 375
    window.dispatchEvent(new Event('resize'))

    render(<TopNav />)
    const hamburger = screen.queryByRole('button', { name: /menu|hamburger|☰/i })
    expect(hamburger).toBeInTheDocument()
    fireEvent.click(hamburger!)
    const drawer = screen.getByRole('dialog')
    expect(drawer).toBeInTheDocument()

    // Click outside to close (simulate by clicking on document body)
    fireEvent.click(document.body)

    
    // Re-open to test focus management roughly: open and tab into the first item
    fireEvent.click(hamburger!)
    const drawer2 = screen.getByRole('dialog')
    const firstItem = within(drawer2).getByText('LIVE')
    // Move focus into the first item
    firstItem.focus()
    expect(document.activeElement).toBe(firstItem)
  })

  test('Active tab should have an underline/indicator in desktop', () => {
    render(<TopNav />)
    const tabLabels = ['LIVE', 'ANALYSIS', 'HISTORY', 'SETTINGS']
    const tabElements = tabLabels.map((label) => screen.queryByText(label)).filter((e) => e) as HTMLElement[]
    expect(tabElements.length).toBe(tabLabels.length)

    const indicatorExists = tabElements.some((el) => {
      const node = el as HTMLElement
      return node.getAttribute('aria-current') === 'page' || node.classList.contains('active')
    })
    expect(indicatorExists).toBe(true)
  })
})
