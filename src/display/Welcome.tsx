import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import logoSmall from '../assets/display/logo-small.svg'
import logoWelcome from '../assets/display/logo-welcome.svg'
import scanArrow from '../assets/display/scan-arrow.svg'
import scanIcon from '../assets/display/scan-icon.svg'
import scannerCorners from '../assets/display/scanner-corners.svg'
import { smoothEase, softSpring } from '../motion/transitions'
import BoardingPass, { PASS_H, PASS_W } from '../screens/pass/BoardingPass'
import './Welcome.css'

// 피그마 "첫 웰컴" 6장: 로고 → 탑승권 안내 → 오른쪽 스캐너 → 스캔 중 → 확인 → 환영
const STEPS = ['intro', 'prompt', 'scanner', 'scanning', 'confirmed', 'welcome'] as const
type Step = (typeof STEPS)[number]

// 손대지 않아도 저절로 넘어가는 시간(ms) — 화면을 누르면 바로 다음으로
const HOLD: Record<Step, number> = {
  intro: 3000,
  prompt: 4200,
  scanner: 4800,
  scanning: 2800,
  confirmed: 2600,
  welcome: 2800,
}

const COPY: Record<Exclude<Step, 'intro'>, [string, string]> = {
  prompt: ['Start your journey with your boarding pass.', 'Scan your boarding pass QR code to the screen on your right.'],
  scanner: ['Start your journey with your boarding pass.', 'Scan your boarding pass QR code to the screen on your right.'],
  scanning: ['Start your trip with your boarding pass', 'Start your trip with your boarding pass'],
  confirmed: ['Welcome, Haeun. Your journey starts here.', 'Boarding pass confirmed'],
  welcome: ['Welcome, Haeun. Your journey starts here.', 'Boarding pass confirmed'],
}

// 패널 안 탑승권: 피그마 ticketShape 위치(332×569)에 맞춘 배율
const PASS_SCALE = 1.974

const fadeBlur = {
  initial: { opacity: 0, filter: 'blur(10px)' },
  animate: { opacity: 1, filter: 'blur(0px)' },
  exit: { opacity: 0, filter: 'blur(10px)' },
}

