import { Action, Dir, GameState, LevelDef, Vec } from './types';
import { parseGrid, add, isBlocked, eq } from './grid';
import { stepHazards } from './caligo';

export function initState(level: LevelDef, memoryDeaths: Vec[]): GameState {
  const p = parseGrid(level.rows);
  return {
    levelId: level.id,
    grid: p.grid,
    player: p.player,
    exit: p.exit,
    member: p.member,
    memberId: level.member,
    rescued: false,
    hazards: level.hazards.map((h) => ({ ...h, pos: { ...h.pos } })),
    shards: p.shards,
    collected: 0,
    tick: 0,
    status: 'playing',
    hintsUsed: 0,
    hintCap: level.hintCap,
    deaths: memoryDeaths.map((d) => ({ ...d })),
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
  // 샤드 수집
  let collected = s.collected;
  let shards = s.shards;
  if (shards.some((sh) => eq(sh, s.player))) {
    shards = shards.filter((sh) => !eq(sh, s.player));
    collected += 1;
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
  if (action.type === 'move') return moveOnce(s, action.dir);
  if (action.type === 'dash') return dash(s, action.dir);
  return s; // 'hint': 이후 작업에서 구현
}
