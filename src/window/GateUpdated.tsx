import { motion } from 'motion/react'
import arrowRight from '../assets/window/arrow-right-v2.svg'
import icAlert from '../assets/window/ic-alert.svg'
import icCheckWhite from '../assets/window/ic-check-white.svg'
import icClockGray from '../assets/window/ic-clock-gray.svg'
import icPhone from '../assets/window/ic-phone.svg'
import icRouteSign2 from '../assets/window/ic-route-sign-2.svg'
import icRouteSign from '../assets/window/ic-route-sign.svg'
import { smoothEase } from '../motion/transitions'

// 피그마 "창문" GATE UPDATED (525:2692) — 16에 줄이 그어지고, 화살표를 따라 47이 내려앉음
const fade = (delay: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: smoothEase, delay },
})

export default function GateUpdated({ onNext }: { onNext: () => void }) {
  return (
    <div className="wn-layer wn-noclick">
      <motion.div className="wn-gate-card" initial={{ opacity: 0, scale: 0.92, filter: 'blur(18px)' }} animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }} transition={{ duration: 0.9, ease: smoothEase, delay: 0.3 }} />

      {/* 경고 배지 — 한 번 크게 맥박 */}
      <motion.div className="wn-gate-badge" style={{ x: '-50%' }} initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: [0.6, 1.12, 1] }} transition={{ duration: 0.7, ease: smoothEase, delay: 0.7 }}>
        <img src={icAlert} alt="" width={22.5} height={22.5} />
        GATE UPDATED
      </motion.div>

      <motion.p className="wn-gate-old" {...fade(0.9)}>
        16
      </motion.p>
      <motion.span className="wn-gate-strike" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.5, ease: [0.65, 0, 0.35, 1], delay: 1.5 }} style={{ originX: 0 }} />
      <motion.img className="wn-gate-arrow" src={arrowRight} alt="" initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: smoothEase, delay: 1.9 }} />
      <motion.p className="wn-gate-new" initial={{ opacity: 0, y: -60, scale: 1.15, filter: 'blur(8px)' }} animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }} transition={{ type: 'spring', stiffness: 220, damping: 16, delay: 2.2 }}>
        47
      </motion.p>

      <motion.div className="wn-gate-changes" {...fade(2.7)}>
        <div className="wn-gate-row is-first">
          <img src={icRouteSign2} alt="" width={27} height={27} />
          <p className="wn-gate-row-label">Arrive at gate</p>
          <div className="wn-gate-row-value is-fixed">
            <span className="is-plus">+2 min</span>
            <b>14:02</b>
          </div>
        </div>
        <div className="wn-gate-row">
          <img src={icClockGray} alt="" width={27} height={27} />
          <p className="wn-gate-row-label">Boarding</p>
          <div className="wn-gate-row-value">
            <span className="wn-gate-nochange">No change</span>
            <b>14:20</b>
          </div>
        </div>
      </motion.div>

      <motion.div className="wn-gate-actions" {...fade(3)}>
        <motion.button
          type="button"
          className="wn-gate-btn is-light"
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation()
            onNext()
          }}
        >
          <img src={icRouteSign} alt="" width={26.93} height={26.93} />
          See new route
        </motion.button>
        <motion.button
          type="button"
          className="wn-gate-btn is-dark"
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation()
            onNext()
          }}
        >
          <img src={icCheckWhite} alt="" width={26.93} height={26.93} />
          Got it
        </motion.button>
      </motion.div>

      <motion.p className="wn-gate-notified" style={{ x: '-50%' }} {...fade(3.3)}>
        {/* 일행 휴대폰에 알림 — 진동하듯 */}
        <motion.img src={icPhone} alt="" width={24} height={24} animate={{ rotate: [0, -10, 10, -6, 6, 0] }} transition={{ duration: 0.6, delay: 3.6, repeat: 2, repeatDelay: 1.6 }} />
        Everyone’s phones have been notified
      </motion.p>
    </div>
  )
}
