import { Dir, Vec, Grid, CellType } from './types';

export const DELTA: Record<Dir, Vec> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

export function add(p: Vec, dir: Dir): Vec {
  const d = DELTA[dir];
  return { x: p.x + d.x, y: p.y + d.y };
}

export function eq(a: Vec, b: Vec): boolean {
  return a.x === b.x && a.y === b.y;
}

export function inBounds(grid: Grid, p: Vec): boolean {
  return p.y >= 0 && p.y < grid.length && p.x >= 0 && p.x < grid[0].length;
}

export function isBlocked(grid: Grid, p: Vec): boolean {
  if (!inBounds(grid, p)) return true;
  return grid[p.y][p.x] === 'wall';
}

export interface ParsedMap {
  grid: Grid;
  player: Vec;
  exit: Vec;
  member: Vec | null;
  shards: Vec[];
}

export function parseGrid(rows: string[]): ParsedMap {
  const grid: Grid = [];
  let player: Vec = { x: 0, y: 0 };
  const exit: Vec = { x: 0, y: 0 };
  let member: Vec | null = null;
  const shards: Vec[] = [];

  rows.forEach((row, y) => {
    const line: CellType[] = [];
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      let cell: CellType = 'empty';
      if (ch === '#') cell = 'wall';
      else if (ch === 'E') cell = 'exit';
      else if (ch === 'P') player = { x, y };
      else if (ch === 'M') member = { x, y };
      else if (ch === '*') shards.push({ x, y });
      line.push(cell);
    }
    grid.push(line);
  });

  return { grid, player, exit: findExit(grid, exit), member, shards };
}

function findExit(grid: Grid, fallback: Vec): Vec {
  for (let y = 0; y < grid.length; y++)
    for (let x = 0; x < grid[y].length; x++)
      if (grid[y][x] === 'exit') return { x, y };
  return fallback;
}
