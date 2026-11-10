import { motion } from 'motion/react'
import { smoothEase } from '../motion/transitions'

// 가운데 두 줄 문구 (좌석 안내, 탑승 대기, 도착 등) — 제목이 먼저, 부제가 뒤따라 떠오름
const line = {
  hidden: { opacity: 0, y: 28, filter: 'blur(10px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 1, ease: smoothEase } },
}

export default function TextScene({ title, sub, semibold }: { title: string; sub: string; semibold?: boolean }) {
  return (
    <motion.div
      className={`wn-text-scene${semibold ? ' is-semibold' : ''}`}
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.22, delayChildren: semibold ? 0.9 : 0.35 } } }}
    >
      <motion.p className="wn-text-title" variants={line}>
        {title}
      </motion.p>
      <motion.p className="wn-text-sub" variants={line}>
        {sub}
      </motion.p>
    </motion.div>
  )
}
