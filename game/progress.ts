import { Vec } from './types';

const K = {
  cleared: 'sixth:cleared',
  deaths: (id: number) => `sixth:deaths:${id}`,
  best: (id: number) => `sixth:best:${id}`,
};

export function createProgress(storage: Storage) {
  const readJSON = <T,>(k: string, fallback: T): T => {
    const raw = storage.getItem(k);
    if (!raw) return fallback;
    try { return JSON.parse(raw) as T; } catch { return fallback; }
  };

  return {
    isCleared(id: number): boolean {
      return readJSON<number[]>(K.cleared, []).includes(id);
    },
    markCleared(id: number): void {
      const set = new Set(readJSON<number[]>(K.cleared, []));
      set.add(id);
      storage.setItem(K.cleared, JSON.stringify([...set]));
    },
    addDeath(id: number, pos: Vec): void {
      const list = readJSON<Vec[]>(K.deaths(id), []);
      list.push(pos);
      storage.setItem(K.deaths(id), JSON.stringify(list));
    },
    rewinds(id: number): number {
      return readJSON<Vec[]>(K.deaths(id), []).length;
    },
    getBest(id: number): number | null {
      return readJSON<number | null>(K.best(id), null);
    },
    recordBest(id: number, tick: number): void {
      const cur = readJSON<number | null>(K.best(id), null);
      if (cur === null || tick < cur) storage.setItem(K.best(id), JSON.stringify(tick));
    },
  };
}
