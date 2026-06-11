import { describe, it, expect } from 'vitest';
import { solveNextAction } from '@/game/hint';
import { LEVELS } from '@/game/levels';
import { initState, applyAction } from '@/game/state';
import { GameState } from '@/game/types';

// 힌트를 끝까지 따라가며 클리어까지의 액션 수를 센다
function followHints(start: GameState): number | null {
  let s = start;
  let steps = 0;
  const LIMIT = 200;
  while (s.status === 'playing' && steps < LIMIT) {
    const a = solveNextAction(s);
    if (!a) return null;
    s = applyAction(s, a);
    steps++;
  }
  return s.status === 'won' ? steps : null;
}

describe('solveNextAction', () => {
  it('returns null when already won', () => {
    // 튜토리얼: 출구 한 칸 앞에서 대시로 즉시 클리어시켜 won 상태 확보
    let s = initState(LEVELS[0], []);
    s = applyAction(s, { type: 'dash', dir: 'down' });
    s = applyAction(s, { type: 'dash', dir: 'right' });
    expect(s.status).toBe('won');
    expect(solveNextAction(s)).toBeNull();
  });

  it('following hints clears each rescue level in exactly hintCap steps', () => {
    // 레벨 1~5(구출 스테이지). 튜토리얼(0)은 hintCap 의미 없음 → 별도 확인.
    for (let i = 1; i < LEVELS.length; i++) {
      const steps = followHints(initState(LEVELS[i], []));
      expect(steps, `${LEVELS[i].label}`).toBe(LEVELS[i].hintCap);
    }
  });

  it('tutorial is also solvable by following hints', () => {
    const steps = followHints(initState(LEVELS[0], []));
    expect(steps).not.toBeNull();
  });
});
