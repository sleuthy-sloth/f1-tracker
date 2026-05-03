import { describe, test, expect } from 'bun:test';
import { existsSync, readFileSync } from 'fs';
import path from 'path';

const svgPath = path.resolve('public/hex-pattern.svg');
const cssPath = path.resolve('app/globals.css');

describe('Hexagonal background pattern verification', () => {
  test('SVG exists and is a valid SVG with expected size (60x52) or viewBox equivalent', () => {
    expect(existsSync(svgPath)).toBe(true);
    const content = readFileSync(svgPath, 'utf8');
    // Basic SVG validity
    expect(/<svg[^>]*>/i.test(content)).toBe(true);
    expect(/<\/svg>/i.test(content)).toBe(true);

    // Size hints: width/height or viewBox with 60x52
    const hasExplicitSize = /width\s*=\s*(["']?60["']?)/i.test(content)
      || /height\s*=\s*(["']?52["']?)/i.test(content)
      || /viewBox\s*=\s*["']?0\s+0\s+60\s+52["']?/i.test(content);
    expect(hasExplicitSize).toBe(true);
  });

  test('SVG uses subtle stroke-opacity around 0.08', () => {
    const content = readFileSync(svgPath, 'utf8');
    const m = content.match(/stroke-opacity\s*=\s*["']?([0-9]*\.?[0-9]+)["']?/i);
    expect(m).not.toBeNull();
    if (m) {
      const val = parseFloat(m[1]);
      expect(val).toBeGreaterThanOrEqual(0.07);
      expect(val).toBeLessThanOrEqual(0.09);
    }
    // Ensure there is a shape primitive present to render the grid
    const hasShape = /<path\b|<line\b|<rect\b|<polygon\b/i.test(content);
    expect(hasShape).toBe(true);
  });

  test('CSS globals.css defines a two-layer background using hex-pattern.svg and center positioning', () => {
    expect(existsSync(cssPath)).toBe(true);
    const css = readFileSync(cssPath, 'utf8');

    // background-image should reference hex-pattern.svg and the second layer (var(--surface-dim))
    const bgImgMatch = css.match(/background-image\s*:\s*([^;]+);/i);
    expect(bgImgMatch).not.toBeNull();
    if (bgImgMatch) {
      const layers = bgImgMatch[1];
      expect(layers).toContain('hex-pattern.svg');
      expect(layers).toContain('var(--surface-dim)');
      // Should have two layers separated by a comma
      expect(layers.indexOf(',')).not.toBe(-1);
    }

    // background-size must specify 60px 52px for the first layer
    const bgSizeMatch = css.match(/background-size\s*:\s*([^;]+);/i);
    expect(bgSizeMatch).not.toBeNull();
    if (bgSizeMatch) {
      const firstSize = bgSizeMatch[1].split(',')[0].trim();
      expect(firstSize).toContain('60px 52px');
    }

    // background-position should use center for the pattern layer
    const bgPosMatch = css.match(/background-position\s*:\s*([^;]+);/i);
    expect(bgPosMatch).not.toBeNull();
    if (bgPosMatch) {
      const pos = bgPosMatch[1].toLowerCase();
      expect(pos).toContain('center');
    }
  });
});
