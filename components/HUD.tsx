'use client';
import { useEffect, useRef } from 'react';
import { MEMBERS, RESCUE_ORDER } from '@/game/members';
import { MemberId } from '@/game/types';

export default function HUD({ rescued, rewinds, muted, onToggleMute, hintsAvailable, onHint, hintNudge }: {
  rescued: MemberId[]; rewinds: number;
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
      {/* 클리어(구출) 표시 — 가장 왼쪽 */}
      <div className="flex gap-1.5">
        {RESCUE_ORDER.map((id) => {
          const done = rescued.includes(id);
          // 구출 전 = 멤버색 점(흐림), 구출 후 = 악기 이모지로 클리어 표시
          return done ? (
            <span key={id} className="text-lg" title={MEMBERS[id].name}>{MEMBERS[id].instrument}</span>
          ) : (
            <span key={id} style={{ color: MEMBERS[id].color, opacity: 0.22 }}
              className="text-lg" title={MEMBERS[id].name}>●</span>
          );
        })}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-white/60">🔁 {rewinds}</span>
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
    </div>
  );
}
