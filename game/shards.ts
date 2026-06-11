import { Grid, Vec } from './types';

// rng() ∈ [0,1) → [min,max] 정수(양끝 포함)
export function randInt(min: number, max: number, rng: () => number = Math.random): number {
  return min + Math.floor(rng() * (max - min + 1));
}

// grid의 빈 칸 중 occupied와 겹치지 않는 칸에서 count개를 중복 없이 무작위 선택
export function scatterShards(
  grid: Grid,
  occupied: Vec[],
  count: number,
  rng: () => number = Math.random,
): Vec[] {
  if (count <= 0) return [];
  const blocked = new Set(occupied.map((o) => `${o.x},${o.y}`));
  const candidates: Vec[] = [];
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (grid[y][x] !== 'empty') continue;
      if (blocked.has(`${x},${y}`)) continue;
      candidates.push({ x, y });
    }
  }
  // Fisher–Yates 부분 셔플로 앞에서 count개 선택
  const n = Math.min(count, candidates.length);
  for (let i = 0; i < n; i++) {
    const j = i + Math.floor(rng() * (candidates.length - i));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }
  return candidates.slice(0, n).map((c) => ({ ...c }));
}
