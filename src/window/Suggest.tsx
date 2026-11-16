import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import carTop from '../assets/window/car-top.png'
import dunkin from '../assets/window/dunkin.png'
import icCheckbox from '../assets/window/ic-checkbox.svg'
import icClock from '../assets/window/ic-clock.svg'
import icPin from '../assets/window/ic-pin.svg'
import icPlus from '../assets/window/ic-plus.svg'
import icTick from '../assets/window/ic-tick.svg'
import menuAmericano from '../assets/window/menu-americano.png'
import menuBoston from '../assets/window/menu-boston.png'
import menuGlazed from '../assets/window/menu-glazed.png'
import menuMunchkin from '../assets/window/menu-munchkin.png'
import sugMap from '../assets/window/sug-map-v2.svg'
import sugRoad from '../assets/window/sug-road-v2.svg'
import sugRoute from '../assets/window/sug-route-v2.svg'
import { smoothEase } from '../motion/transitions'

// 피그마 "창문 디벨롭할게요1" 기본 v3 (532:3684) — 일행이 추천한 Dunkin, 미리 주문하고 경로에 넣을지 고르기
const MENU = [
  { name: 'Original Glazed', img: menuGlazed, size: { width: 54, height: 67 } },
  { name: 'Boston Kreme', img: menuBoston, size: { width: 54, height: 68 } },
  { name: 'Munchkin', img: menuMunchkin, size: { width: 52, height: 65 } },
  { name: 'Americano', img: menuAmericano, size: { width: 60, height: 60 } },
]

const rise = {
  hidden: { opacity: 0, y: 40, filter: 'blur(14px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 1, ease: smoothEase } },
}
const fadeIn = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: smoothEase } },
}

