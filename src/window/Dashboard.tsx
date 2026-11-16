import { AnimatePresence, motion } from 'motion/react'
import carGlass from '../assets/window/car-glass.png'
import plane from '../assets/window/plane.svg'
import jCheck from '../assets/window/v3-j-check.svg'
import jGate from '../assets/window/v3-j-gate.svg'
import jline1 from '../assets/window/v3-j-line1.svg'
import jline2 from '../assets/window/v3-j-line2.svg'
import jNow from '../assets/window/v3-j-now.svg'
import destLine from '../assets/window/v3-dest-line.svg'
import menuArrow from '../assets/window/v3-menu-arrow.svg'
import cardSheen from '../assets/window/v3-sheen.svg'
import vlineDest from '../assets/window/vline-dest.svg'
import { smoothEase } from '../motion/transitions'

// 피그마 "창문 디벨롭할게요" 기본 v3 (532:3177) — 창가 대시보드. 메뉴를 열면(532:3265) BOARDING 카드가 접히고 왼쪽 버튼이 펼쳐짐
const card = {
  hidden: { opacity: 0, y: 30, scale: 0.97, filter: 'blur(14px)' },
  show: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', transition: { duration: 1, ease: smoothEase } },
  exit: { opacity: 0, y: 18, scale: 0.98, filter: 'blur(10px)', transition: { duration: 0.4, ease: smoothEase } },
}

// 세로 연결선 — 피그마에선 가로선을 90° 돌린 것. 위에서 아래로 그어지며 나타남
function VLine({ src, left, top, length, delay }: { src: string; left: number; top: number; length: number; delay: number }) {
  return (
    <div className="wn-jline" style={{ left, top, height: length }}>
      <motion.div style={{ width: length, originX: 0 }} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.9, ease: smoothEase, delay }}>
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
        <p className="wn-journey-head">OUR JOURNEY</p>
        <div className="wn-journey-list">
          <VLine src={jline1} left={14.42} top={31.88} length={60} delay={0.8} />
          <VLine src={jline2} left={14} top={104.9} length={65} delay={1.2} />
          <div className="wn-jrow" style={{ top: 0, height: 33 }}>
            <div className="wn-jrow-left" style={{ gap: 20 }}>
              {/* 지금 지나는 곳 — 화살표가 앞으로 살짝살짝 */}
              <motion.img src={jNow} alt="" width={32} height={32} animate={{ x: [0, 2, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 1.4 }} />
              <p className="wn-jtext is-now">Security Check</p>
            </div>
            <p className="wn-jtime is-now">12:20</p>
          </div>
          <div className="wn-jrow" style={{ top: 69.95, height: 52 }}>
            <p className="wn-jtext" style={{ marginLeft: 54.4 }}>
              T1 Lounge
            </p>
            <p className="wn-jtime">12:43</p>
          </div>
          <div className="wn-jrow" style={{ top: 158.9, height: 29 }}>
            <div className="wn-jrow-left">
              <img src={jGate} alt="" width={28.595} height={28.595} />
              <p className="wn-jtext">Gate 16</p>
            </div>
            <p className="wn-jtime">14:20</p>
          </div>
        </div>
        {/* 다음 경유지 T1 Lounge 표시 — 모션 없이 그대로 */}
        <img className="wn-jcheck" src={jCheck} alt="" width={30.25} height={30.25} />
      </motion.div>

      {/* BOARDING IN — 메뉴를 열면 위로 접혀 들어감 */}
      <motion.div className="wn-layer" variants={card}>
        <motion.div
          className="wn-dcard wn-boarding"
          initial={false}
          animate={menuOpen ? { height: 24, top: 371, opacity: 0 } : { height: 167, top: 423, opacity: 1 }}
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
          <p className="is-flight">LH 702</p>
        </div>
        <div className="wn-dest-row">
          <motion.img src={plane} alt="" width={68} height={66.611} initial={{ x: -24, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 1.1, ease: smoothEase, delay: 0.8 }} />
          <p className="wn-dest-code">BER</p>
          <div className="wn-vline">
            <img src={vlineDest} alt="" />
          </div>
          <p className="wn-dest-temp">-1°</p>
        </div>
        <p className="wn-dest-small" style={{ left: 125 }}>
          Berlin
        </p>
        <p className="wn-dest-small" style={{ left: 236 }}>
          Little cloudy
        </p>
        <div className="wn-dest-sep" />
        <p className="wn-dest-foot" style={{ left: 30 }}>
          Local time 04:40
        </p>
        <p className="wn-dest-foot" style={{ left: 261.6 }}>
          Departs 15:00
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
              <img src={menuArrow} alt="" width={25.6} height={25.6} />
            </span>
            <span className="wn-menu-text">MENU</span>
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
