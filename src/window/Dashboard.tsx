import { AnimatePresence, motion } from 'motion/react'
import arrowRightUp from '../assets/window/arrow-right-up.svg'
import avatar1 from '../assets/window/avatar-1.png'
import avatar2 from '../assets/window/avatar-2.png'
import avatar3 from '../assets/window/avatar-3.png'
import avatar4 from '../assets/window/avatar-4.png'
import carGlass from '../assets/window/car-glass.png'
import cardSheen from '../assets/window/card-sheen-2.svg'
import destLine from '../assets/window/dest-line-2.svg'
import icDone from '../assets/window/ic-done.svg'
import icGatePlane from '../assets/window/ic-gate-plane.svg'
import icNow from '../assets/window/ic-now.svg'
import jline1 from '../assets/window/jline-1.svg'
import jline2 from '../assets/window/jline-2.svg'
import plane from '../assets/window/plane.svg'
import vlineDest from '../assets/window/vline-dest.svg'
import { smoothEase } from '../motion/transitions'

// 피그마 "창문" 기본 v3 (525:1952) — 창가 대시보드. 메뉴를 열면(525:2048) BOARDING 카드가 접히고 MENU가 X로 바뀜
const AVATARS = [
  { src: avatar1, style: { left: -8.09, top: -4.04, width: 54.09, height: 54.09 }, shade: 'a' },
  { src: avatar2, style: { left: -3.58, top: -10.28, width: 42.741, height: 75.958 }, shade: 'b' },
  { src: avatar3, style: { left: 0, top: -3.47, width: 37.761, height: 50.433 }, shade: 'a' },
  { src: avatar4, style: { left: -2.2, top: -1.27, width: 41.733, height: 51.057 }, shade: 'a' },
]

// 카드가 하나씩 김 서린 유리에서 맺히듯 떠오름
const card = {
  hidden: { opacity: 0, y: 30, scale: 0.97, filter: 'blur(14px)' },
  show: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', transition: { duration: 1, ease: smoothEase } },
  exit: { opacity: 0, y: 18, scale: 0.98, filter: 'blur(10px)', transition: { duration: 0.4, ease: smoothEase } },
}

// 세로 연결선 — 피그마에선 가로선을 90° 돌린 것
function VLine({ src, top, length }: { src: string; top: number; length: number }) {
  return (
    <div className="wn-jline" style={{ top, height: length }}>
      <motion.div style={{ width: length, originX: 0 }} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.9, ease: smoothEase, delay: 0.7 }}>
        <img src={src} alt="" />
      </motion.div>
    </div>
  )
}

