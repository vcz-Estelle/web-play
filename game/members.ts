import { MemberId } from './types';

export interface MemberMeta {
  id: MemberId;
  name: string;
  color: string;      // 점/글로우 색
  noteHz: number;     // 구출 단음(피아노)
  summer: number;     // 등장 여름
}

export const MEMBERS: Record<MemberId, MemberMeta> = {
  eunho: { id: 'eunho', name: '은호', color: '#ff4d4d', noteHz: 415.30, summer: 2 }, // 솔# G#4
  yejun: { id: 'yejun', name: '예준', color: '#4aa3ff', noteHz: 369.99, summer: 3 }, // 파# F#4
  hamin: { id: 'hamin', name: '하민', color: '#4ade80', noteHz: 329.63, summer: 4 }, // 미 E4
  noa:   { id: 'noa',   name: '노아', color: '#9b6bff', noteHz: 311.13, summer: 5 }, // 레# D#4
  bambi: { id: 'bambi', name: '밤비', color: '#ff8ec8', noteHz: 329.63, summer: 6 }, // 미 E4
};

export const RESCUE_ORDER: MemberId[] = ['eunho', 'yejun', 'hamin', 'noa', 'bambi'];
