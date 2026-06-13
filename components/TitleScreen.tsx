'use client';
export default function TitleScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className='flex flex-col items-center gap-5 text-center max-w-md'>
      <h1 className='text-3xl font-extrabold tracking-tight'>Rewind - *h3 *t* S*mM3*</h1>
      <p className='text-white/70 leading-relaxed'>
        소나기가 내려오면,
        <br /> 이건 잠시뿐일 거야.
      </p>
      <button
        onClick={onStart}
        className='px-6 py-3 rounded-xl font-bold text-white'
        style={{ background: 'var(--accent)' }}
      >
        ▶ 너에게로
      </button>{' '}
    </div>
  );
}
