'use client';

import { useEffect, useState } from 'react';
import { getStoredTheme, applyTheme, type Theme } from '@/lib/theme';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const t = getStoredTheme();
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
