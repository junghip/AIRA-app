import { motion } from 'motion/react'
import icClockDark from '../assets/window/ic-clock-dark.svg'
import icCup from '../assets/window/ic-cup.svg'
import { smoothEase } from '../motion/transitions'

// 피그마 "창문 디벨롭할게요" 532:4055 — 카페 도착, 다시 출발할 때까지 막대가 차오름
const rise = (delay: number) => ({
  initial: { opacity: 0, y: 26, filter: 'blur(10px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  transition: { duration: 1, ease: smoothEase, delay },
})

export function ArrivedCoffee() {
  return (
    <div className="wn-layer wn-noclick">
      <div className="wn-arrive-text" style={{ top: 410 }}>
        <motion.p className="wn-arrive-title" style={{ fontSize: 56 }} {...rise(0.9)}>
          We’ve arrived at Dunkin
        </motion.p>
        <motion.p className="wn-arrive-sub" {...rise(1.1)}>
          AIRA will wait right here for you
        </motion.p>
      </div>

      <div className="wn-arrive-chips">
        <motion.div className="wn-glass-chip" {...rise(1.5)}>
          <span className="wn-glass-chip-ic">
            {/* 주문한 음료 — 김이 오르듯 살짝 들썩 */}
            <motion.img src={icCup} alt="" width={27} height={27} animate={{ y: [0, -2, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }} />
          </span>
          <span className="wn-glass-chip-text">
            <b>Your order is ready</b>
            <span>4 drinks · Pick up at counter 2</span>
          </span>
        </motion.div>
        <motion.div className="wn-glass-chip" {...rise(1.65)}>
          <span className="wn-glass-chip-ic">
            <motion.img src={icClockDark} alt="" width={27} height={27} animate={{ rotate: 360 }} transition={{ duration: 12, repeat: Infinity, ease: 'linear' }} />
          </span>
          <span className="wn-glass-chip-text">
            <b>We leave at 13:05</b>
            <span>15 min stop · phones pinged 5 min before</span>
          </span>
        </motion.div>
      </div>

      {/* 남은 정차 시간 — 막대가 차오르며 앞쪽 빛이 함께 흐름 */}
      <motion.div className="wn-arrive-next" {...rise(2)}>
        <div className="wn-arrive-bar">
          <motion.span initial={{ width: 0 }} animate={{ width: [0, 39, 480] }} transition={{ duration: 5.4, ease: [0.3, 0, 0.7, 1], times: [0, 0.1, 1], delay: 2.3 }}>
            <motion.i className="wn-arrive-glow" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }} />
          </motion.span>
        </div>
        <p>Gate 16 · 6 min ride</p>
      </motion.div>
    </div>
  )
}
