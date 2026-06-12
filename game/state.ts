import { Action, Dir, GameState, LevelDef, Vec } from './types';
import { parseGrid, add, isBlocked, eq } from './grid';
import { stepHazards } from './caligo';
import { randInt, scatterShards } from './shards';

export interface InitOpts {
  banked?: number;       // 이전 시도들에서 누적한 수집량
  hintsUsed?: number;    // 누적 힌트 사용량
  rng?: () => number;    // 테스트 결정성
}

export function initState(level: LevelDef, opts: InitOpts = {}): GameState {
  const p = parseGrid(level.rows);
  const collected = Math.min(opts.banked ?? 0, level.hintCap);
  const remaining = level.hintCap - collected;
  const occupied: Vec[] = [p.player, p.exit, ...(p.member ? [p.member] : []), ...level.hazards.map((h) => h.pos)];
  // 고정 음표(level.shards)가 있으면 그대로, 없으면 hintCap 잔여 한도 내 랜덤 스폰
  const shards = level.shards
    ? level.shards.map((v) => ({ ...v }))
    : scatterShards(p.grid, occupied, remaining > 0 ? Math.min(randInt(1, 3, opts.rng), remaining) : 0, opts.rng);
  return {
    levelId: level.id,
    grid: p.grid,
    player: p.player,
    exit: p.exit,
    member: p.member,
    memberId: level.member,
    rescued: false,
    hazards: level.hazards.map((h) => ({ ...h, pos: { ...h.pos } })),
    shards,
    collected,
    tick: 0,
    status: 'playing',
    hintsUsed: opts.hintsUsed ?? 0,
    hintCap: level.hintCap,
  };
}

function hazardAt(s: GameState, p: Vec): boolean {
  return s.hazards.some((h) => eq(h.pos, p));
}

function resolveAfterEnter(s: GameState): GameState {
  // 진입 직후(해저드 이동 전) 충돌
  if (hazardAt(s, s.player)) return { ...s, status: 'dead' };
  return s;
}

function resolveAfterHazards(s: GameState): GameState {
  if (hazardAt(s, s.player)) return { ...s, status: 'dead' };
  // 샤드 수집(cap 상한 클램프)
  let collected = s.collected;
  let shards = s.shards;
  if (shards.some((sh) => eq(sh, s.player))) {
    shards = shards.filter((sh) => !eq(sh, s.player));
    collected = Math.min(s.hintCap, collected + 1);
  }
  // 구출
  let rescued = s.rescued;
  if (s.member && eq(s.member, s.player)) rescued = true;
  // 승리: 튜토리얼(member null)은 출구 도달, 그 외엔 구출 후 출구
  let status = s.status;
  if (eq(s.player, s.exit) && (s.member === null || rescued)) status = 'won';
  return { ...s, collected, shards, rescued, status };
}

function moveOnce(s: GameState, dir: Dir): GameState {
  if (s.status !== 'playing') return s;
  const target = add(s.player, dir);
  if (isBlocked(s.grid, target)) return s; // 시간 정지(no-op)
  let next: GameState = { ...s, player: target, tick: s.tick + 1 };
  next = resolveAfterEnter(next);
  if (next.status === 'dead') return next;
  next = { ...next, hazards: stepHazards(next.hazards, next.grid) };
  next = resolveAfterHazards(next);
  return next;
}

function dash(s: GameState, dir: Dir): GameState {
  let cur = s;
  // 최소 1칸 시도. 막히면 no-op.
  while (cur.status === 'playing') {
    const next = moveOnce(cur, dir);
    if (next === cur) break;               // 막혀서 이동 없음
    if (next.player.x === cur.player.x && next.player.y === cur.player.y) break;
    cur = next;
    if (cur.status !== 'playing') break;   // dead/won이면 멈춤
  }
  return cur;
}

export function applyAction(s: GameState, action: Action): GameState {
  if (action.type === 'hint') {
    if (s.status === 'playing' && s.collected > s.hintsUsed) {
      return { ...s, hintsUsed: s.hintsUsed + 1 };
    }
    return s;
  }
  if (action.type === 'move') return moveOnce(s, action.dir);
  return dash(s, action.dir);
}
