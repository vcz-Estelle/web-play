'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { LEVELS } from '@/game/levels';
import { initState, applyAction } from '@/game/state';
import { render, HINT_COLORS } from '@/game/render';
import { keyToAction, swipeToAction } from '@/game/input';
import { solveNextAction } from '@/game/hint';
import { MEMBERS } from '@/game/members';
import { unlockAudio, playAlarm, playRescue, setMuted } from '@/game/audio';
import { GameState, MemberId, Dir } from '@/game/types';
import HUD from './HUD';

const MAX_CELL = 44;
const MIN_CELL = 24;
const FADE_OUT_MS = 4000;
const FADE_IN_MS = 1500;
const ENDING_DELAY_MS = 700; // 마지막 구출음 → (검은 페이드아웃) → 엔딩 화면 사이 간격

// 튜토리얼 진행형 안내(이동→질주→마커→음표→힌트→출구)
const TUT_MSGS = [
  '방향키 / WASD 로 한 칸씩 움직여봐.',
  '좋아! 이제 Shift + 방향 으로 벽까지 질주해봐.',
  '하얀 원 마커를 먹어봐.',
  '음표(♪)도 먹어봐. 힌트를 쓸 수 있게 돼.',
  'H 키나 ♪ 버튼으로 힌트! 노란색은 1칸 이동, 주황색은 질주 이동이야.',
  '이제 빛나는 구멍으로 들어가면 다음 스테이지로 갈 수 있어.',
];

// 화면 너비에 맞춰 셀 크기 산출(24~44px)
function computeCell(cols: number): number {
  const maxW = Math.min(window.innerWidth - 32, 640);
  return Math.min(MAX_CELL, Math.max(MIN_CELL, Math.floor(maxW / cols)));
}

