// 피그마 "창문" 섹션 (525:1951) 흐름 — 순서대로 한 장면씩, 터치로 넘김
export const SCENES = [
  'welcome', // Welcome aboard AIRA · Doors are open
  'seat', // Take a seat to get started — 빈 좌석 4개
  'waiting', // Waiting for everyone — 2명 탑승
  'starting', // Starting your journey — 모두 체크인
  'dashboard', // 기본 대시보드 (MENU → 왼쪽 메뉴)
  'suggest', // Seha suggested a stop — Dunkin
  'route', // AIRA Route에 Dunkin이 끼어듦
  'arrivedCoffee', // We've arrived at Lounge Coffee
  'gate', // GATE UPDATED 16 → 47
  'route47', // 바뀐 경로 — Gate 47
  'arrivedGate', // We've arrived at Gate 47
  'bye', // See you on the way back
] as const

export type Scene = (typeof SCENES)[number]

// 탑승 안내 화면 — 상단·하단 바와 좌석 카드를 함께 씀
export const isIntroScene = (s: Scene) => s === 'welcome' || s === 'seat' || s === 'waiting' || s === 'starting'

// 차량 UI(대시보드·메뉴)가 깔리는 장면
export const isCarScene = (s: Scene) => s === 'dashboard' || s === 'route' || s === 'route47'

// 경로 패널 내용
export type RouteVariant = 'base' | 'coffee' | 'gate47'

// 메뉴 — open: 왼쪽 버튼만 펼친 상태, route/flight: 패널이 열린 상태
export type MenuState = null | 'open' | 'route' | 'flight'
