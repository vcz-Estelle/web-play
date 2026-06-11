'use client';
import { MEMBERS, RESCUE_ORDER } from '@/game/members';
import { MemberId } from '@/game/types';

export default function HUD({ summer, rescued, rewinds, best, muted, onToggleMute }: {
  summer: number; rescued: MemberId[]; rewinds: number; best: number | null;
  muted: boolean; onToggleMute: () => void;
}) {
  return (
    <div className="w-full flex items-center justify-between gap-3 text-sm text-white/80">
      <span className="font-bold">{summer}번째 여름</span>
      <div className="flex gap-1.5">
        {RESCUE_ORDER.map((id) => (
          <span key={id} style={{ color: MEMBERS[id].color, opacity: rescued.includes(id) ? 1 : 0.22 }}
            className="text-lg" title={MEMBERS[id].name}>●</span>
        ))}
      </div>
      <span className="text-white/60">🔁 {rewinds} · ⏱ {best ?? '—'}</span>
      <button onClick={onToggleMute} className="px-2 py-1 rounded bg-white/10">
        {muted ? '🔇' : '🔊'}
      </button>
    </div>
  );
}
