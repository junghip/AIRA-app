import { AnimatePresence, motion } from 'motion/react'
import { useEffect } from 'react'
import checkLong from '../assets/display/check-long.svg'
import checkShort from '../assets/display/check-short.svg'
import cornerBl from '../assets/display/corner-bl.svg'
import cornerBr from '../assets/display/corner-br.svg'
import cornerTl from '../assets/display/corner-tl.svg'
import cornerTr from '../assets/display/corner-tr.svg'
import logoSmall from '../assets/display/logo-small.svg'
import logoWelcome from '../assets/display/logo-welcome.svg'
import qrCode from '../assets/display/qr-code.svg'
import scanArrow from '../assets/display/scan-arrow.svg'
import scanIcon from '../assets/display/scan-icon.svg'
import startArrowHead from '../assets/display/start-arrow-head.svg'
import startArrowLine from '../assets/display/start-arrow-line.svg'
import stepDone from '../assets/display/step-done.svg'
import stepTodo from '../assets/display/step-todo.svg'
import welcomeCheck from '../assets/display/welcome-check.svg'
import welcomeRing from '../assets/display/welcome-ring.svg'
import { smoothEase, softSpring, spring } from '../motion/transitions'
import BoardingPass, { PASS_H, PASS_W } from '../screens/pass/BoardingPass'
import { usePrimaryCopy, useSharedState } from './shared'
import './Welcome.css'

// 피그마 Section 8 "첫 웰컴" 6장: 시작 → 안내 → 스캐너(STEP 1 OF 2) → 읽는 중 → 확인 → 환영
const STEPS = ['intro', 'prompt', 'scanner', 'reading', 'confirmed', 'welcome'] as const
type Step = (typeof STEPS)[number]

// 손대지 않아도 저절로 넘어가는 시간(ms) — 화면을 누르면 바로 다음으로
const HOLD: Record<Step, number> = {
  intro: 4500,
  prompt: 3000,
  scanner: 4800,
  reading: 3400,
  confirmed: 2600,
  welcome: 3800,
}

const LANGS = [
  { label: 'EN', x: 1811.6, w: 91.792 },
  { label: '한국어', x: 1917.9, w: 118.364 },
  { label: '中文', x: 2051.1, w: 118.364 },
  { label: '日本語', x: 2184.6, w: 118.364 },
]

const CHECKS = ['QR code detected', 'LH 702 ・ Seoul Incheon → Berlin', 'Syncing gate, boarding time and seat']

const CHIPS = [
  { label: 'Gate 16', x: 801.2, w: 148, bright: true },
  { label: 'Boards 14:20', x: 971.2, w: 209 },
  { label: 'Seat 34A', x: 1202, w: 156 },
  { label: 'Baggage 1 bag', x: 1380, w: 224 },
]

// 패널 안 탑승권: 피그마 ticketShape 위치(332×569)에 맞춘 배율
const PASS_SCALE = 1.974

const fadeBlur = {
  initial: { opacity: 0, filter: 'blur(10px)' },
  animate: { opacity: 1, filter: 'blur(0px)' },
  exit: { opacity: 0, filter: 'blur(10px)' },
}

// 버튼을 눌러도 화면 전체 "다음으로"가 같이 눌리지 않게
const stop = { onPointerDown: (e: React.PointerEvent) => e.stopPropagation() }

// ?step=scanner 처럼 열면 그 화면에서 멈춰 있음 (디자인 확인용 — 누르면 다음으로)
const pinned = new URLSearchParams(window.location.search).get('step') as Step | null
const START = Math.max(0, STEPS.indexOf(pinned as Step))

