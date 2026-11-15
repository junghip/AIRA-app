import { AnimatePresence, motion } from 'motion/react'
import icGlobe from '../assets/window/ic-globe.svg'
import icHelp from '../assets/window/ic-help.svg'
import icSparkle from '../assets/window/ic-sparkle.svg'
import statusDot from '../assets/window/status-dot.svg'
import { smoothEase } from '../motion/transitions'
import type { Scene } from './scenes'

// 탑승 안내 화면의 위·아래 바 — 차량 번호·시각, 언어·도움말 버튼, 가운데 안내 한 줄
const HINT: Partial<Record<Scene, { icon?: string; text: string }>> = {
  seat: { icon: icSparkle, text: 'No boarding pass scan needed — sit down and we’ll do the rest' },
  starting: { text: 'Please keep your seatbelt fastened while moving' },
}

const show = (s: Scene) => s === 'welcome' || s === 'seat' || s === 'waiting' || s === 'starting'

export function TopBar({ scene }: { scene: Scene }) {
  const visible = show(scene) || scene === 'arrivedGate'
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="top"
          className="wn-topbar"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.8, ease: smoothEase }}
        >
          <div className="wn-topbar-side">
            {/* 운행 중 표시 — 천천히 숨 쉬는 점 */}
            <motion.img src={statusDot} alt="" width={12.182} height={12.182} animate={{ opacity: [1, 0.35, 1] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }} />
            <p>AIRA 07</p>
            <AnimatePresence initial={false}>
              {scene !== 'arrivedGate' && (
                <motion.span key="t2" className="wn-topbar-term" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <span className="is-dot">·</span>
                  <span>Terminal 2</span>
                </motion.span>
              )}
            </AnimatePresence>
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

export function BottomBar({ scene }: { scene: Scene }) {
  const hint = HINT[scene]
  return (
    <AnimatePresence>
      {show(scene) && (
        <motion.div key="bottom" className="wn-bottombar" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }} transition={{ duration: 0.8, ease: smoothEase }}>
          <button type="button" className="wn-pill-btn" onClick={(e) => e.stopPropagation()}>
            <img src={icGlobe} alt="" width={27.73} height={27.73} />
            English · 한국어
          </button>
          <div className="wn-hint-slot">
            <AnimatePresence mode="wait">
              {hint && (
                <motion.p
                  key={hint.text}
                  className="wn-hint"
                  initial={{ opacity: 0, y: 10, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -6, filter: 'blur(6px)' }}
                  transition={{ duration: 0.6, ease: smoothEase, delay: 0.5 }}
                >
                  {hint.icon && (
                    <motion.img src={hint.icon} alt="" width={34.8} height={34.8} animate={{ rotate: [0, 90] }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }} />
                  )}
                  {hint.text}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
          <button type="button" className="wn-pill-btn" onClick={(e) => e.stopPropagation()}>
            <img src={icHelp} alt="" width={27.73} height={27.73} />
            Help
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
