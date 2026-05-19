import { describe, it, expect } from 'vitest';
import { generateGoboTexture } from './goboPatterns';

describe('generateGoboTexture', () => {
  it('returns a CanvasTexture for circle pattern', () => {
    const t = generateGoboTexture('circle');
    expect(t.image).toBeInstanceOf(HTMLCanvasElement);
    expect(t.image.width).toBe(256);
  });

  it('returns a CanvasTexture for all preset patterns', () => {
    for (const p of ['circle', 'star', 'grid', 'diamond', 'cross']) {
      const t = generateGoboTexture(p);
      expect(t.image).toBeInstanceOf(HTMLCanvasElement);
    }
  });

  it('falls back to circle for unknown pattern', () => {
    const t = generateGoboTexture('unknown');
    expect(t.image).toBeInstanceOf(HTMLCanvasElement);
  });
});
