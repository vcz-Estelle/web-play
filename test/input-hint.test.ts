import { describe, it, expect } from 'vitest';
import { keyToAction } from '@/game/input';

function ev(key: string, shift = false, code = ''): KeyboardEvent {
  return { key, shiftKey: shift, code } as KeyboardEvent;
}

describe('keyToAction hint', () => {
  it('maps h/H to hint action', () => {
    expect(keyToAction(ev('h'))).toEqual({ type: 'hint' });
    expect(keyToAction(ev('H'))).toEqual({ type: 'hint' });
  });
  it('maps physical KeyH to hint even under Korean IME (e.key=ㅎ/Process)', () => {
    expect(keyToAction(ev('ㅎ', false, 'KeyH'))).toEqual({ type: 'hint' });
    expect(keyToAction(ev('Process', false, 'KeyH'))).toEqual({ type: 'hint' });
  });
  it('maps physical WASD codes regardless of e.key (Korean IME)', () => {
    expect(keyToAction(ev('ㅈ', false, 'KeyW'))).toEqual({ type: 'move', dir: 'up' });
    expect(keyToAction(ev('ㄴ', true, 'KeyS'))).toEqual({ type: 'dash', dir: 'down' });
  });
  it('still maps arrows to move/dash', () => {
    expect(keyToAction(ev('ArrowUp', false, 'ArrowUp'))).toEqual({ type: 'move', dir: 'up' });
    expect(keyToAction(ev('ArrowUp', true, 'ArrowUp'))).toEqual({ type: 'dash', dir: 'up' });
  });
});
