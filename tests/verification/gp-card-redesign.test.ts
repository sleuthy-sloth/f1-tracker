import { describe, test, expect, beforeAll } from 'bun:test';
import { readFile } from 'fs/promises';
import path from 'path';

describe('GpCard component static verification', () => {
  let content = '';

  beforeAll(async () => {
    const filePath = path.resolve(process.cwd(), 'components/GpCard.tsx');
    content = await readFile(filePath, { encoding: 'utf8' });
  });

  test('uses accent glow variant in Card', () => {
    expect(content).toContain('glow="accent"');
    expect(content).not.toContain('glow="cyan"');
  });

  test('uses Indigo hex for CircuitOutline', () => {
    expect(content).toContain('glowColor="#6366F1"');
    expect(content).not.toContain('glowColor="#00D2BE"');
  });

  test('uses accent background for CTA button', () => {
    expect(content).toContain('bg-accent');
    expect(content).toContain('shadow-[var(--glow-accent)]');
  });
});
