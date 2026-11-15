import { AnimatePresence, motion } from 'motion/react'
import icGlobe from '../assets/window/ic-globe.svg'
import icHelp from '../assets/window/ic-help.svg'
import statusDot from '../assets/window/v3-status-dot.svg'
import { smoothEase } from '../motion/transitions'
import { isIntroScene, type Scene } from './scenes'

// 탑승 안내 화면의 위·아래 바 — 차량 번호·시각, 언어·도움말 버튼
export function TopBar({ scene }: { scene: Scene }) {
  return (
    <AnimatePresence>
      {isIntroScene(scene) && (
        <motion.div
          key="top"
          className="wn-topbar"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.8, ease: smoothEase }}
        >
          <div className="wn-topbar-side">
            <p>AIRA 07</p>
            {/* 운행 중 표시 — 천천히 숨 쉬는 점 */}
            <motion.img src={statusDot} alt="" width={6} height={6} animate={{ opacity: [1, 0.3, 1], scale: [1, 1.5, 1] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }} />
            <p>Terminal 1</p>
          </div>
          <div className="wn-topbar-side is-right">
            <p>4°C</p>
            <p className="is-time">00:12</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// 언어·도움말 버튼 — 피그마 534:6071부터 웰컴도 다른 장면과 같은 작은 버튼
export function BottomBar({ scene }: { scene: Scene }) {
  return (
    <AnimatePresence>
      {isIntroScene(scene) && (
        <motion.div key="bottom" className="wn-bottombar" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }} transition={{ duration: 0.8, ease: smoothEase }}>
          <button type="button" className="wn-pill-btn" onClick={(e) => e.stopPropagation()}>
            <img src={icGlobe} alt="" width={27.73} height={27.73} />
            English
          </button>
          <button type="button" className="wn-pill-btn" onClick={(e) => e.stopPropagation()}>
            <img src={icHelp} alt="" width={27.73} height={27.73} />
            Help
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
