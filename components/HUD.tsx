'use client';
import { useEffect, useRef } from 'react';
import { MEMBERS, RESCUE_ORDER } from '@/game/members';
import { MemberId } from '@/game/types';

export default function HUD({ summer, rescued, rewinds, best, muted, onToggleMute, hintsAvailable, onHint, hintNudge }: {
  summer: number; rescued: MemberId[]; rewinds: number; best: number | null;
  muted: boolean; onToggleMute: () => void;
  hintsAvailable: number; onHint: () => void; hintNudge: number;
}) {
  const hintBtnRef = useRef<HTMLButtonElement>(null);

  // 음표 0개일 때 힌트 시도 시 카운터를 흔들어 "쓸 게 없음"을 알림
  useEffect(() => {
    if (hintNudge <= 0) return;
    hintBtnRef.current?.animate(
      [
        { transform: 'translateX(0)' },
        { transform: 'translateX(-4px)', color: '#ff6680' },
        { transform: 'translateX(4px)', color: '#ff6680' },
        { transform: 'translateX(-3px)' },
        { transform: 'translateX(0)' },
      ],
      { duration: 320, easing: 'ease-out' },
    );
  }, [hintNudge]);

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
      <button
        ref={hintBtnRef}
        onClick={onHint}
        disabled={hintsAvailable === 0}
        className="px-2 py-1 rounded bg-white/10 disabled:opacity-30"
        style={{ color: '#ffe27a' }}
        title="힌트: 다음 1수"
      >
        ♪ {hintsAvailable}
      </button>
      <button onClick={onToggleMute} className="px-2 py-1 rounded bg-white/10">
        {muted ? '🔇' : '🔊'}
      </button>
    </div>
  );
}
