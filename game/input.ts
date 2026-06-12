import { Action, Dir } from './types';

const KEY_DIR: Record<string, Dir> = {
  ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
  w: 'up', s: 'down', a: 'left', d: 'right', W: 'up', S: 'down', A: 'left', D: 'right',
};

// 물리 키 코드(e.code)는 한/영 IME와 무관 → 한글 모드에서도 작동
const CODE_DIR: Record<string, Dir> = {
  ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
  KeyW: 'up', KeyS: 'down', KeyA: 'left', KeyD: 'right',
};

// 키보드: 방향키/WASD = move, Shift+방향 = dash, h/H = hint
// e.code(물리 키)를 우선 보고, 없으면 e.key로 폴백 → 한글 입력 모드에서도 동일하게 동작
export function keyToAction(e: KeyboardEvent): Action | null {
  if (e.code === 'KeyH' || e.key === 'h' || e.key === 'H') return { type: 'hint' };
  const dir = CODE_DIR[e.code] ?? KEY_DIR[e.key];
  if (!dir) return null;
  return { type: e.shiftKey ? 'dash' : 'move', dir };
}

// 터치/스와이프: 짧은 스와이프=move(기본), 길게 끌면=dash
// 폰에선 스와이프가 길어지기 쉬워, dash 임계값을 넉넉히(셀*3, 최소 100px) 잡아 한 칸 이동이 기본이 되게 함
export function swipeToAction(dx: number, dy: number, cell: number): Action | null {
  const ax = Math.abs(dx), ay = Math.abs(dy);
  if (ax < 12 && ay < 12) return null; // 탭은 무시(또는 별도 처리)
  const dir: Dir = ax > ay ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
  const dist = Math.max(ax, ay);
  const dashDist = Math.max(cell * 3, 100);
  return { type: dist > dashDist ? 'dash' : 'move', dir };
}
