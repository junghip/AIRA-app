import { motion } from 'motion/react'
import arrowLeftUp from '../assets/window/arrow-left-up.svg'
import arrowRightUp from '../assets/window/arrow-right-up.svg'
import avatar1 from '../assets/window/avatar-1.png'
import avatar2 from '../assets/window/avatar-2.png'
import avatar3 from '../assets/window/avatar-3.png'
import avatar4 from '../assets/window/avatar-4.png'
import carGlass from '../assets/window/car-glass.png'
import cardSheen from '../assets/window/card-sheen.svg'
import check from '../assets/window/check.svg'
import destLine from '../assets/window/dest-line.svg'
import journeyLine from '../assets/window/journey-line.svg'
import pinGate from '../assets/window/pin-gate.svg'
import pinLounge from '../assets/window/pin-lounge.svg'
import plane from '../assets/window/plane.svg'
import vline from '../assets/window/vline.svg'
import { smoothEase } from '../motion/transitions'

// 피그마 Section 10 "기본 v3" (485:3353) — 창가 대시보드
const AVATARS = [
  { src: avatar1, style: { left: -7, top: -3.5, width: 46.841, height: 46.841 }, shade: 'a' },
  { src: avatar2, style: { left: -3.1, top: -8.9, width: 37.013, height: 65.778 }, shade: 'b' },
  { src: avatar3, style: { left: 0, top: -3, width: 32.7, height: 43.674 }, shade: 'a' },
  { src: avatar4, style: { left: -1.91, top: -1.1, width: 36.14, height: 44.214 }, shade: 'a' },
]

// 카드가 하나씩 김 서린 유리에서 맺히듯 떠오름
const card = {
  hidden: { opacity: 0, y: 30, scale: 0.97, filter: 'blur(14px)' },
  show: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', transition: { duration: 1, ease: smoothEase } },
  exit: { opacity: 0, y: 18, scale: 0.98, filter: 'blur(10px)', transition: { duration: 0.4, ease: smoothEase } },
}

export default function Dashboard({ onMenu }: { onMenu: () => void }) {
  return (
    <motion.div
      className="wn-layer"
      initial="hidden"
      animate="show"
      exit="exit"
      variants={{ show: { transition: { staggerChildren: 0.12, delayChildren: 0.25 } }, exit: { transition: { staggerChildren: 0.04, staggerDirection: -1 } } }}
    >
      {/* OUR JOURNEY */}
      <motion.div className="wn-dcard wn-journey" variants={card}>
        <div className="wn-journey-head">
          <p className="wn-dcard-label">OUR JOURNEY</p>
          <div className="wn-avatars">
            {AVATARS.map((a, i) => (
              <motion.div
                key={i}
                className="wn-avatar"
                initial={{ opacity: 0, x: -10, scale: 0.6 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 380, damping: 22, delay: 0.7 + i * 0.08 }}
              >
                <img src={a.src} alt="" style={a.style} />
                <div className={`wn-avatar-shade is-${a.shade}`} />
              </motion.div>
            ))}
          </div>
        </div>
        <div className="wn-journey-list">
          <div className="wn-journey-line">
            <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1.2, ease: smoothEase, delay: 0.6 }} style={{ originX: 0 }}>
              <img src={journeyLine} alt="" />
            </motion.div>
          </div>
          <div className="wn-jrow">
            <div className="wn-jrow-left is-center">
              <img src={check} alt="" width={22} height={22} />
              <p className="wn-jtext is-done">Security Check</p>
            </div>
            <p className="wn-jtime is-done">12:20</p>
          </div>
          <div className="wn-jrow">
            <div className="wn-jrow-left">
              <motion.img
                src={pinLounge}
                alt=""
                width={22}
                height={34}
                // 지금 향하는 곳 — 핀이 숨 쉬듯 살짝 들썩임
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: 1.4 }}
              />
              <div className="wn-jcol">
                <p className="wn-jtext is-now">T1 Lounge</p>
                <p className="wn-jsub">Arriving</p>
              </div>
            </div>
            <p className="wn-jtime is-now">12:43</p>
          </div>
          <div className="wn-jrow">
            <div className="wn-jrow-left is-center">
              <img src={pinGate} alt="" width={22} height={22} />
              <p className="wn-jtext is-next">Gate 16</p>
            </div>
            <p className="wn-jtime is-next">14:20</p>
          </div>
        </div>
      </motion.div>

      {/* AIRA 남은 시간 */}
      <motion.div className="wn-dcard wn-left" variants={card}>
        <div className="wn-sheen">
          <motion.div
            className="wn-sheen-inner"
            initial={{ x: -260, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1.6, ease: smoothEase, delay: 0.9 }}
          >
            <img src={cardSheen} alt="" />
          </motion.div>
        </div>
        <div className="wn-left-col">
          <p className="wn-left-label">AIRA</p>
          <p className="wn-left-value">1hr 20min</p>
        </div>
        <motion.div
          className="wn-left-car"
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 0.9 }}
          transition={{ type: 'spring', stiffness: 120, damping: 18, delay: 0.75 }}
        >
          <img src={carGlass} alt="" />
        </motion.div>
      </motion.div>

      {/* DESTINATION */}
      <motion.div className="wn-dcard wn-dest" variants={card}>
        <div className="wn-dest-line">
          <img src={destLine} alt="" />
        </div>
        <p className="wn-dcard-label">DESTINATION</p>
        <div className="wn-dest-row">
          <motion.img
            src={plane}
            alt=""
            width={68}
            height={66.611}
            initial={{ x: -24, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1.1, ease: smoothEase, delay: 0.8 }}
          />
          <p className="wn-dest-code">BER</p>
          <div className="wn-vline">
            <img src={vline} alt="" />
          </div>
          <div className="wn-dest-weather">
            <p className="wn-dest-temp">-1°</p>
            <p className="wn-dest-desc">Little cloudy</p>
          </div>
        </div>
      </motion.div>

      {/* MENU 버튼 둘 */}
      <motion.button
        type="button"
        className="wn-dcard wn-menu-btn"
        style={{ left: 80 }}
        variants={card}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.95 }}
        onClick={(e) => {
          e.stopPropagation()
          onMenu()
        }}
      >
        <span className="wn-menu-ic">
          <img src={arrowRightUp} alt="" width={32} height={32} />
        </span>
        <span className="wn-menu-text">MENU</span>
      </motion.button>
      <motion.button
        type="button"
        className="wn-dcard wn-menu-btn"
        style={{ left: 1677 }}
        variants={card}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.95 }}
        onClick={(e) => {
          e.stopPropagation()
          onMenu()
        }}
      >
        <span className="wn-menu-ic">
          <img src={arrowLeftUp} alt="" width={32} height={32} />
        </span>
        <span className="wn-menu-text">MENU</span>
      </motion.button>

      {/* 날짜 · 시각 · 날씨 */}
      <motion.div className="wn-clock" style={{ x: '-50%' }} variants={card}>
        <p className="wn-clock-side">Thu, Dec 24</p>
        <div className="wn-vline">
          <img src={vline} alt="" />
        </div>
        <p className="wn-clock-time">12:40</p>
        <div className="wn-vline">
          <img src={vline} alt="" />
        </div>
        <p className="wn-clock-side wn-clock-weather">
          <span>4°</span>
          <span>Rainy</span>
        </p>
      </motion.div>
    </motion.div>
  )
}