export default function Game({ onAllCleared }: { onAllCleared: (members: MemberId[]) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [levelIdx, setLevelIdx] = useState(0);
  const stateRef = useRef<GameState>(initState(LEVELS[0]));
  const [, forceRender] = useState(0);
  const [rescued, setRescued] = useState<MemberId[]>([]);
  const [rewindCounts, setRewindCounts] = useState<Record<number, number>>({}); // 레벨별 이번 판 되감기 횟수(메모리)
  const [muted, setMutedState] = useState(false);
  const bankRef = useRef<{ banked: number; hintsUsed: number }>({ banked: 0, hintsUsed: 0 });
  const [hintAction, setHintAction] = useState<{ dir: Dir; type: 'move' | 'dash' } | null>(null);
  const [hintsAvailable, setHintsAvailable] = useState(0);
  const [hintNudge, setHintNudge] = useState(0);
  const [fading, setFading] = useState(false);
  const [cell, setCell] = useState(() => computeCell(LEVELS[0].rows[0].length));
  const [tutStep, setTutStep] = useState(0); // 0:이동 1:질주 2:목표 (앞으로만 진행)
  const [tutSkipped, setTutSkipped] = useState(false);
  const [toBlack, setToBlack] = useState(false); // 마지막 클리어 → 엔딩 전 검은 페이드아웃

  const draw = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const s = stateRef.current;
    const mColor = s.memberId ? MEMBERS[s.memberId].color : null;
    render(ctx, s, { cell, memberColor: mColor, hint: hintAction });
  }, [hintAction, cell]);

  // 레벨/화면 크기에 맞춰 셀 크기 재계산(모바일 대응)
  useEffect(() => {
    const cols = LEVELS[levelIdx].rows[0].length;
    const fit = () => setCell(computeCell(cols));
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [levelIdx]);

  const loadLevel = useCallback((idx: number) => {
    const next = initState(LEVELS[idx], { ...bankRef.current });
    stateRef.current = next;
    setHintAction(null);
    setHintsAvailable(next.collected - next.hintsUsed);
    setLevelIdx(idx);
  }, []);

  // 레벨/힌트 변경 및 매 입력(forceRender) 후 다시 그림
  useEffect(() => {
    draw();
  });

  const handleWin = useCallback(() => {
    const s = stateRef.current;
    const newRescued = s.memberId ? [...rescued, s.memberId] : rescued;
    if (s.memberId) { playRescue(MEMBERS[s.memberId].noteHz); setRescued(newRescued); }
    const next = levelIdx + 1;
    // 마지막 스테이지: 구출음 → 검은 페이드아웃 → 엔딩 화면(음 겹침 방지 + 부드러운 전환)
    if (next >= LEVELS.length) {
      setToBlack(true);
      setTimeout(() => onAllCleared(newRescued), ENDING_DELAY_MS);
      return;
    }
    bankRef.current = { banked: 0, hintsUsed: 0 };
    setTimeout(() => loadLevel(next), 700);
  }, [levelIdx, rescued, loadLevel, onAllCleared]);

  const handleDeath = useCallback(() => {
    const s = stateRef.current;
    // 죽음 → 페이드 아웃 → 리셋 → 페이드 인 (fading 토글이 리렌더를 보장해 캔버스 재드로 누락 방지)
    setFading(true);
    if (LEVELS[levelIdx].rewindEnabled) {
      const id = LEVELS[levelIdx].id;
      setRewindCounts((r) => ({ ...r, [id]: (r[id] ?? 0) + 1 }));
      bankRef.current = { banked: s.collected, hintsUsed: s.hintsUsed };
      playAlarm();
      setTimeout(() => { loadLevel(levelIdx); setFading(false); }, FADE_OUT_MS);
    } else {
      // 튜토리얼: 알람/기억 없이 페이드 후 리셋
      setTimeout(() => { loadLevel(levelIdx); setFading(false); }, FADE_OUT_MS);
    }
  }, [levelIdx, loadLevel]);

  const triggerHint = useCallback(() => {
    const s = stateRef.current;
    if (s.status !== 'playing') return;
    if (s.collected <= s.hintsUsed) { setHintNudge((n) => n + 1); return; } // 쓸 음표 없음 → 카운터 흔들기
    const solved = solveNextAction(s);
    if (!solved || solved.type === 'hint') return;
    const next = applyAction(s, { type: 'hint' });
    if (next === s) return; // 가용 힌트 없음
    stateRef.current = next;
    setHintAction({ dir: solved.dir, type: solved.type });
    setHintsAvailable(next.collected - next.hintsUsed);
    forceRender((n) => n + 1);
    if (LEVELS[levelIdx].member === null) setTutStep((st) => Math.max(st, 5)); // 튜토리얼: 힌트 사용 안내 단계
  }, [levelIdx]);

  const doAction = useCallback((action: ReturnType<typeof keyToAction>) => {
    if (!action) return;
    if (action.type === 'hint') { triggerHint(); return; }
    const s = stateRef.current;
    if (s.status !== 'playing') return;
    const next = applyAction(s, action);
    stateRef.current = next;
    setHintAction(null);
    setHintsAvailable(next.collected - next.hintsUsed);
    forceRender((n) => n + 1);
    // 튜토리얼 진행: 이동→1 질주→2 마커수집→3 음표수집→4 (힌트사용→5는 triggerHint에서)
    const moved = next.player.x !== s.player.x || next.player.y !== s.player.y;
    if (LEVELS[levelIdx].member === null) {
      if (next.collected > s.collected) setTutStep((st) => Math.max(st, 4));
      else if (next.rescued && !s.rescued) setTutStep((st) => Math.max(st, 3));
      else if (moved) setTutStep((st) => Math.max(st, action.type === 'dash' ? 2 : 1));
    }
    if (next.status === 'won') handleWin();
    else if (next.status === 'dead') handleDeath();
  }, [levelIdx, handleWin, handleDeath, triggerHint]);

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

  // 터치 스와이프 — 화면 전체(window)에서 동작: 상자 바깥에서 스와이프해도 방향 입력이 됨
  useEffect(() => {
    let sx = 0, sy = 0, tracking = false;
    const start = (e: TouchEvent) => {
      unlockAudio();
      const t = e.touches[0]; sx = t.clientX; sy = t.clientY; tracking = true;
    };
    // 스와이프 중 페이지 스크롤 차단(passive:false 필수). 탭(이동 없음)은 막지 않아 버튼 클릭 정상 동작
    const move = (e: TouchEvent) => { if (tracking) e.preventDefault(); };
    const end = (e: TouchEvent) => {
      if (!tracking) return;
      tracking = false;
      const t = e.changedTouches[0];
      doAction(swipeToAction(t.clientX - sx, t.clientY - sy, cell));
    };
    window.addEventListener('touchstart', start, { passive: true });
    window.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('touchend', end, { passive: true });
    return () => {
      window.removeEventListener('touchstart', start);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('touchend', end);
    };
  }, [doAction, cell]);

  const cols = LEVELS[levelIdx].rows[0].length;
  const rowsN = LEVELS[levelIdx].rows.length;

  return (
    <div className="flex flex-col items-center gap-3">
      {/* 마지막 클리어 시 화면 전체를 검은색으로 페이드아웃 */}
      <div
        className="fixed inset-0 bg-black pointer-events-none"
        style={{ opacity: toBlack ? 1 : 0, transition: `opacity ${ENDING_DELAY_MS}ms ease`, zIndex: 50 }}
      />
      <HUD
        rescued={rescued}
        rewinds={rewindCounts[LEVELS[levelIdx].id] ?? 0}
        muted={muted}
        onToggleMute={() => { const m = !muted; setMutedState(m); setMuted(m); }}
        hintsAvailable={hintsAvailable}
        onHint={triggerHint}
        hintNudge={hintNudge}
      />
      {/* 튜토리얼(멤버 없음) 진행형 온보딩 말풍선 */}
      {LEVELS[levelIdx].member === null && !tutSkipped && (
        <div className="relative max-w-md text-center text-sm">
          <div key={tutStep} className="rounded-2xl px-4 py-3 bg-white/95 text-[#16142a] shadow-lg leading-relaxed animate-[fadeIn_0.4s_ease]">
            <p>{TUT_MSGS[tutStep]}</p>
            <button onClick={() => setTutSkipped(true)} className="mt-2 text-xs text-[#16142a]/50 underline">
              튜토리얼 스킵
            </button>
          </div>
          {/* 말풍선 꼬리(아래쪽 보드를 가리킴) */}
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent" style={{ borderTopColor: 'rgba(255,255,255,0.95)' }} />
        </div>
      )}
      <canvas
        ref={canvasRef}
        width={cols * cell}
        height={rowsN * cell}
        className="rounded-xl border border-white/10 touch-none max-w-full"
        style={{ imageRendering: 'auto', opacity: fading ? 0 : 1, transition: `opacity ${fading ? FADE_OUT_MS : FADE_IN_MS}ms ease` }}
      />
      <p className="text-xs text-white/50">
        PC: 방향키/WASD <span style={{ color: HINT_COLORS.move }}>이동</span> · Shift+방향 <span style={{ color: HINT_COLORS.dash }}>질주</span> · H 힌트
        &nbsp;|&nbsp; 모바일: 스와이프(길게=<span style={{ color: HINT_COLORS.dash }}>질주</span>)
      </p>
    </div>
  );
}
