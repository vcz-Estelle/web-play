import { describe, it, expect } from 'vitest';
import { initState, applyAction } from '@/game/state';
import { LevelDef } from '@/game/types';

// 한 칸 통로 + 샤드 cap 테스트용 레벨. hintCap=2.
function lvl(hintCap: number): LevelDef {
  return {
    id: 1, summer: 2, label: 't', member: 'eunho', rewindEnabled: true, hintCap,
    rows: ['######', '#P..E#', '######'], hazards: [],
  };
}

describe('initState shard scatter (opts)', () => {
  it('reflects banked into collected (clamped to cap) and hintsUsed', () => {
    const s = initState(lvl(2), { banked: 5, hintsUsed: 1, rng: () => 0 });
    expect(s.collected).toBe(2);   // cap=2로 클램프
    expect(s.hintsUsed).toBe(1);
  });

  it('scatters at most cap - banked shards', () => {
    const s = initState(lvl(2), { banked: 2, hintsUsed: 0, rng: () => 0 });
    expect(s.shards.length).toBe(0); // 남은량 0
  });

  it('scatters 1..3 shards when cap room available', () => {
    const s = initState(lvl(2), { banked: 0, hintsUsed: 0, rng: () => 0 });
    // randInt(1,3, ()=>0)=1 → min(1, cap-collected=2)=1
    expect(s.shards.length).toBe(1);
  });
});

describe('hint action transition', () => {
  it('increments hintsUsed when collected > hintsUsed, no tick change', () => {
    const base = initState(lvl(2), { banked: 2, hintsUsed: 0, rng: () => 0 });
    const n = applyAction(base, { type: 'hint' });
    expect(n.hintsUsed).toBe(1);
    expect(n.tick).toBe(base.tick);
    expect(n.shards).toBe(base.shards); // 보드 불변
  });

  it('is a no-op (same ref) when no hints available', () => {
    const base = initState(lvl(2), { banked: 0, hintsUsed: 0, rng: () => 0 });
    const n = applyAction(base, { type: 'hint' });
    expect(n).toBe(base);
  });
});

describe('shard collection clamps at cap', () => {
  it('walking over a shard never pushes collected past cap', () => {
    // banked=2(=cap) 이면 보드 샤드 0 → 수집 불가, collected 유지
    let s = initState(lvl(2), { banked: 2, hintsUsed: 0, rng: () => 0 });
    s = applyAction(s, { type: 'move', dir: 'right' });
    expect(s.collected).toBe(2);
  });
});
