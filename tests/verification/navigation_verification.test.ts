import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { describe, test, expect } from 'bun:test';

// Resolve repository root based on current file location
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const repoRoot = path.resolve(__dirname, '../../');

const sideNavPath = path.join(repoRoot, 'components', 'SideNav.tsx');
const mobileNavPath = path.join(repoRoot, 'components', 'MobileNav.tsx');
const layoutPath = path.join(repoRoot, 'app', 'layout.tsx');

function readCode(p: string): string {
  if (!existsSync(p)) {
    throw new Error(`Missing file for test: ${p}`);
  }
  return readFileSync(p, 'utf8');
}

describe('Navigation verification: Sidebar and Mobile navigation', () => {
  test('SideNav.tsx exports named function SideNav', () => {
    const code = readCode(sideNavPath);
    const ok = /export\s+(?:function|const)\s+SideNav\s*=|export\s+function\s+SideNav\s*\(/.test(code);
    expect(ok).toBe(true);
  });

  test('MobileNav.tsx exports named function MobileNav', () => {
    const code = readCode(mobileNavPath);
    const ok = /export\s+(?:function|const)\s+MobileNav\s*=|export\s+function\s+MobileNav\s*\(/.test(code);
    expect(ok).toBe(true);
  });

  test('SideNav.tsx contains isActive logic with usePathname and startsWith pattern', () => {
    const code = readCode(sideNavPath);
    // Active route detection using usePathname()
    expect(code).toMatch(/usePathname\s*\(/);
    // Pattern with adequacy: startsWith on href (href + "/" pattern appears in code)
    expect(code).toMatch(/startsWith\s*\(/);
  });

  test('MobileNav.tsx contains isActive logic with usePathname and startsWith pattern', () => {
    const code = readCode(mobileNavPath);
    expect(code).toMatch(/usePathname\s*\(/);
    expect(code).toMatch(/startsWith\s*\(/);
  });

  test('SideNav.tsx contains SECTORONE branding with F1 Red accent', () => {
    const code = readCode(sideNavPath);
    expect(code).toContain('SECTOR');
    expect(code).toContain('ONE');
    expect(code).toContain('text-f1-red');
  });

  test('SideNav.tsx contains all 5 nav item labels', () => {
    const code = readCode(sideNavPath);
    const labels = ['Archive', 'Strategy Lab', 'Standings', 'Fantasy', 'Settings'];
    for (const lab of labels) {
      expect(code).toContain(lab);
    }
  });

  test('MobileNav.tsx contains all 5 same nav item labels', () => {
    const code = readCode(mobileNavPath);
    const labels = ['Archive', 'Strategy Lab', 'Standings', 'Fantasy', 'Settings'];
    for (const lab of labels) {
      expect(code).toContain(lab);
    }
  });

  test('layout.tsx imports both SideNav and MobileNav from @/components/', () => {
    const code = readCode(layoutPath);
    expect(code).toMatch(/from\s+['\"]@\/components\/SideNav['\"]/);
    expect(code).toMatch(/from\s+['\"]@\/components\/MobileNav['\"]/);
  });

  test('layout.tsx main has md:ml-60 and pb-16 md:pb-0 classes', () => {
    const code = readCode(layoutPath);
    expect(code).toContain('md:ml-60');
    expect(code).toContain('pb-16');
    expect(code).toContain('md:pb-0');
  });
});

// Build verification: ensure project builds
test('Next.js build compiles', () => {
  // Run build in a separate process and ensure it exits successfully
  try {
    execSync('npx next build', { stdio: 'ignore', timeout: 120000 });
  } catch (e) {
    throw new Error(`Next.js build failed: ${e}`);
  }
}, { timeout: 180000 });
