import { describe, it, expect } from 'vitest';
import { initState, applyAction } from '@/game/state';
import { LevelDef } from '@/game/types';

function lvl(rows: string[], hazards: LevelDef['hazards'] = []): LevelDef {
  return { id: 1, summer: 2, label: 't', member: 'eunho', rewindEnabled: true, hintCap: 0, rows, hazards };
}

describe('dash', () => {
  it('slides until wall, advancing a tick per cell', () => {
    const s = initState(lvl(['######', '#P...#', '######']));
    const n = applyAction(s, { type: 'dash', dir: 'right' });
    expect(n.player).toEqual({ x: 4, y: 1 }); // 벽(5) 전까지
    expect(n.tick).toBe(3);                    // 3칸 = 3틱
  });

  it('no-op if first cell blocked', () => {
    const s = initState(lvl(['###', '#P#', '###']));
    const n = applyAction(s, { type: 'dash', dir: 'right' });
    expect(n.player).toEqual({ x: 1, y: 1 });
    expect(n.tick).toBe(0);
  });

  it('stops mid-dash on death', () => {
    const s = initState(lvl(['######', '#P...#', '######'],
      [{ id: 'h', pos: { x: 4, y: 1 }, dir: 'left', kind: 'walker' }]));
    const n = applyAction(s, { type: 'dash', dir: 'right' });
    expect(n.status).toBe('dead');
  });
});