export default function Suggest({ cue, onAdd, onSkip }: { cue: boolean; onAdd: () => void; onSkip: () => void }) {
  const [picked, setPicked] = useState<boolean[]>([true, false, false, false])
  const [adding, setAdding] = useState(false)
  const count = picked.filter(Boolean).length
  // 고른 쪽 강조 — 자동 재생에서 넘어가기 직전(cue) 또는 직접 눌렀을 때
  const lit = cue || adding

  return (
    <motion.div className="wn-layer wn-noclick" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.16, delayChildren: 0.3 } } }}>
      {/* 맨 위 — 누가 추천했는지 알림이 내려옴 */}
      <motion.div className="wn-s-banner" style={{ x: '-50%' }} variants={{ hidden: { opacity: 0, y: -40, scale: 0.9 }, show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 260, damping: 22 } } }}>
        <p className="wn-s-banner-title">Eden suggested a stop</p>
        <p className="wn-s-banner-time"> just now</p>
      </motion.div>

      {/* 카드 두 장 — 피그마에서 처음 시안보다 작아짐 (Window.css .wn-s-scale) */}
      <div className="wn-s-scale">
      {/* 가게 카드 */}
      <motion.div className="wn-s-place" variants={rise}>
        <div className="wn-s-photo">
          <motion.img src={dunkin} alt="" initial={{ scale: 1.15 }} animate={{ scale: 1 }} transition={{ duration: 2.4, ease: smoothEase }} />
        </div>
        <motion.div className="wn-s-info" variants={{ show: { transition: { staggerChildren: 0.07, delayChildren: 0.4 } } }}>
          <motion.div className="wn-s-title-row" variants={fadeIn}>
            <p className="wn-s-title">Dunkin</p>
            <p className="wn-s-tag">Donuts &amp; coffee</p>
          </motion.div>
          <motion.div className="wn-s-meta" variants={fadeIn}>
            <span>
              <img src={icPin} alt="" width={22.629} height={22.629} />
              Near Gate 28 · 3F
            </span>
            <span>
              <img src={icClock} alt="" width={22.629} height={22.629} />
              ~3 min wait
            </span>
          </motion.div>
          <motion.div className="wn-s-divider" variants={fadeIn} />
          <motion.p className="wn-s-order-title" variants={fadeIn}>
            Order ahead
          </motion.p>
          <div className="wn-s-spacer" />
          <motion.div className="wn-s-order-sum" variants={fadeIn}>
            <img src={icCheckbox} alt="" width={30.172} height={30.172} />
            <p>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span key={count} initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }} transition={{ duration: 0.3 }} style={{ display: 'inline-block' }}>
                  {count}
                </motion.span>
              </AnimatePresence>{' '}
              {count === 1 ? 'item' : 'items'} · ready when you arrive
            </p>
          </motion.div>
        </motion.div>

        {/* 미리 주문 — 눌러서 고르기 */}
        <div className="wn-s-menu">
          {MENU.map((m, i) => (
            <motion.button
              key={m.name}
              type="button"
              className="wn-s-item"
              style={{ top: i * 75.25 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0, backgroundColor: picked[i] ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.5)' }}
              transition={{ opacity: { duration: 0.6, delay: 0.9 + i * 0.07 }, y: { duration: 0.6, ease: smoothEase, delay: 0.9 + i * 0.07 }, backgroundColor: { duration: 0.2 } }}
              whileTap={{ scale: 0.97 }}
              onClick={(e) => {
                e.stopPropagation()
                setPicked((p) => p.map((v, j) => (j === i ? !v : v)))
              }}
            >
              <img className="wn-s-item-img" src={m.img} alt="" style={m.size} />
              <span className="wn-s-item-name">{m.name}</span>
              <motion.span className="wn-s-check" animate={{ backgroundColor: picked[i] ? '#141b2b' : 'rgba(20,27,43,0)', borderColor: picked[i] ? '#141b2b' : '#9aa1ae' }} transition={{ duration: 0.2 }}>
                <AnimatePresence>
                  {picked[i] && <motion.img key="tick" src={icTick} alt="" width={16} height={16} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ type: 'spring', stiffness: 600, damping: 20 }} />}
                </AnimatePresence>
              </motion.span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* 경로 미리보기 카드 */}
      <motion.div className="wn-s-map" variants={rise}>
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
            <p className="wn-stat-label">Added time</p>
          </div>
          <div className="wn-stat">
            <p className="wn-stat-value">14:00</p>
            <p className="wn-stat-label">Arrive at Gate 16</p>
          </div>
        </div>
        {/* 지금 위치 → 가게까지 파란 길이 그려짐 */}
        <motion.div className="wn-sroute" initial={{ clipPath: 'inset(0% 100% 0% 0%)' }} animate={{ clipPath: 'inset(0% 0% 0% 0%)' }} transition={{ duration: 1.8, ease: smoothEase, delay: 1 }}>
          <img src={sugRoute} alt="" />
        </motion.div>
        <motion.div className="wn-scar" initial={{ opacity: 0, x: -50, y: 24 }} animate={{ opacity: 1, x: 0, y: 0 }} transition={{ type: 'spring', stiffness: 60, damping: 14, delay: 0.8 }}>
          <div className="wn-scar-inner">
            <img src={carTop} alt="" />
          </div>
        </motion.div>
        <motion.div className="wn-spill" style={{ left: 62, top: 255 }} initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 380, damping: 20, delay: 1.1 }}>
          NOW
        </motion.div>
        <motion.div className="wn-spill" style={{ left: 592, top: 30 }} initial={{ opacity: 0, scale: 0.6, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 380, damping: 18, delay: 2.4 }}>
          Dunkin
        </motion.div>
      </motion.div>

      </div>

      {/* 결정 버튼 */}
      <motion.div className="wn-s-decision" style={{ x: '-50%' }} variants={fadeIn}>
        <div className="wn-s-actions">
          <motion.button
            type="button"
            className="wn-s-btn is-glass"
            initial={false}
            // 고르지 않은 쪽은 한 걸음 물러남
            animate={{ opacity: lit ? 0.4 : 1, scale: lit ? 0.96 : 1 }}
            transition={{ duration: 0.5, ease: smoothEase }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation()
              onSkip()
            }}
          >
            Not now
          </motion.button>
          <div className="wn-s-add-wrap">
            {/* 강조될 때 버튼 둘레로 빛 고리가 두 번 퍼져 나감 */}
            <AnimatePresence>
              {lit &&
                [0, 0.7].map((d) => (
                  <motion.span key={d} className="wn-add-ring" initial={{ opacity: 0, scale: 1 }} animate={{ opacity: [0, 0.9, 0], scale: [1, 1.18, 1.32] }} exit={{ opacity: 0 }} transition={{ duration: 1.2, ease: 'easeOut', delay: 0.15 + d }} />
                ))}
            </AnimatePresence>
            <motion.button
              type="button"
              className="wn-s-btn is-primary"
              initial={false}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.94 }}
              animate={
                adding
                  ? { scale: [1.08, 0.96, 1.08], backgroundColor: '#f2f6ff', boxShadow: '0 0 48px rgba(170, 200, 255, 1), inset 0 0 10px #fff' }
                  : { scale: cue ? 1.08 : 1, backgroundColor: cue ? '#f2f6ff' : '#d9e2ee', boxShadow: cue ? '0 0 48px rgba(170, 200, 255, 1), inset 0 0 10px #fff' : '0 0 20px rgba(130, 153, 185, 0.8), inset 0 0 10px #fff' }
              }
              transition={{ type: 'spring', stiffness: 260, damping: 18 }}
              onClick={(e) => {
                e.stopPropagation()
                if (adding) return
                setAdding(true)
                setTimeout(onAdd, 380)
              }}
            >
              <motion.img src={icPlus} alt="" width={27.155} height={27.155} animate={{ rotate: lit ? 90 : 0 }} transition={{ type: 'spring', stiffness: 300, damping: 16 }} />
              Add to route
              {/* 누르길 기다리는 은은한 빛 */}
              {!lit && <motion.span className="wn-add-glow" animate={{ opacity: [0, 0.8, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: 2.8 }} />}
              {/* 강조될 때 빛줄기가 버튼을 한 번 훑고 지나감 */}
              {lit && <motion.span className="wn-add-sweep" initial={{ x: '-120%' }} animate={{ x: '260%' }} transition={{ duration: 0.9, ease: smoothEase, delay: 0.1 }} />}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
