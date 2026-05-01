import { describe, test, expect } from 'bun:test'
import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

const projectRoot = path.resolve(__dirname, '..')

function run(cmd: string, opts?: { cwd?: string, timeoutMs?: number }) {
  try {
    const cwd = opts?.cwd ?? projectRoot
    const out = execSync(cmd, { cwd, encoding: 'utf8' })
    return { success: true, stdout: out, stderr: '' }
  } catch (e: unknown) {
    const err = e as { stdout?: string; stderr?: string; message?: string };
    return { success: false, stdout: err.stdout ?? '', stderr: err.stderr ?? err.message ?? '' }
  }
}

describe('Task 2.2 verification tests', () => {
  test('App builds with npx next build', async () => {
    // Run a full production build to verify app compiles with the font/theme/favicon changes
    const result = run('npx next build')
    expect(result.success).toBe(true)
  }, { timeout: 600000 })

  test('layout.tsx uses font variables in html className', async () => {
    const layoutPath = path.join(projectRoot, 'app', 'layout.tsx')
    const content = fs.existsSync(layoutPath) ? fs.readFileSync(layoutPath, 'utf8') : ''
    expect(content.length).toBeGreaterThan(0)
    // Ensure font variables are referenced in the className
    // We expect both spaceGrotesk.variable and inter.variable to be present
    expect(content).toContain('spaceGrotesk.variable')
    expect(content).toContain('inter.variable')
  })

  test('globals.css contains dark carbon surface colors and F1 tokens', async () => {
    const cssPath = path.join(projectRoot, 'app', 'globals.css')
    const css = fs.existsSync(cssPath) ? fs.readFileSync(cssPath, 'utf8') : ''
    expect(css.length).toBeGreaterThan(0)

    // Surface color tokens should exist
    expect(css).toMatch(/--color-f1-red\s*:/) // ensure token exists in @theme or root
    expect(css).toMatch(/--color-f1-silver\s*:/)

    // Ensure surface colors are not bright greens (basic sanity check for dark carbon palette)
    const hexMatches = css.match(/#([0-9a-fA-F]{6})/g) || []
    const hasBrightGreen = hexMatches.some((v) => {
      const hex = v.toLowerCase()
      return ['#00ff00', '#32cd32', '#7fff00', '#00fa9a', '#7cfc00'].includes(hex)
    })
    expect(hasBrightGreen).toBe(false)
  })

  test('icon.svg is valid XML with an SVG root', async () => {
    const svgPath = path.join(projectRoot, 'app', 'icon.svg')
    const svg = fs.existsSync(svgPath) ? fs.readFileSync(svgPath, 'utf8') : ''
    expect(svg.length).toBeGreaterThan(0)
    // Basic XML validation: presence of opening and closing SVG tag
    expect(svg.includes('<svg')).toBe(true)
    expect(svg.includes('</svg>')).toBe(true)
  })

  test('layout.etsx does not exist', async () => {
    const etxsPath = path.join(projectRoot, 'app', 'layout.etsx')
    const exists = fs.existsSync(etxsPath)
    expect(exists).toBe(false)
  })
})
