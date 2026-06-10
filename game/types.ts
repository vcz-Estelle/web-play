export type Dir = 'up' | 'down' | 'left' | 'right';
export type Vec = { x: number; y: number };
export type CellType = 'empty' | 'wall' | 'exit';
export type Grid = CellType[][]; // grid[y][x]

export type HazardKind = 'walker' | 'bullet';
export interface Hazard {
  id: string;
  pos: Vec;
  dir: Dir;
  kind: HazardKind; // walker: 벽에서 반사 / bullet: 벽에서 소멸
}

export type MemberId = 'eunho' | 'yejun' | 'hamin' | 'noa' | 'bambi';
export type GameStatus = 'playing' | 'dead' | 'won';

export interface LevelDef {
  id: number;          // 0..5
  summer: number;      // 1..6 (1=튜토리얼)
  label: string;       // "1번째 여름" 등
  member: MemberId | null; // 튜토리얼은 null
  rewindEnabled: boolean;  // 튜토리얼 false
  rows: string[];      // 맵 (아래 grid.ts 규칙)
  hazards: Hazard[];   // 초기 해저드
}

export interface GameState {
  levelId: number;
  grid: Grid;
  player: Vec;
  exit: Vec;
  member: Vec | null;
  memberId: MemberId | null;
  rescued: boolean;
  hazards: Hazard[];
  shards: Vec[];
  collected: number;
  tick: number;
  status: GameStatus;
  deaths: Vec[]; // 이번 스테이지 기억 마커(과거 죽은 칸)
}

export type Action =
  | { type: 'move'; dir: Dir }
  | { type: 'dash'; dir: Dir };
