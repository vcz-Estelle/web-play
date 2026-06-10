import { describe, it, expect } from 'vitest';
import { parseGrid } from '@/game/grid';
import { stepHazards } from '@/game/caligo';
import { Hazard } from '@/game/types';

const grid = parseGrid([
  '#####',
  '#...#',
  '#...#',
  '#...#',
  '#####',
]).grid;

describe('stepHazards', () => {
  it('walker moves one cell in dir', () => {
    const h: Hazard[] = [{ id: 'a', pos: { x: 1, y: 1 }, dir: 'right', kind: 'walker' }];
    const next = stepHazards(h, grid);
    expect(next[0].pos).toEqual({ x: 2, y: 1 });
    expect(next[0].dir).toBe('right');
  });

  it('walker bounces at wall (reverse dir, stay)', () => {
    const h: Hazard[] = [{ id: 'a', pos: { x: 3, y: 1 }, dir: 'right', kind: 'walker' }];
    const next = stepHazards(h, grid);
    expect(next[0].pos).toEqual({ x: 3, y: 1 }); // 벽이라 제자리
    expect(next[0].dir).toBe('left');            // 반전
  });

  it('bullet despawns at wall', () => {
    const h: Hazard[] = [{ id: 'b', pos: { x: 3, y: 2 }, dir: 'right', kind: 'bullet' }];
    const next = stepHazards(h, grid);
    expect(next.length).toBe(0);
  });

  it('is pure (does not mutate input)', () => {
    const h: Hazard[] = [{ id: 'a', pos: { x: 1, y: 1 }, dir: 'right', kind: 'walker' }];
    stepHazards(h, grid);
    expect(h[0].pos).toEqual({ x: 1, y: 1 });
  });
});
