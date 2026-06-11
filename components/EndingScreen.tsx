'use client';
import { useEffect } from 'react';
import { playEnding } from '@/game/audio';
import { MEMBERS, RESCUE_ORDER } from '@/game/members';

const SIXTH_SUMMER_URL = 'https://youtu.be/c_yCRwh97M8?si=NhLtE7s9LyOY1gw2';

export default function EndingScreen({ onRestart }: { onRestart: () => void }) {
  useEffect(() => {
    playEnding();
  }, []);
  return (
    <div className='flex flex-col items-center gap-5 text-center'>
      <h2 className='text-2xl font-extrabold'>그토록 바랬던</h2>
      <div className='flex gap-2 text-3xl'>
        {RESCUE_ORDER.map((id) => (
          <span key={id} style={{ color: MEMBERS[id].color }}>
            ●
          </span>
        ))}
      </div>
      <p className='text-white/70'>어둠 속의 빛을 찾고 말았어</p>
      <a
        href={SIXTH_SUMMER_URL}
        target='_blank'
        rel='noreferrer'
        className='px-6 py-3 rounded-xl font-bold text-white'
        style={{ background: 'var(--accent)' }}
      >
        🏵️
      </a>
      <button onClick={onRestart} className='text-sm text-white/50 underline'>
        처음부터 다시
      </button>
    </div>
  );
}
