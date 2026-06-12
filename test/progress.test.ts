import { describe, it, expect, beforeEach } from 'vitest';
import { createProgress } from '@/game/progress';

function memStorage(): Storage {
  const m = new Map<string, string>();
  return {
    getItem: (k) => (m.has(k) ? m.get(k)! : null),
    setItem: (k, v) => void m.set(k, v),
    removeItem: (k) => void m.delete(k),
    clear: () => m.clear(),
    key: () => null,
    length: 0,
  } as Storage;
}

describe('progress', () => {
  let p: ReturnType<typeof createProgress>;
  beforeEach(() => { p = createProgress(memStorage()); });

  it('records cleared summers', () => {
    expect(p.isCleared(1)).toBe(false);
    p.markCleared(1);
    expect(p.isCleared(1)).toBe(true);
  });

  it('tracks best tick (lower is better)', () => {
    p.recordBest(1, 30);
    p.recordBest(1, 25);
    p.recordBest(1, 40);
    expect(p.getBest(1)).toBe(25);
  });

  it('counts rewinds', () => {
    p.addDeath(1, { x: 1, y: 1 });
    p.addDeath(1, { x: 2, y: 1 });
    expect(p.rewinds(1)).toBe(2);
  });
});
