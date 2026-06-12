import { describe, it, expect } from 'vitest';
import { initState, applyAction } from '@/game/state';
import { LevelDef } from '@/game/types';

const withMember: LevelDef = {
  id: 1, summer: 2, label: 't', member: 'eunho', rewindEnabled: true, hintCap: 0,
  rows: ['#####', '#PME#', '#####'], hazards: [],
};
const tutorial: LevelDef = {
  id: 0, summer: 1, label: '1번째 여름', member: null, rewindEnabled: false, hintCap: 0,
  rows: ['#####', '#P.E#', '#####'], hazards: [],
};

describe('rescue & win', () => {
  it('reaching exit before rescue does NOT win', () => {
    // P(1,1) M(2,1) E(3,1): 오른쪽 두 번이면 M 거쳐 E 도달
    let s = initState(withMember);
    s = applyAction(s, { type: 'move', dir: 'right' }); // (2,1) = member → rescued
    expect(s.rescued).toBe(true);
    s = applyAction(s, { type: 'move', dir: 'right' }); // (3,1) = exit
    expect(s.status).toBe('won');
  });

  it('tutorial wins by reaching exit (no member)', () => {
    let s = initState(tutorial);
    s = applyAction(s, { type: 'dash', dir: 'right' });
    expect(s.status).toBe('won');
  });
});
