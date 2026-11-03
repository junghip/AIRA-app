import { AnimatePresence, motion } from 'motion/react'
import type { Variants } from 'motion/react'
import { spring } from '../motion/transitions'

// direction: 1 = 숫자가 커질 때(아래→위로 굴러 올라옴), -1 = 작아질 때
const roll: Variants = {
  enter: (d: number) => ({ y: d > 0 ? '60%' : '-60%', opacity: 0, filter: 'blur(4px)' }),
  center: { y: 0, opacity: 1, filter: 'blur(0px)' },
  exit: (d: number) => ({ y: d > 0 ? '-60%' : '60%', opacity: 0, filter: 'blur(4px)' }),
}

// 바뀐 글자만 슬롯머신처럼 굴러가는 텍스트
export default function RollingText({ value, direction = 1, className }: { value: string; direction?: number; className?: string }) {
  return (
    <span className={className} style={{ display: 'inline-flex', overflow: 'hidden' }} aria-label={value} role="text">
      {value.split('').map((char, i) => (
        <span key={i} aria-hidden style={{ position: 'relative', display: 'inline-block' }}>
          <AnimatePresence mode="popLayout" initial={false} custom={direction}>
            <motion.span
              key={char}
              custom={direction}
              variants={roll}
              initial="enter"
              animate="center"
              exit="exit"
              transition={spring}
              style={{ display: 'inline-block', whiteSpace: 'pre' }}
            >
              {char}
            </motion.span>
          </AnimatePresence>
        </span>
      ))}
    </span>
  )
}
