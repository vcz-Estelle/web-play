import { describe, it, expect } from 'vitest';
import { LEVELS } from '@/game/levels';
import { initState } from '@/game/state';
import { RESCUE_ORDER } from '@/game/members';

describe('LEVELS', () => {
  it('has 6 levels: tutorial + 5 rescues', () => {
    expect(LEVELS.length).toBe(6);
    expect(LEVELS[0].member).toBeNull();
    expect(LEVELS[0].rewindEnabled).toBe(false);
  });

  it('rescue levels map to members in order', () => {
    const members = LEVELS.slice(1).map((l) => l.member);
    expect(members).toEqual(RESCUE_ORDER);
    LEVELS.slice(1).forEach((l) => expect(l.rewindEnabled).toBe(true));
  });

  it('every level parses with player, exit, and (rescue) member', () => {
    LEVELS.forEach((l) => {
      const s = initState(l);
      expect(s.player).toBeDefined();
      expect(s.exit).toBeDefined();
      if (l.member) expect(s.member).not.toBeNull();
    });
  });

  it('each level has the expected hintCap', () => {
    expect(LEVELS.map((l) => l.hintCap)).toEqual([0, 8, 9, 13, 18, 22]);
  });
});
