import { describe, test, expect } from 'bun:test';
import fs from 'fs';
import path from 'path';

// Test: Verify TopNav replacement in app/layout.tsx without modifying the source.
describe('Layout TopNav replacement verification', () => {
  // Resolve project root relative to this test file
  const projectRoot = path.resolve(__dirname, '../../..');
  const layoutPath = path.join(projectRoot, 'app/layout.tsx');

  test('TopNav is imported and rendered', () => {
    const content = fs.readFileSync(layoutPath, 'utf8');
    // Imported TopNav
    expect(content).toContain('TopNav');
    // JSX rendering of TopNav
    expect(content).toMatch(/<\s*TopNav[^>]*>/);
  });

  test('SideNav is no longer imported', () => {
    const content = fs.readFileSync(layoutPath, 'utf8');
    // Ensure there is no SideNav import
    expect(content).not.toMatch(/import\s+.*SideNav/);
    // And no SideNav usage in JSX
    expect(content).not.toMatch(/<\s*SideNav/);
  });

  test('Main content uses pt-14 (mobile) and md:pt-16 (desktop)', () => {
    const content = fs.readFileSync(layoutPath, 'utf8');
    // A single className that includes both pt-14 and md:pt-16
    const hasCombinedClass = /className\s*=\s*["'][^"']*pt-14[^"']*md:pt-16[^"']*["']/.test(content);
    expect(hasCombinedClass).toBe(true);
  });

  test('Bottom padding pb-16 md:pb-0 preserved for MobileNav', () => {
    const content = fs.readFileSync(layoutPath, 'utf8');
    const hasMobileNavPadding = /className\s*=\s*["'][^"']*pb-16[^"']*md:pb-0[^"']*["']/.test(content);
    expect(hasMobileNavPadding).toBe(true);
  });

  test('SideNav.tsx file still exists (not deleted)', () => {
    const candidates = [
      path.join(projectRoot, 'app/SideNav.tsx'),
      path.join(projectRoot, 'src/SideNav.tsx'),
      path.join(projectRoot, 'components/SideNav.tsx'),
      path.join(projectRoot, 'app/components/SideNav.tsx'),
    ];
    const exists = candidates.some((p) => fs.existsSync(p));
    expect(exists).toBe(true);
  });

  test('MobileNav import and usage unchanged', () => {
    const content = fs.readFileSync(layoutPath, 'utf8');
    // MobileNav should still be imported and used
    expect(content).toContain('MobileNav');
    expect(content).toMatch(/<\s*MobileNav[^>]*>/);
  });
});
