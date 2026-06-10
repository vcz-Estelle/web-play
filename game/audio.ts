let ctx: AudioContext | null = null;
let muted = false;

export function setMuted(m: boolean) { muted = m; }
export function isMuted() { return muted; }

function ac(): AudioContext {
  if (!ctx) ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}
// 사용자 첫 입력에서 호출(자동재생 정책)
export function unlockAudio() { ac(); }

function piano(freq: number, start: number, dur: number, gain = 0.26) {
  if (muted) return;
  const c = ac(); const t = c.currentTime + start;
  const partials: [number, number][] = [[1, 1], [2, 0.5], [3, 0.27], [4, 0.15], [5, 0.08], [6, 0.045]];
  for (const [m, a] of partials) {
    const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = freq * m;
    const g = c.createGain(); const amp = gain * a; const d = dur / (1 + (m - 1) * 0.4);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(amp, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g); g.connect(c.destination);
    o.start(t); o.stop(t + d + 0.05);
  }
}

function beep(freq: number, start: number, dur: number, gain: number) {
  if (muted) return;
  const c = ac(); const o = c.createOscillator(); const g = c.createGain();
  o.type = 'square'; o.frequency.value = freq; o.connect(g); g.connect(c.destination);
  const t = c.currentTime + start;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.006);
  g.gain.setValueAtTime(gain, t + dur * 0.6);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.start(t); o.stop(t + dur + 0.02);
}

// 되감기 알람음(클래식 디지털 타이머)
export function playAlarm() {
  let t = 0;
  for (let r = 0; r < 2; r++) {
    beep(2093, t, 0.09, 0.16); beep(2093, t + 0.14, 0.09, 0.16); beep(2093, t + 0.28, 0.09, 0.16);
    t += 0.62;
  }
}

// 멤버 구출 단음
export function playRescue(noteHz: number) { piano(noteHz, 0, 1.4, 0.26); }

// 엔딩 멜로디: 솔# 파# 미 레# 미 파# 미 (200ms)
const ENDING = [415.30, 369.99, 329.63, 311.13, 329.63, 369.99, 329.63];
export function playEnding() {
  const gap = 0.2;
  ENDING.forEach((f, i) => piano(f, i * gap, i === ENDING.length - 1 ? 1.8 : 1.1, 0.26));
}
