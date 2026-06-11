'use client';

import { useEffect, useState } from 'react';
import { getStoredTheme, applyTheme, type Theme } from '@/lib/theme';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const t = getStoredTheme();
    // 서버/첫 클라이언트 렌더는 항상 'dark'로 일치시켜 하이드레이션 불일치를 피하고,
    // 마운트 후 저장된 테마로 동기화한다(SSR에서 localStorage 접근 불가).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(t);
    applyTheme(t);
  }, []);

  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    applyTheme(next);
  };

  return (
    <button
      onClick={toggle}
      aria-label={theme === 'dark' ? '라이트 테마로 전환' : '다크 테마로 전환'}
      className="fixed top-3 right-3 z-50 rounded-lg px-2.5 py-1.5 text-sm"
      style={{ background: 'var(--panel)', border: '1px solid var(--panel-border)' }}
    >
      {theme === 'dark' ? '🌙' : '☀️'}
    </button>
  );
}
