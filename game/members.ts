import { MemberId } from './types';

export interface MemberMeta {
  id: MemberId;
  name: string;
  color: string;      // 점/글로우 색
  noteHz: number;     // 구출 단음(피아노)
  summer: number;     // 등장 여름
  animal: string;     // 원안(구출 전) 마커 이모지
  instrument: string; // 클리어(구출 후) 표시 이모지
}

export const MEMBERS: Record<MemberId, MemberMeta> = {
  eunho: { id: 'eunho', name: '은호', color: '#ff4d4d', noteHz: 415.30, summer: 2, animal: '🐺', instrument: '🥁' }, // 솔# G#4 늑대→드럼
  yejun: { id: 'yejun', name: '예준', color: '#4aa3ff', noteHz: 369.99, summer: 3, animal: '🐬', instrument: '🎤' }, // 파# F#4 돌고래→마이크
  hamin: { id: 'hamin', name: '하민', color: '#4ade80', noteHz: 329.63, summer: 4, animal: '🐈‍⬛', instrument: '🎸' }, // 미 E4 검은고양이→기타
  noa:   { id: 'noa',   name: '노아', color: '#9b6bff', noteHz: 311.13, summer: 5, animal: '🦙', instrument: '🎹' }, // 레# D#4 알파카→피아노
  bambi: { id: 'bambi', name: '밤비', color: '#ff8ec8', noteHz: 329.63, summer: 6, animal: '🦌', instrument: '🎸' }, // 미 E4 사슴→기타
};

export const RESCUE_ORDER: MemberId[] = ['eunho', 'yejun', 'hamin', 'noa', 'bambi'];
