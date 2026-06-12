const K = {
  cleared: 'sixth:cleared',
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
    getBest(id: number): number | null {
      return readJSON<number | null>(K.best(id), null);
    },
    recordBest(id: number, tick: number): void {
      const cur = readJSON<number | null>(K.best(id), null);
      if (cur === null || tick < cur) storage.setItem(K.best(id), JSON.stringify(tick));
    },
  };
}
