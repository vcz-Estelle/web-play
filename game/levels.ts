import { LevelDef } from './types';

export const LEVELS: LevelDef[] = [
  // 1번째 여름 — 튜토리얼(되감기 없음, 구출 없음, 힌트 없음)
  {
    id: 0, summer: 1, label: '1번째 여름', member: null, rewindEnabled: false, hintCap: 0,
    rows: [
      '#########',
      '#P......#',
      '#.#####.#',
      '#......E#',
      '#########',
    ],
    hazards: [],
  },
  // 2번째 여름 — 은호
  {
    id: 1, summer: 2, label: '2번째 여름', member: 'eunho', rewindEnabled: true, hintCap: 8,
    rows: [
      '#########',
      '#P......#',
      '#.#.#.#.#',
      '#...M..E#',
      '#########',
    ],
    hazards: [
      { id: 'a', pos: { x: 5, y: 1 }, dir: 'left', kind: 'walker' },
      { id: 'b', pos: { x: 3, y: 3 }, dir: 'right', kind: 'walker' },
    ],
  },
  // 3번째 여름 — 예준
  {
    id: 2, summer: 3, label: '3번째 여름', member: 'yejun', rewindEnabled: true, hintCap: 9,
    rows: [
      '###########',
      '#P........#',
      '#.###.###.#',
      '#....M....#',
      '#.###.###.#',
      '#........E#',
      '###########',
    ],
    hazards: [
      { id: 'a', pos: { x: 5, y: 1 }, dir: 'down', kind: 'walker' },
      { id: 'b', pos: { x: 1, y: 3 }, dir: 'right', kind: 'walker' },
      { id: 'c', pos: { x: 9, y: 5 }, dir: 'up', kind: 'walker' },
    ],
  },
  // 4번째 여름 — 하민
  {
    id: 3, summer: 4, label: '4번째 여름', member: 'hamin', rewindEnabled: true, hintCap: 13,
    rows: [
      '###########',
      '#P........#',
      '#.#.###.#.#',
      '#...#M....#',
      '#.#.###.#.#',
      '#........E#',
      '###########',
    ],
    hazards: [
      { id: 'a', pos: { x: 7, y: 1 }, dir: 'left', kind: 'walker' },
      { id: 'b', pos: { x: 1, y: 5 }, dir: 'right', kind: 'walker' },
      { id: 'c', pos: { x: 9, y: 3 }, dir: 'up', kind: 'walker' },
      { id: 'd', pos: { x: 5, y: 1 }, dir: 'down', kind: 'walker' },
    ],
  },
  // 5번째 여름 — 노아
  {
    id: 4, summer: 5, label: '5번째 여름', member: 'noa', rewindEnabled: true, hintCap: 18,
    rows: [
      '#############',
      '#P..........#',
      '#.###.#.###.#',
      '#.....M.....#',
      '#.###.#.###.#',
      '#..........E#',
      '#############',
    ],
    hazards: [
      { id: 'a', pos: { x: 5, y: 1 }, dir: 'down', kind: 'walker' },
      { id: 'b', pos: { x: 7, y: 5 }, dir: 'up', kind: 'walker' },
      { id: 'c', pos: { x: 1, y: 3 }, dir: 'right', kind: 'walker' },
      { id: 'd', pos: { x: 11, y: 3 }, dir: 'left', kind: 'walker' },
      { id: 'e', pos: { x: 9, y: 1 }, dir: 'down', kind: 'walker' },
    ],
  },
  // 6번째 여름 — 밤비(최종)
  {
    id: 5, summer: 6, label: '6번째 여름', member: 'bambi', rewindEnabled: true, hintCap: 22,
    rows: [
      '#############',
      '#P..........#',
      '#.#.#.#.#.#.#',
      '#.....M.....#',
      '#.#.#.#.#.#.#',
      '#..........E#',
      '#############',
    ],
    hazards: [
      { id: 'a', pos: { x: 3, y: 1 }, dir: 'down', kind: 'walker' },
      { id: 'b', pos: { x: 5, y: 5 }, dir: 'up', kind: 'walker' },
      { id: 'c', pos: { x: 7, y: 1 }, dir: 'down', kind: 'walker' },
      { id: 'd', pos: { x: 9, y: 5 }, dir: 'up', kind: 'walker' },
      { id: 'e', pos: { x: 1, y: 3 }, dir: 'right', kind: 'walker' },
      { id: 'f', pos: { x: 11, y: 3 }, dir: 'left', kind: 'walker' },
    ],
  },
];
