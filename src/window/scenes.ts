// 피그마 Section 10 "차량 창문" 흐름 — 순서대로 한 장면씩
export const SCENES = [
  'welcome', // 웰컴 — Welcome aboard AIRA
  'seat', // Take a seat to get started
  'waiting', // Waiting for everyone · 2 of 4 seated
  'starting', // Starting your journey · All seated!
  'dashboard', // 기본 대시보드 (MENU → Section 9 메뉴)
  'suggest', // Haeun suggested · Add to route
  'route', // AIRA Route에 Lounge Coffee가 끼어듦
  'arrivedCoffee', // We've arrived at Lounge Coffee
  'gate', // GATE UPDATED 16 → 47
  'route47', // 바뀐 경로 — Gate 47
  'arrivedGate', // We've arrived at Gate 47
  'bye', // See you on the way back
] as const

export type Scene = (typeof SCENES)[number]

// 차량 UI(대시보드·메뉴)가 깔리는 장면
export const isCarScene = (s: Scene) => s === 'dashboard' || s === 'route' || s === 'route47'

// 경로 패널 내용
export type RouteVariant = 'base' | 'coffee' | 'gate47'

export type MenuTab = 'route' | 'flight' | 'photo'
