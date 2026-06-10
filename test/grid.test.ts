import { describe, it, expect } from 'vitest';
import { parseGrid, add, inBounds, isBlocked, DELTA } from '@/game/grid';

const rows = [
  '#####',
  '#P.*#',
  '#.#M#',
  '#..E#',
  '#####',
];

describe('parseGrid', () => {
  it('extracts player/exit/member/shards and grid', () => {
    const r = parseGrid(rows);
    expect(r.player).toEqual({ x: 1, y: 1 });
    expect(r.exit).toEqual({ x: 3, y: 3 });
    expect(r.member).toEqual({ x: 3, y: 2 });
    expect(r.shards).toEqual([{ x: 3, y: 1 }]);
    expect(r.grid[2][2]).toBe('wall');
    expect(r.grid[1][1]).toBe('empty'); // P 자리는 empty로
    expect(r.grid[3][3]).toBe('exit');
  });
});

describe('helpers', () => {
  it('add applies direction delta', () => {
    expect(add({ x: 1, y: 1 }, 'right')).toEqual({ x: 2, y: 1 });
    expect(add({ x: 1, y: 1 }, 'up')).toEqual({ x: 1, y: 0 });
  });
  it('inBounds checks grid extents', () => {
    const g = parseGrid(rows).grid;
    expect(inBounds(g, { x: 0, y: 0 })).toBe(true);
    expect(inBounds(g, { x: -1, y: 0 })).toBe(false);
    expect(inBounds(g, { x: 5, y: 0 })).toBe(false);
  });
  it('isBlocked true for wall and out of bounds', () => {
    const g = parseGrid(rows).grid;
    expect(isBlocked(g, { x: 0, y: 0 })).toBe(true);  // wall
    expect(isBlocked(g, { x: 2, y: 1 })).toBe(false); // empty
    expect(isBlocked(g, { x: -1, y: 1 })).toBe(true); // oob
    expect(isBlocked(g, { x: 3, y: 3 })).toBe(false); // exit는 통과 가능
  });
  it('DELTA has all four dirs', () => {
    expect(DELTA.up).toEqual({ x: 0, y: -1 });
  });
});
