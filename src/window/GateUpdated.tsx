import { motion } from 'motion/react'
import arrowRight from '../assets/window/arrow-right.svg'
import strike from '../assets/window/strike.svg'
import { smoothEase } from '../motion/transitions'

// 피그마 "GATE UPDATED" (484:2709) — 16에 줄이 그어지고, 화살표를 따라 47이 내려앉음
export default function GateUpdated() {
  return (
    <div className="wn-layer">
      <motion.div
        className="wn-gate-card"
        initial={{ opacity: 0, scale: 0.92, filter: 'blur(18px)' }}
        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        transition={{ duration: 0.9, ease: smoothEase, delay: 0.3 }}
      />
      <motion.p
        className="wn-gate-title"
        initial={{ opacity: 0, y: 12, letterSpacing: '8px' }}
        animate={{ opacity: 1, y: 0, letterSpacing: '0px' }}
        transition={{ duration: 1, ease: smoothEase, delay: 0.6 }}
      >
        GATE UPDATED
      </motion.p>

      <motion.p className="wn-gate-old" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: smoothEase, delay: 0.8 }}>
        16
      </motion.p>
      <motion.div className="wn-gate-strike" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.55, ease: [0.65, 0, 0.35, 1], delay: 1.5 }} style={{ originX: 0 }}>
        <img src={strike} alt="" />
      </motion.div>
      <motion.img
        className="wn-gate-arrow"
        src={arrowRight}
        alt=""
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: smoothEase, delay: 1.95 }}
      />
      <motion.p
        className="wn-gate-new"
        initial={{ opacity: 0, y: -60, scale: 1.15, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
        transition={{ type: 'spring', stiffness: 220, damping: 16, delay: 2.3 }}
      >
        47
      </motion.p>

      <motion.p className="wn-gate-note" style={{ top: 663, fontSize: 32 }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: smoothEase, delay: 2.9 }}>
        Route updated automatically
      </motion.p>
      <motion.p className="wn-gate-note" style={{ top: 739, fontSize: 28 }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: smoothEase, delay: 3.1 }}>
        Boarding stays 14:20
      </motion.p>
    </div>
  )
}
