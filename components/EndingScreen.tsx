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
      <h2 className='text-2xl font-extrabold'>여섯 번째 여름이 열렸다</h2>
      <div className='flex gap-2 text-3xl'>
        {RESCUE_ORDER.map((id) => (
          <span key={id} style={{ color: MEMBERS[id].color }}>
            ●
          </span>
        ))}
      </div>
      <p className='text-white/70'>다섯 번의 여름을 되감아, 모두를 되찾았다.</p>
      <a
        href={SIXTH_SUMMER_URL}
        target='_blank'
        rel='noreferrer'
        className='px-6 py-3 rounded-xl font-bold text-white'
        style={{ background: 'var(--accent)' }}
      >
        ▶ &apos;여섯 번째 여름&apos; 보러가기
      </a>
      <button onClick={onRestart} className='text-sm text-white/50 underline'>
        처음부터 다시
      </button>
    </div>
  );
}
