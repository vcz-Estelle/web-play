'use client';
import { useEffect, useState } from 'react';
import { playEnding } from '@/game/audio';
import { MEMBERS, RESCUE_ORDER } from '@/game/members';

const SIXTH_SUMMER_URL = 'https://youtu.be/c_yCRwh97M8?si=NhLtE7s9LyOY1gw2';
const TRANSITION_MS = 4000; // app/page.tsx 배경 그라데이션과 동일
const PETAL_COUNT = 24;

interface Petal { left: number; fallDur: number; delay: number; swayDur: number; size: number; }

export default function EndingScreen({ onRestart }: { onRestart: () => void }) {
  const [lit, setLit] = useState(false); // 흰→검 글씨, 검→#ffffcc 버튼
  const [petals, setPetals] = useState<Petal[]>([]);

  useEffect(() => {
    playEnding();
    // 꽃잎 파라미터(좌표/낙하·흔들림 속도/크기)를 effect에서 1회 랜덤 생성
    const generated: Petal[] = Array.from({ length: PETAL_COUNT }, () => ({
      left: Math.random() * 100,
      fallDur: 6 + Math.random() * 6, // 6~12s
      delay: -Math.random() * 12, // 음수: 시작부터 흩뿌려진 상태
      swayDur: 1.6 + Math.random() * 1.8, // 1.6~3.4s
      size: 9 + Math.random() * 8, // 9~17px
    }));
    const id = setTimeout(() => { setPetals(generated); setLit(true); }, 50);
    return () => clearTimeout(id);
  }, []);

  const textColor = lit ? '#000000' : '#ffffff';
  const btnBg = lit ? '#ffffcc' : '#000000';
  const colorTrans = `color ${TRANSITION_MS}ms ease`;

  return (
    <div
      className='relative flex flex-col items-center gap-5 text-center'
      style={{ color: textColor, opacity: lit ? 1 : 0, transition: `opacity 700ms ease, ${colorTrans}`, zIndex: 1 }}
    >
      {/* 바닥쪽으로 흩날리는 노란 꽃잎 (화면 전체 오버레이) */}
      <div aria-hidden className='pointer-events-none fixed inset-0 overflow-hidden' style={{ zIndex: 0 }}>
        {petals.map((p, i) => (
          <span
            key={i}
            className='petal'
            style={{
              '--x': `${p.left}%`,
              '--s': `${p.size}px`,
              '--fd': `${p.fallDur}s`,
              '--dl': `${p.delay}s`,
            } as React.CSSProperties}
          >
            <i style={{ '--sd': `${p.swayDur}s` } as React.CSSProperties} />
          </span>
        ))}
      </div>
      <h2 className='text-2xl font-extrabold'>그토록 바랬던</h2>
      <div className='flex gap-2 text-3xl'>
        {RESCUE_ORDER.map((id) => (
          <span key={id} title={MEMBERS[id].name}>
            {MEMBERS[id].animal}
          </span>
        ))}
      </div>
      <p style={{ opacity: 0.75 }}>어둠 속의 빛을 찾고 말았어</p>
      <a
        href={SIXTH_SUMMER_URL}
        target='_blank'
        rel='noreferrer'
        className='px-6 py-3 rounded-xl font-bold'
        style={{ background: btnBg, color: textColor, transition: `background ${TRANSITION_MS}ms ease, ${colorTrans}` }}
      >
        🏵️
      </a>
      <button
        onClick={onRestart}
        className='text-sm underline'
        style={{ color: textColor, opacity: 0.6, transition: colorTrans }}
      >
        처음부터 다시
      </button>
    </div>
  );
}
