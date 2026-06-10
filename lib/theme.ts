export type Theme = 'dark' | 'light';

const KEY = 'sixth:theme';

export function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  try {
    return window.localStorage.getItem(KEY) === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

export function applyTheme(t: Theme): void {
  if (typeof document === 'undefined') return;
  // 기본(다크)은 속성 제거, 라이트만 data-theme="light"
  if (t === 'light') document.documentElement.setAttribute('data-theme', 'light');
  else document.documentElement.removeAttribute('data-theme');
  try {
    window.localStorage.setItem(KEY, t);
  } catch {
    /* ignore */
  }
}
