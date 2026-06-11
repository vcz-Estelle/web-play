'use client';
import { useState } from 'react';
import TitleScreen from '@/components/TitleScreen';
import Game from '@/components/Game';
import EndingScreen from '@/components/EndingScreen';
import { unlockAudio } from '@/game/audio';

type Screen = 'title' | 'game' | 'ending';

export default function Home() {
  const [screen, setScreen] = useState<Screen>('title');
  return (
    <main className="flex flex-1 items-center justify-center p-4">
      <div
        className="w-full max-w-2xl rounded-2xl p-6 flex items-center justify-center"
        style={{ background: '#0b0b14', border: '1px solid rgba(255,255,255,0.08)' }}
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
