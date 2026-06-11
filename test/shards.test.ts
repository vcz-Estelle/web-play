import { describe, it, expect } from 'vitest';
import { randInt, scatterShards } from '@/game/shards';
import { parseGrid } from '@/game/grid';
import { Vec } from '@/game/types';

// 결정적 rng: 미리 정한 0~1 값을 순서대로 반환
function seqRng(values: number[]): () => number {
  let i = 0;
  return () => values[i++ % values.length];
}

describe('randInt', () => {
  it('maps rng to inclusive [min,max]', () => {
    expect(randInt(1, 3, () => 0)).toBe(1);
    expect(randInt(1, 3, () => 0.99)).toBe(3);
    expect(randInt(1, 3, () => 0.5)).toBe(2);
  });
});

describe('scatterShards', () => {
  const { grid, player, exit, member } = parseGrid([
    '#####',
    '#P..#',
    '#..E#',
    '#####',
  ]);
  const occupied: Vec[] = [player, exit, ...(member ? [member] : [])];

  it('places exactly `count` shards on empty cells, avoiding occupied', () => {
    const res = scatterShards(grid, occupied, 2, seqRng([0, 0.5, 0.9, 0.2]));
    expect(res.length).toBe(2);
    for (const s of res) {
      expect(grid[s.y][s.x]).toBe('empty');
      expect(occupied.some((o) => o.x === s.x && o.y === s.y)).toBe(false);
    }
    // 중복 없음
    const keys = new Set(res.map((s) => `${s.x},${s.y}`));
    expect(keys.size).toBe(res.length);
  });

  it('caps at available empty cells when count exceeds them', () => {
    const res = scatterShards(grid, occupied, 99, () => 0);
    // 빈 칸(empty) 총 4칸 중 occupied(P,E) 제외 → 후보 max
    expect(res.length).toBeLessThanOrEqual(4);
    expect(res.length).toBeGreaterThan(0);
  });

  it('returns empty array for count <= 0', () => {
    expect(scatterShards(grid, occupied, 0, () => 0)).toEqual([]);
  });
});
