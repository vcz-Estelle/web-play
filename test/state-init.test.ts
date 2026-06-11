import { describe, it, expect } from 'vitest';
import { initState } from '@/game/state';
import { LevelDef } from '@/game/types';

const level: LevelDef = {
  id: 1, summer: 2, label: '2번째 여름', member: 'eunho', rewindEnabled: true, hintCap: 0,
  rows: ['#####', '#P.M#', '#..E#', '#####'],
  hazards: [{ id: 'h1', pos: { x: 2, y: 2 }, dir: 'left', kind: 'walker' }],
};

describe('initState', () => {
  it('builds playing state from level', () => {
    const s = initState(level, []);
    expect(s.status).toBe('playing');
    expect(s.player).toEqual({ x: 1, y: 1 });
    expect(s.member).toEqual({ x: 3, y: 1 });
    expect(s.memberId).toBe('eunho');
    expect(s.exit).toEqual({ x: 3, y: 2 });
    expect(s.rescued).toBe(false);
    expect(s.tick).toBe(0);
    expect(s.hazards.length).toBe(1);
  });
  it('seeds memory death markers', () => {
    const s = initState(level, [{ x: 2, y: 1 }]);
    expect(s.deaths).toEqual([{ x: 2, y: 1 }]);
  });
});
