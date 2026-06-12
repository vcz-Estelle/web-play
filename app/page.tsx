'use client';
import { useEffect, useState } from 'react';
import TitleScreen from '@/components/TitleScreen';
import Game from '@/components/Game';
import EndingScreen from '@/components/EndingScreen';
import { unlockAudio } from '@/game/audio';

type Screen = 'title' | 'game' | 'ending';

const DEFAULT_BG = '#0b0b14';
const ENDING_BG = '#ADD8E6';
const ENDING_BG_TRANSITION_MS = 4000;

export default function Home() {
  const [screen, setScreen] = useState<Screen>('title');
  const [lit, setLit] = useState(false); // 엔딩 진입 후 그라데이션 점등

  useEffect(() => {
    const id = setTimeout(() => setLit(screen === 'ending'), screen === 'ending' ? 50 : 0);
    return () => clearTimeout(id);
  }, [screen]);

  const trans = `background ${ENDING_BG_TRANSITION_MS}ms ease, border-color ${ENDING_BG_TRANSITION_MS}ms ease`;

  return (
    <main
      className="flex flex-1 items-center justify-center p-4"
      style={{ background: lit ? ENDING_BG : DEFAULT_BG, transition: trans }}
    >
      <div
        className="w-full max-w-2xl rounded-2xl p-6 flex items-center justify-center"
        style={{
          background: lit ? 'transparent' : DEFAULT_BG,
          border: `1px solid rgba(255,255,255,${lit ? 0 : 0.08})`,
          transition: trans,
        }}
      >
        {screen === 'title' && (
          <TitleScreen onStart={() => { unlockAudio(); setScreen('game'); }} />
        )}
        {screen === 'game' && (
          <Game onAllCleared={() => setScreen('ending')} />
        )}
        {screen === 'ending' && (
          <EndingScreen onRestart={() => setScreen('title')} />
        )}
      </div>
    </main>
  );
}
