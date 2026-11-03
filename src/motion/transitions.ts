import type { Transition, Variants } from 'motion/react'

// 공통 스프링 — 화면 전환, 버튼 반응 등에서 같이 씀
export const spring: Transition = { type: 'spring', stiffness: 380, damping: 36 }
export const softSpring: Transition = { type: 'spring', stiffness: 220, damping: 26 }

// direction: 1 = 앞으로(push), -1 = 뒤로(pop)
export const pageSlide: Variants = {
  initial: (direction: number) => ({ x: direction > 0 ? '100%' : '-30%', opacity: direction > 0 ? 1 : 0.6 }),
  animate: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction > 0 ? '-30%' : '100%', opacity: direction > 0 ? 0.6 : 1 }),
}

// 화면 진입 시 자식 요소들이 순서대로 떠오르게
export const stagger = (gap = 0.08, delay = 0.1): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: gap, delayChildren: delay } },
})

// 튀지 않고 부드럽게 멈추는 곡선
export const smoothEase = [0.22, 1, 0.36, 1] as const

export const riseInSmooth: Variants = {
  hidden: { opacity: 0, y: 16, filter: 'blur(6px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.9, ease: smoothEase } },
}

export const riseIn: Variants = {
  hidden: { opacity: 0, y: 24, filter: 'blur(6px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: softSpring },
}
