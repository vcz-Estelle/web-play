import { Action, Dir, GameState } from './types';
import { applyAction } from './state';

const DIRS: Dir[] = ['up', 'down', 'left', 'right'];

// 현재 상태에서 승리까지 BFS 최단 경로의 "첫 액션"을 반환. 없으면 null.
export function solveNextAction(start: GameState): Action | null {
  if (start.status !== 'playing') return null;

  const key = (s: GameState) =>
    `${s.player.x},${s.player.y},${s.tick},${s.rescued ? 1 : 0}`;
  const limit = start.tick + 120;

  const visited = new Set<string>([key(start)]);
  const queue: { state: GameState; first: Action | null }[] = [{ state: start, first: null }];
  let head = 0;

  while (head < queue.length) {
    const cur = queue[head++];
    if (cur.state.status === 'won') return cur.first;
    if (cur.state.tick >= limit) continue;

    for (const dir of DIRS) {
      for (const type of ['move', 'dash'] as const) {
        const action: Action = { type, dir };
        const next = applyAction(cur.state, action);
        if (next === cur.state) continue; // 막힘(동일 참조)
        if (next.status === 'dead') continue;
        // 제자리(이동 없음)인데 살아있는 상태는 의미 없음
        if (
          next.status === 'playing' &&
          next.player.x === cur.state.player.x &&
          next.player.y === cur.state.player.y
        ) continue;
        const k = key(next);
        if (visited.has(k)) continue;
        visited.add(k);
        queue.push({ state: next, first: cur.first ?? action });
      }
    }
  }
  return null;
}
