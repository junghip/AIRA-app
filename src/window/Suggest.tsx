import { motion } from 'motion/react'
import { useState } from 'react'
import carTop from '../assets/window/car-top.png'
import coffee from '../assets/window/coffee.png'
import sugMap from '../assets/window/sug-map.svg'
import sugRoad from '../assets/window/sug-road.svg'
import sugRoute from '../assets/window/sug-route.svg'
import { smoothEase } from '../motion/transitions'

// 피그마 "suggested" (484:2455) — 동행이 추천한 카페, 경로에 넣을지 묻기
const MENU_ITEMS = ['Signature Latte', 'Americano', 'Croissant', 'Croissant']

const rise = {
  hidden: { opacity: 0, y: 40, filter: 'blur(14px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 1, ease: smoothEase } },
}
const fadeIn = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: smoothEase } },
}

export default function Suggest({ onAdd }: { onAdd: () => void }) {
  const [adding, setAdding] = useState(false)

  return (
    <motion.div className="wn-layer" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.18, delayChildren: 0.3 } } }}>
      {/* 카페 카드 */}
      <motion.div className="wn-scard wn-scard-cafe" variants={rise}>
        <div className="wn-cafe-photo">
          <motion.img src={coffee} alt="" initial={{ scale: 1.15 }} animate={{ scale: 1 }} transition={{ duration: 2.4, ease: smoothEase }} />
        </div>
        <motion.div className="wn-cafe-info" variants={{ show: { transition: { staggerChildren: 0.07, delayChildren: 0.5 } } }}>
          <div className="wn-cafe-head">
            <motion.div className="wn-cafe-name" variants={fadeIn}>
              <p className="wn-cafe-title">Lounge Coffee</p>
              <p className="wn-cafe-meta">Cafe</p>
            </motion.div>
            <motion.p className="wn-cafe-meta" variants={fadeIn}>
              Near Gate 28 · 3F
            </motion.p>
            <motion.p className="wn-cafe-meta" variants={fadeIn}>
              ~3min wait
            </motion.p>
          </div>
          <div className="wn-cafe-menu">
            {MENU_ITEMS.map((name, i) => (
              <motion.div key={i} className="wn-cafe-item" variants={fadeIn}>
                <div className="wn-cafe-thumb">
                  <img src={coffee} alt="" />
                </div>
                <p className="wn-cafe-meta">{name}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* 경로 미리보기 카드 */}
      <motion.div className="wn-scard wn-scard-map" variants={rise}>
        <div className="wn-smap-bg">
          <div className="wn-smap-bg-inner">
            <img src={sugMap} alt="" />
          </div>
        </div>
        <div className="wn-sroad">
          <img src={sugRoad} alt="" />
        </div>
        <div className="wn-stats">
          <div className="wn-stat">
            <p className="wn-stat-value">+5min</p>
            <p className="wn-cafe-meta">Added time</p>
          </div>
          <div className="wn-stat">
            <p className="wn-stat-value">14:00</p>
            <p className="wn-cafe-meta">Arrive at Gate 16</p>
          </div>
        </div>
        {/* 지금 위치 → 카페까지 파란 길이 그려짐 */}
        <motion.div
          className="wn-sroute"
          initial={{ clipPath: 'inset(0% 100% 0% 0%)' }}
          animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
          transition={{ duration: 1.8, ease: smoothEase, delay: 1 }}
        >
          <img src={sugRoute} alt="" />
        </motion.div>
        <motion.div
          className="wn-scar"
          initial={{ opacity: 0, x: -50, y: 24 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ type: 'spring', stiffness: 60, damping: 14, delay: 0.8 }}
        >
          <div className="wn-scar-inner">
            <img src={carTop} alt="" />
          </div>
        </motion.div>
        <motion.div className="wn-spill" style={{ left: 62, top: 255 }} initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 380, damping: 20, delay: 1.1 }}>
          NOW
        </motion.div>
        <motion.div className="wn-spill" style={{ left: 562, top: 47 }} initial={{ opacity: 0, scale: 0.6, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 380, damping: 18, delay: 2.4 }}>
          Lounge Coffee
        </motion.div>
      </motion.div>

      <motion.p className="wn-suggested-by" variants={fadeIn}>
        Haeun suggested
      </motion.p>
      <div className="wn-add-slot">
        <motion.button
          type="button"
          className="wn-add-btn"
          variants={{
            hidden: { opacity: 0, y: 24, scale: 0.9 },
            show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 260, damping: 20 } },
          }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.94 }}
          animate={adding ? { scale: [1, 0.94, 1.06, 1], boxShadow: '0 0 40px rgba(170, 200, 255, 1)' } : undefined}
          onClick={(e) => {
            e.stopPropagation()
            if (adding) return
            setAdding(true)
            setTimeout(onAdd, 380)
          }}
        >
          Add to route
          {/* 누르길 기다리는 은은한 빛 */}
          <motion.span className="wn-add-glow" animate={{ opacity: [0, 0.8, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: 2.8 }} />
        </motion.button>
      </div>
    </motion.div>
  )
}