export default function Dashboard({ menuOpen, onMenu }: { menuOpen: boolean; onMenu: () => void }) {
  return (
    <motion.div
      className="wn-layer wn-noclick"
      initial="hidden"
      animate="show"
      exit="exit"
      variants={{ show: { transition: { staggerChildren: 0.12, delayChildren: 0.25 } }, exit: { transition: { staggerChildren: 0.04, staggerDirection: -1 } } }}
    >
      {/* OUR JOURNEY */}
      <motion.div className="wn-dcard wn-journey" variants={card}>
        <div className="wn-journey-head">
          <p>OUR JOURNEY</p>
          <div className="wn-avatars">
            {AVATARS.map((a, i) => (
              <motion.div key={i} className="wn-avatar" initial={{ opacity: 0, x: -10, scale: 0.6 }} animate={{ opacity: 1, x: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 380, damping: 22, delay: 0.7 + i * 0.08 }}>
                <img src={a.src} alt="" style={a.style} />
                <div className={`wn-avatar-shade is-${a.shade}`} />
              </motion.div>
            ))}
          </div>
        </div>
        <div className="wn-journey-list">
          <VLine src={jline1} top={31.77} length={40} />
          <VLine src={jline2} top={113.77} length={45} />
          <div className="wn-jrow">
            <div className="wn-jrow-left">
              <img src={icDone} alt="" width={33} height={33} />
              <p className="wn-jtext is-done">Security Check</p>
            </div>
            <p className="wn-jtime is-done">12:20</p>
          </div>
          <div className="wn-jrow">
            <div className="wn-jrow-left is-top">
              <div style={{ width: 25.405, height: 39.262 }} />
              <div className="wn-jnow">
                <p className="wn-jtext is-now">T1 Lounge</p>
                <p className="wn-jsub">Arriving in 3 min</p>
              </div>
            </div>
            <p className="wn-jtime is-now">12:43</p>
          </div>
          <div className="wn-jrow">
            <div className="wn-jrow-left">
              <img src={icGatePlane} alt="" width={25.405} height={25.405} />
              <p className="wn-jtext is-done">Gate 16</p>
            </div>
            <p className="wn-jtime is-next">14:20</p>
          </div>
        </div>
        {/* 지금 향하는 곳 — 화살표 점이 앞으로 살짝살짝 */}
        <motion.img className="wn-jnow-ic" src={icNow} alt="" width={33} height={33} animate={{ x: [0, 3, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 1.4 }} />
      </motion.div>

      {/* BOARDING IN — 메뉴를 열면 위로 접혀 들어감 */}
      <motion.div className="wn-layer" variants={card}>
        <motion.div
          className="wn-dcard wn-boarding"
          initial={false}
          animate={menuOpen ? { height: 24, top: 371, opacity: 0 } : { height: 191, top: 423, opacity: 1 }}
          transition={{ duration: 0.55, ease: smoothEase }}
        >
          <div className="wn-sheen">
            <motion.div className="wn-sheen-inner" initial={{ x: -260, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 1.6, ease: smoothEase, delay: 0.9 }}>
              <img src={cardSheen} alt="" />
            </motion.div>
          </div>
          <motion.div className="wn-boarding-car" initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 0.9 }} transition={{ type: 'spring', stiffness: 120, damping: 18, delay: 0.75 }}>
            <img src={carGlass} alt="" />
          </motion.div>
          <p className="wn-boarding-label">BOARDING IN</p>
          <p className="wn-boarding-value">1h 20m</p>
          <p className="wn-boarding-sub">Plenty of time for the lounge</p>
        </motion.div>
      </motion.div>

      {/* DESTINATION */}
      <motion.div className="wn-dcard wn-dest" variants={card}>
        <div className="wn-dest-line">
          <img src={destLine} alt="" />
        </div>
        <div className="wn-dest-head">
          <p>DESTINATION</p>
          <p className="is-flight">KE 905</p>
        </div>
        <div className="wn-dest-row">
          <motion.img src={plane} alt="" width={68} height={66.611} initial={{ x: -24, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 1.1, ease: smoothEase, delay: 0.8 }} />
          <p className="wn-dest-code">BER</p>
          <div className="wn-vline">
            <img src={vlineDest} alt="" />
          </div>
          <p className="wn-dest-temp">-1°</p>
        </div>
        <p className="wn-dest-small" style={{ left: 124.8 }}>
          Berlin
        </p>
        <p className="wn-dest-small" style={{ left: 235.8 }}>
          Little cloudy
        </p>
        <div className="wn-dest-sep" />
        <p className="wn-dest-foot" style={{ left: 30 }}>
          Local time 04:40
        </p>
        <p className="wn-dest-foot" style={{ left: 261.6 }}>
          Departs 14:50
        </p>
      </motion.div>

      {/* MENU — 누르면 이 자리에 X가 남고 나머지 버튼이 위로 펼쳐짐 */}
      <AnimatePresence>
        {!menuOpen && (
          <motion.button
            key="menu"
            type="button"
            className="wn-dcard wn-menu-btn"
            variants={card}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.25 } }}
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
        )}
      </AnimatePresence>
    </motion.div>
  )
}