export default function Welcome({ onDone }: { onDone: () => void }) {
  const [i, setI] = useState(0)
  const step = STEPS[i]
  const next = () => (i < STEPS.length - 1 ? setI(i + 1) : onDone())

  useEffect(() => {
    const t = setTimeout(next, HOLD[step])
    return () => clearTimeout(t)
  })

  const panelOpen = step === 'scanner' || step === 'scanning' || step === 'confirmed'
  const centered = step === 'prompt' || step === 'welcome'
  const copy = step === 'intro' ? null : COPY[step]
  // 문구가 바뀌는 단계에서만 글자를 다시 그림 (prompt→scanner는 위치만 이동)
  const copyKey = copy?.join('|')

  return (
    <div className="wl" onPointerDown={next}>
      {/* 1. 로고 + Welcome aboard AIRA */}
      <AnimatePresence>
        {step === 'intro' && (
          <motion.div key="intro" className="wl-intro" exit={{ opacity: 0, scale: 0.96, filter: 'blur(14px)' }} transition={{ duration: 0.7, ease: smoothEase }}>
            <motion.img
              className="wl-intro__logo"
              src={logoWelcome}
              alt="AIRA"
              initial={{ opacity: 0, y: 30, filter: 'blur(16px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 1.4, ease: smoothEase }}
            />
            <motion.p
              className="wl-intro__text"
              initial={{ opacity: 0, y: 20, letterSpacing: '12px' }}
              animate={{ opacity: 1, y: 0, letterSpacing: '1.6px' }}
              transition={{ duration: 1.6, delay: 0.5, ease: smoothEase }}
            >
              Welcome aboard AIRA
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. 안내 화면의 은은한 빛 띠 + 작은 로고 + 스캔 힌트 */}
      <AnimatePresence>
        {step === 'prompt' && (
          <motion.div key="prompt-deco" className="ds-layer" {...fadeBlur} transition={{ duration: 0.9, ease: smoothEase }}>
            <motion.div
              className="wl-glow"
              animate={{ opacity: [0.75, 1, 0.75], scaleX: [0.96, 1.02, 0.96] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            />
            <img className="wl-logo-small" src={logoSmall} alt="AIRA" />
            <div className="wl-hint">
              <motion.img
                className="wl-hint__scan"
                src={scanIcon}
                alt=""
                animate={{ scale: [1, 0.9, 1] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div className="wl-hint__arrow" animate={{ x: [0, 14, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}>
                <img src={scanArrow} alt="" />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 안내 문구 — 가운데 ↔ 왼쪽으로 미끄러지며, 문구가 바뀔 땐 흐려졌다 선명해짐 */}
      {copy && (
        <motion.div className={`wl-copy ${centered ? 'wl-copy--center' : 'wl-copy--left'}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div key={copyKey} className="wl-copy__lines" layout="position" transition={softSpring} {...fadeBlur}>
              <motion.p className="wl-copy__head" layout="position" transition={softSpring}>
                {copy[0]}
              </motion.p>
              <motion.p
                className={`wl-copy__sub ${step === 'prompt' || step === 'scanner' ? 'wl-copy__sub--small' : ''}`}
                layout="position"
                transition={softSpring}
              >
                {copy[1]}
              </motion.p>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      )}

      {/* 3~5. 오른쪽 스캐너 패널 */}
      <AnimatePresence>
        {panelOpen && (
          <motion.div
            key="panel"
            className="wl-panel"
            initial={{ x: 700, opacity: 0 }}
            animate={{ x: 0, opacity: 1, backgroundColor: step === 'confirmed' ? 'rgba(160, 219, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)' }}
            exit={{ x: 700, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 120, damping: 22 }}
          >
            {/* 어두운 스캐너 → 스캔이 시작되면 유리처럼 맑아짐 */}
            <motion.div className="wl-panel__dark" animate={{ opacity: step === 'scanner' ? 1 : 0 }} transition={{ duration: 0.8 }} />

            <AnimatePresence>
              {step === 'scanner' && (
                <motion.div key="scanner" className="ds-layer" exit={{ opacity: 0, scale: 0.94 }} transition={{ duration: 0.5 }}>
                  <div className="wl-scan-square" />
                  <motion.img
                    className="wl-scan-corners"
                    src={scannerCorners}
                    alt=""
                    animate={{ scale: [1, 0.965, 1], opacity: [0.85, 1, 0.85] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <button className="wl-checkin" type="button">
                    Haven’t checked in?
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {(step === 'scanning' || step === 'confirmed') && (
              <motion.div
                className="wl-pass"
                style={{ width: PASS_W, height: PASS_H, scale: PASS_SCALE }}
                initial={{ opacity: 0, y: 260 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 90, damping: 18 }}
              >
                <BoardingPass />
              </motion.div>
            )}

            <AnimatePresence>
              {step === 'scanning' && (
                <motion.div
                  key="beam"
                  className="wl-beam"
                  initial={{ opacity: 0, y: 0 }}
                  animate={{ opacity: 1, y: [0, 330, -150, 0] }}
                  exit={{ opacity: 0, scaleX: 0.3 }}
                  transition={{ y: { duration: 2.4, delay: 0.4, ease: 'easeInOut' }, opacity: { duration: 0.4, delay: 0.3 } }}
                />
              )}
            </AnimatePresence>

            {/* 확인되는 순간 패널 안쪽에서 번지는 빛 */}
            <AnimatePresence>
              {step === 'confirmed' && (
                <motion.div
                  key="flash"
                  className="wl-flash"
                  initial={{ opacity: 0.9, scale: 0.4 }}
                  animate={{ opacity: 0, scale: 1.6 }}
                  transition={{ duration: 1.4, ease: smoothEase }}
                />
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
