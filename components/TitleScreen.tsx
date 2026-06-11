'use client';
export default function TitleScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-col items-center gap-5 text-center max-w-md">
      <h1 className="text-3xl font-extrabold">여섯 번째 여름</h1>
      <p className="text-white/70 leading-relaxed">
        속도는 <b>얼마나 빠르냐</b>가 아니라 <b>시간을 누가 쥐고 있느냐</b>다.<br />
        내가 움직일 때만 시간이 흐른다. 칼리고를 피해 PLAVE를 구출하라.
      </p>
      <button onClick={onStart}
        className="px-6 py-3 rounded-xl font-bold text-white"
        style={{ background: 'var(--accent)' }}>
        ▶ 시작 (1번째 여름)
      </button>
      <p className="text-xs text-white/40">PLLI(팬)의 사랑이 시간을 되감는다</p>
    </div>
  );
}
