import { describe, it, expect } from 'vitest';
import { initState, applyAction } from '@/game/state';
import { LevelDef } from '@/game/types';

function lvl(rows: string[], hazards: LevelDef['hazards'] = []): LevelDef {
  return { id: 1, summer: 2, label: 't', member: 'eunho', rewindEnabled: true, hintCap: 0, rows, hazards };
}

describe('move + STOP rule', () => {
  it('moves into empty and advances one tick', () => {
    const s = initState(lvl(['#####', '#P..#', '#####']));
    const n = applyAction(s, { type: 'move', dir: 'right' });
    expect(n.player).toEqual({ x: 2, y: 1 });
    expect(n.tick).toBe(1);
  });

  it('blocked by wall: no move, no tick (time frozen)', () => {
    const s = initState(lvl(['###', '#P#', '###']));
    const n = applyAction(s, { type: 'move', dir: 'right' });
    expect(n.player).toEqual({ x: 1, y: 1 });
    expect(n.tick).toBe(0);
  });

  it('hazards advance only when player moves', () => {
    const s = initState(lvl(['#####', '#P..#', '#####'],
      [{ id: 'h', pos: { x: 3, y: 1 }, dir: 'left', kind: 'walker' }]));
    const n = applyAction(s, { type: 'move', dir: 'right' });
    expect(n.hazards[0].pos).toEqual({ x: 2, y: 1 }); // 한 틱 이동
  });

  it('player moving into hazard cell dies', () => {
    const s2 = initState(lvl(['####', '#P.#', '####'],
      [{ id: 'h', pos: { x: 2, y: 1 }, dir: 'up', kind: 'walker' }]));
    const n = applyAction(s2, { type: 'move', dir: 'right' }); // (2,1) 해저드 칸으로
    expect(n.status).toBe('dead');
  });

  it('hazard moving onto player kills', () => {
    const s = initState(lvl(['#####', '#P..#', '#####'],
      [{ id: 'h', pos: { x: 3, y: 1 }, dir: 'left', kind: 'walker' }]));
    // 플레이어가 (2,1)로 이동하면 해저드도 (3,1)->(2,1)로 와서 충돌
    const n = applyAction(s, { type: 'move', dir: 'right' });
    expect(n.status).toBe('dead');
  });
});
