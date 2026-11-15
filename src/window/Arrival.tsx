import { motion } from 'motion/react'
import icBag from '../assets/window/ic-bag.svg'
import icClockDark from '../assets/window/ic-clock-dark.svg'
import icCup from '../assets/window/ic-cup.svg'
import { smoothEase } from '../motion/transitions'

// 피그마 "창문" 525:2647(카페 도착) · 525:2775(Gate 47 도착)
const rise = (delay: number) => ({
  initial: { opacity: 0, y: 26, filter: 'blur(10px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  transition: { duration: 1, ease: smoothEase, delay },
})

export function ArrivedCoffee() {
  return (
    <div className="wn-layer wn-noclick">
      <div className="wn-arrive-text" style={{ top: 401 }}>
        <motion.p className="wn-arrive-title" style={{ fontSize: 69 }} {...rise(0.9)}>
          We’ve arrived at Lounge Coffee
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

      {/* 남은 정차 시간 — 막대가 아주 천천히 차오름 */}
      <motion.div className="wn-arrive-next" {...rise(2)}>
        <div className="wn-arrive-bar">
          <motion.span initial={{ width: 0 }} animate={{ width: 480 }} transition={{ duration: 60, ease: 'linear', delay: 2.4 }} />
        </div>
        <p>Next: Gate 16 · 6 min ride</p>
      </motion.div>
    </div>
  )
}

export function ArrivedGate() {
  return (
    <div className="wn-layer wn-noclick">
      <div className="wn-arrive-text" style={{ top: 388 }}>
        <motion.p className="wn-arrive-title" style={{ fontSize: 75, letterSpacing: -1.125 }} {...rise(0.9)}>
          We’ve arrived at Gate 47
        </motion.p>
        <motion.p className="wn-arrive-sub" {...rise(1.1)}>
          Have a wonderful trip to Berlin
        </motion.p>
      </div>

      <motion.div className="wn-summary" style={{ x: '-50%' }} {...rise(1.5)}>
        <div className="wn-summary-cell">
          <p>FLIGHT</p>
          <b>LH 702</b>
        </div>
        <span className="wn-summary-div" />
        <div className="wn-summary-cell">
          <p>BOARDING</p>
          <b>14:20 · in 18 min</b>
        </div>
        <span className="wn-summary-div" />
        <div className="wn-summary-cell">
          <p>SEATS</p>
          <b>32A – 32D</b>
        </div>
      </motion.div>

      <motion.p className="wn-reminder" {...rise(2)}>
        <img src={icBag} alt="" width={27} height={27} />
        Please take all your belongings · doors open on your right
      </motion.p>
    </div>
  )
}
