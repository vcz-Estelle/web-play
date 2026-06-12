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
  const [bg, setBg] = useState(DEFAULT_BG);

  useEffect(() => {
    const id = setTimeout(() => setBg(screen === 'ending' ? ENDING_BG : DEFAULT_BG), screen === 'ending' ? 50 : 0);
    return () => clearTimeout(id);
  }, [screen]);

  return (
    <main className="flex flex-1 items-center justify-center p-4">
      <div
        className="w-full max-w-2xl rounded-2xl p-6 flex items-center justify-center"
        style={{ background: bg, border: '1px solid rgba(255,255,255,0.08)', transition: `background ${ENDING_BG_TRANSITION_MS}ms ease` }}
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
