import { Action, Dir } from './types';

const KEY_DIR: Record<string, Dir> = {
  ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
  w: 'up', s: 'down', a: 'left', d: 'right', W: 'up', S: 'down', A: 'left', D: 'right',
};

// 키보드: 방향키/WASD = move, Shift+방향 = dash
export function keyToAction(e: KeyboardEvent): Action | null {
  const dir = KEY_DIR[e.key];
  if (!dir) return null;
  return { type: e.shiftKey ? 'dash' : 'move', dir };
}

// 터치/스와이프: 짧은 스와이프=move, 긴 스와이프(>2.2칸 거리)=dash
export function swipeToAction(dx: number, dy: number, cell: number): Action | null {
  const ax = Math.abs(dx), ay = Math.abs(dy);
  if (ax < 12 && ay < 12) return null; // 탭은 무시(또는 별도 처리)
  const dir: Dir = ax > ay ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
  const dist = Math.max(ax, ay);
  return { type: dist > cell * 2.2 ? 'dash' : 'move', dir };
}
