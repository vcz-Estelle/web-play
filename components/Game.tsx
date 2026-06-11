'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { LEVELS } from '@/game/levels';
import { initState, applyAction } from '@/game/state';
import { render } from '@/game/render';
import { keyToAction, swipeToAction } from '@/game/input';
import { solveNextAction } from '@/game/hint';
import { createProgress } from '@/game/progress';
import { MEMBERS } from '@/game/members';
import { unlockAudio, playAlarm, playRescue, setMuted } from '@/game/audio';
import { GameState, MemberId, Dir } from '@/game/types';
import HUD from './HUD';

const CELL = 44;

export default function Game({ onAllCleared }: { onAllCleared: (members: MemberId[]) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [prog] = useState(() => createProgress(window.localStorage));
  const [levelIdx, setLevelIdx] = useState(0);
  const stateRef = useRef<GameState>(initState(LEVELS[0], []));
  const [, forceRender] = useState(0);
  const [rescued, setRescued] = useState<MemberId[]>([]);
  const [muted, setMutedState] = useState(false);
  const bankRef = useRef<{ banked: number; hintsUsed: number }>({ banked: 0, hintsUsed: 0 });
  const [hintDir, setHintDir] = useState<Dir | null>(null);
  const [hintsAvailable, setHintsAvailable] = useState(0);
  const [hintNudge, setHintNudge] = useState(0);

  const draw = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const s = stateRef.current;
    const mColor = s.memberId ? MEMBERS[s.memberId].color : null;
    render(ctx, s, { cell: CELL, memberColor: mColor, hintDir });
  }, [hintDir]);

  const loadLevel = useCallback((idx: number) => {
    const deaths = LEVELS[idx].rewindEnabled ? prog.getDeaths(LEVELS[idx].id) : [];
    const next = initState(LEVELS[idx], deaths, { ...bankRef.current });
    stateRef.current = next;
    setHintDir(null);
    setHintsAvailable(next.collected - next.hintsUsed);
    setLevelIdx(idx);
  }, [prog]);

  // 레벨/힌트 변경 및 매 입력(forceRender) 후 다시 그림
  useEffect(() => {
    draw();
  });

  const handleWin = useCallback(() => {
    const s = stateRef.current;
    prog.markCleared(LEVELS[levelIdx].id);
    prog.recordBest(LEVELS[levelIdx].id, s.tick);
    const newRescued = s.memberId ? [...rescued, s.memberId] : rescued;
    if (s.memberId) { playRescue(MEMBERS[s.memberId].noteHz); setRescued(newRescued); }
    const next = levelIdx + 1;
    if (next >= LEVELS.length) { onAllCleared(newRescued); return; }
    bankRef.current = { banked: 0, hintsUsed: 0 };
    setTimeout(() => loadLevel(next), 700);
  }, [levelIdx, rescued, loadLevel, onAllCleared, prog]);

  const handleDeath = useCallback(() => {
    const s = stateRef.current;
    if (LEVELS[levelIdx].rewindEnabled) {
      prog.addDeath(LEVELS[levelIdx].id, s.player);
      bankRef.current = { banked: s.collected, hintsUsed: s.hintsUsed };
      playAlarm();
      setTimeout(() => loadLevel(levelIdx), 650);
    } else {
      // 튜토리얼: 그냥 리셋(기억/알람 없음)
      setTimeout(() => loadLevel(levelIdx), 300);
    }
  }, [levelIdx, loadLevel, prog]);

  const triggerHint = useCallback(() => {
    const s = stateRef.current;
    if (s.status !== 'playing') return;
    if (s.collected <= s.hintsUsed) { setHintNudge((n) => n + 1); return; } // 쓸 음표 없음 → 카운터 흔들기
    const solved = solveNextAction(s);
    if (!solved || solved.type === 'hint') return;
    const next = applyAction(s, { type: 'hint' });
    if (next === s) return; // 가용 힌트 없음
    stateRef.current = next;
    setHintDir(solved.dir);
    setHintsAvailable(next.collected - next.hintsUsed);
    forceRender((n) => n + 1);
  }, []);

  const doAction = useCallback((action: ReturnType<typeof keyToAction>) => {
    if (!action) return;
    if (action.type === 'hint') { triggerHint(); return; }
    const s = stateRef.current;
    if (s.status !== 'playing') return;
    const next = applyAction(s, action);
    stateRef.current = next;
    setHintDir(null);
    setHintsAvailable(next.collected - next.hintsUsed);
    forceRender((n) => n + 1);
    if (next.status === 'won') handleWin();
    else if (next.status === 'dead') handleDeath();
  }, [handleWin, handleDeath, triggerHint]);

  // 키보드
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      unlockAudio();
      const a = keyToAction(e);
      if (a) { e.preventDefault(); doAction(a); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [doAction]);

  // 터치 스와이프
  useEffect(() => {
    const el = canvasRef.current; if (!el) return;
    let sx = 0, sy = 0;
    const start = (e: TouchEvent) => { unlockAudio(); const t = e.touches[0]; sx = t.clientX; sy = t.clientY; };
    const end = (e: TouchEvent) => {
      const t = e.changedTouches[0];
      doAction(swipeToAction(t.clientX - sx, t.clientY - sy, CELL));
    };
    el.addEventListener('touchstart', start, { passive: true });
    el.addEventListener('touchend', end, { passive: true });
    return () => { el.removeEventListener('touchstart', start); el.removeEventListener('touchend', end); };
  }, [doAction]);

  const cols = LEVELS[levelIdx].rows[0].length;
  const rowsN = LEVELS[levelIdx].rows.length;

  return (
    <div className="flex flex-col items-center gap-3">
      <HUD
        summer={LEVELS[levelIdx].summer}
        rescued={rescued}
        rewinds={prog.rewinds(LEVELS[levelIdx].id)}
        best={prog.getBest(LEVELS[levelIdx].id)}
        muted={muted}
        onToggleMute={() => { const m = !muted; setMutedState(m); setMuted(m); }}
        hintsAvailable={hintsAvailable}
        onHint={triggerHint}
        hintNudge={hintNudge}
      />
      <canvas
        ref={canvasRef}
        width={cols * CELL}
        height={rowsN * CELL}
        className="rounded-xl border border-white/10 touch-none max-w-full"
        style={{ imageRendering: 'auto' }}
      />
      <p className="text-xs text-white/50">PC: 방향키/WASD 이동 · Shift+방향 질주 · H 힌트 &nbsp;|&nbsp; 모바일: 스와이프(길게=질주)</p>
    </div>
  );
}
