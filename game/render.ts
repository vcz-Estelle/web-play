import { GameState } from './types';

export interface RenderOpts { cell: number; memberColor: string | null; }

export function render(ctx: CanvasRenderingContext2D, s: GameState, opts: RenderOpts) {
  const { cell } = opts;
  const w = s.grid[0].length * cell;
  const h = s.grid.length * cell;
  ctx.clearRect(0, 0, w, h);

  // 배경(칼리고 안개)
  ctx.fillStyle = '#0b0b14';
  ctx.fillRect(0, 0, w, h);

  // 격자/벽/출구
  for (let y = 0; y < s.grid.length; y++) {
    for (let x = 0; x < s.grid[y].length; x++) {
      const t = s.grid[y][x];
      if (t === 'wall') {
        ctx.fillStyle = '#23203a';
        ctx.fillRect(x * cell, y * cell, cell, cell);
      } else if (t === 'exit') {
        ctx.strokeStyle = '#7c5cff';
        ctx.lineWidth = 3;
        ctx.strokeRect(x * cell + 4, y * cell + 4, cell - 8, cell - 8);
      } else {
        ctx.fillStyle = 'rgba(255,255,255,0.03)';
        ctx.fillRect(x * cell + 1, y * cell + 1, cell - 2, cell - 2);
      }
    }
  }

  // 기억 마커(과거 죽은 칸)
  for (const d of s.deaths) {
    ctx.fillStyle = 'rgba(150,150,170,0.35)';
    ctx.beginPath();
    ctx.arc(d.x * cell + cell / 2, d.y * cell + cell / 2, cell * 0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(200,200,220,0.5)';
    ctx.font = `${cell * 0.4}px system-ui`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('✕', d.x * cell + cell / 2, d.y * cell + cell / 2);
  }

  // 스타샤드
  for (const sh of s.shards) {
    ctx.fillStyle = '#ffe27a';
    ctx.font = `${cell * 0.6}px system-ui`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('✦', sh.x * cell + cell / 2, sh.y * cell + cell / 2);
  }

  // 멤버(목표)
  if (s.member && !s.rescued && opts.memberColor) {
    glowDot(ctx, s.member.x * cell + cell / 2, s.member.y * cell + cell / 2, cell * 0.32, opts.memberColor);
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
