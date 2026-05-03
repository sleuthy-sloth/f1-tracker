import { describe, test, expect, beforeAll } from 'bun:test';
import { readFile } from 'fs/promises';
import path from 'path';

describe('Neon glow tokens and utilities in app/globals.css', () => {
  let css: string = '';

  beforeAll(async () => {
    const cssPath = path.resolve(process.cwd(), 'app/globals.css');
    css = await readFile(cssPath, { encoding: 'utf8' });
  });

  test('3 neon glow custom properties exist', () => {
    expect(css).toContain('--neon-glow-cyan');
    expect(css).toContain('--neon-glow-yellow');
    expect(css).toContain('--neon-glow-green');
  });

  test('6 utility classes exist', () => {
    const patterns: RegExp[] = [
      /\.glow-cyan\s*{/,
      /\.glow-yellow\s*{/,
      /\.glow-green\s*{/,
      /\.text-glow-cyan\s*{/,
      /\.text-glow-yellow\s*{/,
      /\.text-glow-green\s*{/,
    ];
    for (const re of patterns) {
      expect(re.test(css)).toBe(true);
    }
  });

  test('--color-cyan-accent is set to #00D2BE', () => {
    expect(/--color-cyan-accent\s*:\s*#00D2BE\s*;/.test(css)).toBe(true);
  });

  test('@theme inline references color accent', () => {
    // Ensure theme inline section exists and references the color accent
    expect(/@theme\s+inline/i.test(css)).toBe(true);
    expect(/var\(--color-cyan-accent\)/.test(css)).toBe(true);
  });

  test('glow-red tokens preserved (no regression)', () => {
    // Ensure existing glow-red tokens remain
    expect(/\.glow-red\s*{/.test(css)).toBe(true);
    expect(/\.text-glow-red\s*{/.test(css)).toBe(true);
  });
});
