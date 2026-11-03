import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { pageSlide, spring } from '../motion/transitions'

// 모든 화면을 감싸는 래퍼 — 전환 애니메이션 담당 (배경·여백은 각 화면이 가짐)
export default function Screen({ children, direction }: { children: ReactNode; direction: number }) {
  return (
    <motion.main
      custom={direction}
      variants={pageSlide}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={spring}
      style={{ position: 'absolute', inset: 0, overflowY: 'auto', background: 'var(--color-bg)' }}
    >
      {children}
    </motion.main>
  )
}