export default function Welcome({ onDone, autoplay = false }: { onDone: () => void; autoplay?: boolean }) {
  const [i, setI] = useSharedState('wl.i', START)
  const [lang, setLang] = useSharedState('wl.lang', 'EN')
  const step = STEPS[i]
  const next = () => (i < STEPS.length - 1 ? setI(i + 1) : onDone())

  // 저절로 넘기는 타이머는 한 조각만 (여러 조각이 동시에 넘기지 않게)
  const primary = usePrimaryCopy()
  useEffect(() => {
    if (pinned || !primary) return
    const t = setTimeout(next, HOLD[step])
    return () => clearTimeout(t)
  })

  const panelOpen = step === 'scanner' || step === 'reading' || step === 'confirmed'
  const checking = step === 'reading' || step === 'confirmed'
  // 읽는 중: 첫째·둘째 줄이 차례로 체크, 셋째 줄 진행 / 확인: 모두 완료 (피그마의 체크 표시 그대로)
  const doneCount = step === 'confirmed' ? 3 : 2

  return (
    // autoplay면 화면 전체가 눌리지 않고 정해진 시간대로만 흘러감
    <div className={`wl ${autoplay ? 'wl--autoplay' : ''}`} onPointerDown={autoplay ? undefined : next}>
      {/* 1. 시작 화면 */}
      <AnimatePresence>
        {step === 'intro' && (
          <motion.div key="intro" className="ds-layer" exit={{ opacity: 0, filter: 'blur(14px)' }} transition={{ duration: 0.7, ease: smoothEase }}>
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
              initial={{ opacity: 0, y: 20, letterSpacing: '10px' }}
              animate={{ opacity: 1, y: 0, letterSpacing: '1.5px' }}
              transition={{ duration: 1.6, delay: 0.5, ease: smoothEase }}
            >
              Welcome aboard AIRA
            </motion.p>

            <motion.div className="wl-meta" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ ...softSpring, delay: 1 }}>
              <span style={{ left: 86 }}>Thu, Dec 24 </span>
              <span style={{ left: 327 }}>12:18</span>
              <span style={{ left: 477 }}>4℃ Rainy </span>
            </motion.div>

            {LANGS.map((l, n) => (
              <motion.button
                key={l.label}
                type="button"
                className="wl-lang"
                style={{ left: l.x, width: l.w }}
                aria-pressed={l.label === lang}
                onClick={() => setLang(l.label)}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                whileTap={{ scale: 0.92 }}
                transition={{ ...softSpring, delay: 1.1 + n * 0.06 }}
                {...stop}
              >
                {l.label === lang && <motion.span layoutId="wl-lang-thumb" className="wl-lang__thumb" transition={spring} />}
                <span className="wl-lang__text">{l.label}</span>
              </motion.button>
            ))}

            <motion.div className="wl-start" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ ...softSpring, delay: 1.4 }}>
              <p>Scan to start</p>
              <motion.div className="wl-start__arrow" animate={{ x: [0, 12, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}>
                <img className="wl-start__line" src={startArrowLine} alt="" />
                <img className="wl-start__head" src={startArrowHead} alt="" />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2~6. 위쪽 작은 로고 + 뒤로 */}
      <AnimatePresence>
        {step !== 'intro' && (
          <motion.img key="logo" className="wl-logo-small" src={logoSmall} alt="AIRA" {...fadeBlur} transition={{ duration: 0.8, delay: 0.3 }} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {step !== 'intro' && step !== 'welcome' && (
          <motion.button
            key="back"
            type="button"
            className="wl-back"
            onClick={() => setI(i - 1)}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            whileTap={{ scale: 0.92 }}
            transition={softSpring}
            {...stop}
          >
            ← Back
          </motion.button>
        )}
      </AnimatePresence>

      {/* 2. 안내 */}
      <AnimatePresence>
        {step === 'prompt' && (
          <motion.div key="prompt" className="ds-layer" {...fadeBlur} transition={{ duration: 0.8, ease: smoothEase }}>
            <motion.div
              className="wl-glow"
              animate={{ opacity: [0.75, 1, 0.75], scaleX: [0.96, 1.02, 0.96] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.p className="wl-prompt" initial={{ y: 24 }} animate={{ y: 0 }} transition={{ duration: 1, ease: smoothEase }}>
              Start your journey with your boarding pass.
            </motion.p>
            {/* 오른쪽 스캐너를 가리키는 힌트 */}
            <motion.img
              className="wl-hint__scan"
              src={scanIcon}
              alt=""
              animate={{ scale: [1, 0.9, 1] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div className="wl-hint__arrow" animate={{ x: [0, 12, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}>
              <img src={scanArrow} alt="" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. 스캐너 안내 / 4~5. 읽는 중·확인 체크리스트 */}
      <AnimatePresence mode="wait">
        {step === 'scanner' && (
          <motion.div key="scan-copy" className="ds-layer" {...fadeBlur} transition={{ duration: 0.5 }}>
            <motion.p className="wl-stepno" initial={{ x: -20 }} animate={{ x: 0 }} transition={{ ...softSpring, delay: 0.1 }}>
              STEP 1 OF 2
            </motion.p>
            <motion.p className="wl-scan-head" initial={{ x: -20 }} animate={{ x: 0 }} transition={{ ...softSpring, delay: 0.18 }}>
              Scan your boarding pass QR code to the scanner on your right.
            </motion.p>
            <motion.div className="wl-scan-sub" initial={{ x: -20 }} animate={{ x: 0 }} transition={{ ...softSpring, delay: 0.26 }}>
              <img src={qrCode} alt="" />
              <p>Hold the QR code on your papper pass or mobile pass</p>
            </motion.div>
          </motion.div>
        )}
        {checking && (
          <motion.div key="check-copy" className="ds-layer" {...fadeBlur} transition={{ duration: 0.5 }}>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.p key={step} className="wl-check-title" {...fadeBlur} transition={{ duration: 0.45 }}>
                {step === 'confirmed' ? 'Boarding pass confirmed' : 'Reading your boarding pass...'}
              </motion.p>
            </AnimatePresence>
            {CHECKS.map((c, n) => (
              <CheckRow key={c} n={n} text={c} done={n < doneCount} active={n === doneCount} delay={step === 'reading' ? 0.3 + n * 1.1 : 0.1} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3~5. 오른쪽 스캐너 패널 */}
      <AnimatePresence>
        {panelOpen && (
          <motion.div
            key="panel"
            className="wl-panel"
            initial={{ x: 700, opacity: 0 }}
            animate={{
              x: 0,
              opacity: 1,
              backgroundColor: step === 'confirmed' ? 'rgba(193, 231, 255, 0.2)' : 'rgba(255, 255, 255, 0.2)',
            }}
            exit={{ x: 700, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 120, damping: 22 }}
          >
            {/* 어두운 스캐너 → 읽기 시작하면 유리처럼 맑아짐 */}
            <motion.div
              className="wl-panel__dark"
              initial={{ opacity: step === 'scanner' ? 1 : 0 }}
              animate={{ opacity: step === 'scanner' ? 1 : 0 }}
              transition={{ duration: 0.8 }}
            />

            <AnimatePresence>
              {step === 'scanner' && (
                <motion.div key="scanner" className="ds-layer" exit={{ opacity: 0, scale: 0.94 }} transition={{ duration: 0.5 }}>
                  <div className="wl-scan-square" />
                  <motion.div className="wl-corners" animate={{ scale: [1, 0.965, 1] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
                    <img className="wl-corner wl-corner--tl" src={cornerTl} alt="" />
                    <img className="wl-corner wl-corner--tr" src={cornerTr} alt="" />
                    <img className="wl-corner wl-corner--br" src={cornerBr} alt="" />
                    <img className="wl-corner wl-corner--bl" src={cornerBl} alt="" />
                  </motion.div>
                  {/* QR을 기다리며 위아래로 훑는 선 */}
                  <motion.div
                    className="wl-scanline"
                    animate={{ y: [0, -230, 90, 0] }}
                    transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <motion.p className="wl-waiting" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.8, repeat: Infinity }}>
                    Waiting for QR code...
                  </motion.p>
                  <button className="wl-checkin" type="button" {...stop}>
                    Haven’t checked in?
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {checking && (
              <motion.div
                className="wl-pass"
                style={{ width: PASS_W, height: PASS_H, scale: PASS_SCALE }}
                initial={{ opacity: 0, y: 260 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 90, damping: 18 }}
              >
                <BoardingPass passenger="KIM / HABIN" gate="16" />
              </motion.div>
            )}

            <AnimatePresence>
              {step === 'reading' && (
                <motion.div
                  key="beam"
                  className="wl-beam"
                  initial={{ opacity: 0, y: 0 }}
                  animate={{ opacity: 1, y: [0, 330, -150, 0] }}
                  exit={{ opacity: 0, scaleX: 0.3 }}
                  transition={{ y: { duration: 2.6, delay: 0.4, ease: 'easeInOut' }, opacity: { duration: 0.4, delay: 0.3 } }}
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

      {/* 6. 환영 — 체크, 내 정보 칩, 대시보드 여는 중 */}
      <AnimatePresence>
        {step === 'welcome' && (
          <motion.div key="welcome" className="ds-layer" {...fadeBlur} transition={{ duration: 0.6 }}>
            <motion.img
              className="wl-done-ring"
              src={welcomeRing}
              alt=""
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ ...spring, delay: 0.1 }}
            />
            <motion.img
              className="wl-done-check"
              src={welcomeCheck}
              alt=""
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 18, delay: 0.35 }}
            />
            <motion.div className="wl-done-copy" initial={{ y: 24 }} animate={{ y: 0 }} transition={{ duration: 1, ease: smoothEase }}>
              <p>Welcome, Seha. Your journey starts here.</p>
              <p>Boarding pass confirmed</p>
            </motion.div>
            {CHIPS.map((c, n) => (
              <motion.span
                key={c.label}
                className={`wl-chip ${c.bright ? 'wl-chip--bright' : ''}`}
                style={{ left: c.x, width: c.w }}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ ...softSpring, delay: 0.5 + n * 0.08 }}
              >
                {c.label}
              </motion.span>
            ))}
            <motion.p className="wl-opening" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
              Adjusting your seat ・ Opening your dashboard
            </motion.p>
            <div className="wl-progress">
              <motion.span initial={{ width: 0 }} animate={{ width: 374 }} transition={{ duration: HOLD.welcome / 1000 - 0.6, delay: 0.6, ease: 'easeInOut' }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function CheckRow({ n, text, done, active, delay }: { n: number; text: string; done: boolean; active: boolean; delay: number }) {
  const top = 420 + n * 48.5
  return (
    <motion.div className="wl-check" style={{ top }} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ ...softSpring, delay: 0.15 + n * 0.1 }}>
      <span className="wl-check__dot">
        <img src={stepTodo} alt="" />
        {/* 진행 중이면 차오르며 깜빡, 끝나면 하얀 원 + 체크 */}
        <motion.img
          src={stepDone}
          alt=""
          animate={done ? { opacity: 1, scale: 1 } : active ? { opacity: [0.2, 0.9, 0.2], scale: 1 } : { opacity: 0, scale: 0.4 }}
          transition={done ? { ...spring, delay } : active ? { duration: 1.2, repeat: Infinity } : { duration: 0.2 }}
        />
        <motion.span className="wl-check__mark" initial={false} animate={{ opacity: done ? 1 : 0, scale: done ? 1 : 0.5 }} transition={{ ...spring, delay: done ? delay + 0.1 : 0 }}>
          <img className="wl-check__short" src={checkShort} alt="" />
          <img className="wl-check__long" src={checkLong} alt="" />
        </motion.span>
      </span>
      <p>{text}</p>
    </motion.div>
  )
}
