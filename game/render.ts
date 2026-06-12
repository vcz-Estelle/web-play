import { Dir, GameState } from './types';
import { MEMBERS } from './members';

// 힌트 색상: 한 칸 이동=노랑, 대쉬 이동=주황 (HUD 하단 안내 문구와 공유)
export const HINT_COLORS = { move: '#ffe27a', dash: '#ff9f43' } as const;

export interface RenderOpts {
  cell: number;
  memberColor: string | null;
  hint?: { dir: Dir; type: 'move' | 'dash' } | null;
}

const WALL_BASE = '#23203a';
const WALL_TINT = 0.25; // 멤버 색 반영 비율

// 벽 기본색에 멤버 고유색을 일부 섞어 레벨별로 다른 톤을 줌
function mixHex(base: string, accent: string, t: number): string {
  const b = parseInt(base.slice(1), 16);
  const a = parseInt(accent.slice(1), 16);
  const br = (b >> 16) & 255, bg = (b >> 8) & 255, bb = b & 255;
  const ar = (a >> 16) & 255, ag = (a >> 8) & 255, ab = a & 255;
  const r = Math.round(br + (ar - br) * t);
  const g = Math.round(bg + (ag - bg) * t);
  const bl = Math.round(bb + (ab - bb) * t);
  return `rgb(${r},${g},${bl})`;
}

export function render(ctx: CanvasRenderingContext2D, s: GameState, opts: RenderOpts) {
  const { cell } = opts;
  const w = s.grid[0].length * cell;
  const h = s.grid.length * cell;
  ctx.clearRect(0, 0, w, h);

  // 배경(칼리고 안개)
  ctx.fillStyle = '#0b0b14';
  ctx.fillRect(0, 0, w, h);

  // 격자/벽/출구
  const wallFill = opts.memberColor ? mixHex(WALL_BASE, opts.memberColor, WALL_TINT) : WALL_BASE;
  for (let y = 0; y < s.grid.length; y++) {
    for (let x = 0; x < s.grid[y].length; x++) {
      const t = s.grid[y][x];
      if (t === 'wall') {
        ctx.fillStyle = wallFill;
        ctx.fillRect(x * cell, y * cell, cell, cell);
      } else if (t === 'exit') {
        // 골 지점 = 빨려드는 구멍(웜홀): 시간선을 건너 멤버에게 닿는 '회귀'의 통로
        drawWormhole(ctx, x * cell + cell / 2, y * cell + cell / 2, cell * 0.42, opts.memberColor ?? '#7c5cff');
      } else {
        ctx.fillStyle = 'rgba(255,255,255,0.03)';
        ctx.fillRect(x * cell + 1, y * cell + 1, cell - 2, cell - 2);
      }
    }
  }

  // 스타샤드(음표)
  for (const sh of s.shards) {
    ctx.fillStyle = '#ffe27a';
    ctx.font = `${cell * 0.6}px system-ui`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('♪', sh.x * cell + cell / 2, sh.y * cell + cell / 2);
  }

  // 멤버(목표) — 멤버색이 없으면(튜토리얼) 흰 원 테두리 마커
  if (s.member && !s.rescued) {
    const mx = s.member.x * cell + cell / 2;
    const my = s.member.y * cell + cell / 2;
    const color = opts.memberColor ?? '#ffffff';
    const emoji = s.memberId ? MEMBERS[s.memberId].animal : undefined;
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = emoji ? 14 : 12;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(mx, my, cell * (emoji ? 0.34 : 0.3), 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    if (emoji) {
      ctx.font = `${cell * 0.5}px system-ui`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(emoji, mx, my);
    }
  }

  // 칼리고
  for (const hz of s.hazards) {
    ctx.fillStyle = hz.kind === 'bullet' ? '#ff6680' : '#3a2a55';
    const cx = hz.pos.x * cell + cell / 2;
    const cy = hz.pos.y * cell + cell / 2;
    ctx.beginPath();
    ctx.arc(cx, cy, cell * (hz.kind === 'bullet' ? 0.18 : 0.34), 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,80,120,0.6)';
    ctx.lineWidth = 2; ctx.stroke();
  }

  // 플레이어(PLLI = 사랑/스타샤드 빛)
  glowDot(ctx, s.player.x * cell + cell / 2, s.player.y * cell + cell / 2, cell * 0.28, '#ffffff');

  // 힌트 화살표(다음 1수: 한 칸=노랑, 대쉬=주황)
  if (opts.hint) {
    const arrow: Record<Dir, string> = { up: '↑', down: '↓', left: '←', right: '→' };
    const color = HINT_COLORS[opts.hint.type];
    const px = s.player.x * cell + cell / 2;
    const py = s.player.y * cell + cell / 2;
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = 16;
    ctx.fillStyle = color;
    ctx.font = `bold ${cell * 0.5}px system-ui`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(arrow[opts.hint.dir], px, py - cell * 0.5);
    ctx.restore();
  }
}

// 빨려드는 구멍(웜홀/사건의 지평선): 어두운 코어 → 멤버색 강착원반 링 → 바깥 글로우 falloff
function drawWormhole(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string) {
  ctx.save();
  // 코어로 빨려드는 방사형 그라데이션
  const g = ctx.createRadialGradient(cx, cy, r * 0.1, cx, cy, r);
  g.addColorStop(0, '#000000');
  g.addColorStop(0.55, '#000000');
  g.addColorStop(0.78, color);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  // 강착원반 링(멤버색 글로우)
  ctx.shadowColor = color;
  ctx.shadowBlur = 12;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.72, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function glowDot(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = 18;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
