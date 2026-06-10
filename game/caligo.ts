import { Grid, Hazard, Dir } from './types';
import { add, isBlocked } from './grid';

const REVERSE: Record<Dir, Dir> = { up: 'down', down: 'up', left: 'right', right: 'left' };

export function stepHazards(hazards: Hazard[], grid: Grid): Hazard[] {
  const out: Hazard[] = [];
  for (const h of hazards) {
    const target = add(h.pos, h.dir);
    if (isBlocked(grid, target)) {
      if (h.kind === 'walker') {
        out.push({ ...h, dir: REVERSE[h.dir] }); // 제자리 반전
      }
      // bullet: 소멸(push 안 함)
    } else {
      out.push({ ...h, pos: target });
    }
  }
  return out;
}
