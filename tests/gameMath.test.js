import { describe, expect, it } from 'vitest';
import { shouldHit } from '../src/gameMath.js';

describe('shouldHit', () => {
  it('returns true when random number is below probability', () => {
    const hit = shouldHit(2, 6, () => 0.1);
    expect(hit).toBe(true);
  });

  it('returns false when random number is above probability', () => {
    const hit = shouldHit(1, 6, () => 0.5);
    expect(hit).toBe(false);
  });

  it('guards against invalid chamber counts', () => {
    const hit = shouldHit(1, 0, () => 0);
    expect(hit).toBe(false);
  });
});
