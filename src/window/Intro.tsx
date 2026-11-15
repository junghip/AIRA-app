import { AnimatePresence, motion } from 'motion/react'
import icAllCheck from '../assets/window/ic-all-check.svg'
import icSeatCheck from '../assets/window/ic-seat-check.svg'
import icSeat from '../assets/window/ic-seat.svg'
import trackDest from '../assets/window/track-dest.svg'
import trackOrigin from '../assets/window/track-origin.svg'
import { smoothEase } from '../motion/transitions'
import type { Scene } from './scenes'

// 피그마 "창문" 525:2745 → 525:2574 → 525:2604
// 좌석 카드 4장이 제자리에서 빈 좌석 → 탑승 → 체크인으로 바뀜
type Step = 'seat' | 'waiting' | 'starting'

const PEOPLE = [
  { seat: 'A1', name: 'Jiho Kim', initials: 'JK', no: '32A' },
  { seat: 'A2', name: 'Sora Min', initials: 'SM', no: '32B' },
  { seat: 'B1', name: 'Minjun Lee', initials: 'ML', no: '32C' },
  { seat: 'B2', name: 'Yuna Park', initials: 'YP', no: '32D' },
]

type CardState = 'available' | 'open' | 'boarded' | 'checked'

function stateOf(step: Step, i: number): CardState {
  if (step === 'seat') return 'available'
  if (step === 'waiting') return i < 2 ? 'boarded' : 'open'
  return 'checked'
}

// 카드 위치·크기 (피그마 좌표 그대로)
const BIG_LEFT = [301, 638, 975, 1312]
const BIG_W = [306, 306, 305, 306]
const SMALL_LEFT = [297, 634.68, 972.36, 1310.04]

function boxOf(step: Step, i: number) {
  if (step === 'starting') return { left: SMALL_LEFT[i], top: 480, width: 312.67, height: 171, borderRadius: 31.27 }
  if (step === 'waiting') return { left: [301.16, 638.16, 976, 1313][i], top: 479, width: BIG_W[i], height: 350, borderRadius: 37.3 }
  return { left: BIG_LEFT[i], top: 479, width: BIG_W[i], height: 348, borderRadius: 37.19 }
}

const BG: Record<CardState, string> = {
  available: 'rgba(255,255,255,0.2)',
  open: 'rgba(255,255,255,0.1)',
  boarded: 'rgba(10,18,28,0.42)',
  checked: 'rgba(10,18,28,0.4)',
}

const content = {
  initial: { opacity: 0, y: 10, filter: 'blur(6px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.55, ease: smoothEase, delay: 0.25 } },
  exit: { opacity: 0, filter: 'blur(6px)', transition: { duration: 0.2 } },
}

function SeatCard({ step, i }: { step: Step; i: number }) {
  const p = PEOPLE[i]
  const state = stateOf(step, i)
  return (
    <motion.div
      className="wn-seat"
      initial={{ ...boxOf(step, i), opacity: 0, y: 40, backgroundColor: BG[state] }}
      animate={{ ...boxOf(step, i), opacity: 1, y: 0, backgroundColor: BG[state] }}
      exit={{ opacity: 0, y: 20, transition: { duration: 0.4 } }}
      transition={{ type: 'spring', stiffness: 160, damping: 24, delay: step === 'seat' ? 0.5 + i * 0.08 : i * 0.06, opacity: { duration: 0.6, delay: step === 'seat' ? 0.5 + i * 0.08 : 0 } }}
    >
      {/* 테두리 4종 — 빈 좌석(흰 실선), 비어 있는 자리(점선), 탑승(하늘색), 체크인(얇은 흰선) */}
      <motion.span className="wn-seat-edge is-solid" animate={{ opacity: state === 'available' ? 1 : 0 }} />
      <motion.span className="wn-seat-edge is-dashed" animate={{ opacity: state === 'open' ? 1 : 0 }} />
      <motion.span className="wn-seat-edge is-blue" animate={{ opacity: state === 'boarded' ? 1 : 0 }} />
      <motion.span className="wn-seat-edge is-thin" animate={{ opacity: state === 'checked' ? 1 : 0 }} />

      <AnimatePresence mode="popLayout" initial={false}>
        {(state === 'available' || state === 'open') && (
          <motion.div key="free" className="wn-seat-free" {...content}>
            <img src={icSeat} alt="" width={80.582} height={80.582} />
            <div className="wn-seat-free-text">
              <p className="wn-seat-code">{p.seat}</p>
              <p className="wn-seat-status">Available</p>
            </div>
          </motion.div>
        )}
        {state === 'boarded' && (
          <motion.div key="boarded" className="wn-seat-boarded" {...content}>
            <div className="wn-seat-head">
              <p>Seat {p.seat}</p>
              {/* 앉는 순간 확인 표시가 톡 */}
              <motion.img src={icSeatCheck} alt="" width={37.46} height={37.46} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 16, delay: 0.55 + i * 0.15 }} />
            </div>
            <div className="wn-seat-avatar">{p.initials}</div>
            <div className="wn-seat-spacer" />
            <div className="wn-seat-info">
              <p className="wn-seat-name">{p.name}</p>
              <p className="wn-seat-line">Seat {p.no} on board</p>
              <p className="wn-seat-line">Boarding pass matched</p>
            </div>
          </motion.div>
        )}
        {state === 'checked' && (
          <motion.div key="checked" className="wn-seat-checked" {...content}>
            <div className="wn-seat-head is-small">
              <p>Seat {p.seat}</p>
              <p className="is-blue">Checked in</p>
            </div>
            <p className="wn-seat-name">{p.name}</p>
            <p className="wn-seat-line is-small">Seat {p.no} on board</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

const TITLE: Record<Step, { text: string; top: number }> = {
  seat: { text: 'Take a seat to get started', top: 255.89 },
  waiting: { text: 'Waiting for everyone', top: 256.84 },
  starting: { text: 'Starting your journey', top: 265.84 },
}

const lineIn = {
  initial: { opacity: 0, y: 18, filter: 'blur(8px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: smoothEase, delay: 0.2 } },
  exit: { opacity: 0, y: -10, filter: 'blur(8px)', transition: { duration: 0.3 } },
}

export default function Intro({ scene }: { scene: Scene }) {
  const step = (scene === 'seat' || scene === 'waiting' || scene === 'starting' ? scene : null) as Step | null

  return (
    <AnimatePresence>
      {step && (
        <motion.div key="intro" className="wn-layer wn-noclick" exit={{ opacity: 0, filter: 'blur(12px)', transition: { duration: 0.6 } }}>
          {/* 항공편 칩 — 첫 탑승자가 앉으면 나타남 */}
          <AnimatePresence>
            {step !== 'seat' && (
              <motion.div key="chip" className="wn-trip-chip" initial={{ opacity: 0, y: -12, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.7, ease: smoothEase }}>
                <span className="is-flight">KE 017</span>
                <span>Los Angeles</span>
                <span className="is-dot">·</span>
                <span>Gate 248</span>
                <span className="is-dot">·</span>
                <span>Boarding 01:40</span>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            <motion.p key={step} className="wn-intro-title" style={{ top: TITLE[step].top }} {...lineIn}>
              {TITLE[step].text}
            </motion.p>
          </AnimatePresence>

          <AnimatePresence>
            {step === 'seat' && (
              <motion.p key="sub" className="wn-intro-sub" {...lineIn}>
                Your seat will recognize your flight and guide you through check-in
              </motion.p>
            )}
            {step === 'waiting' && (
              <motion.div key="progress" className="wn-progress" {...lineIn}>
                <div className="wn-progress-segs">
                  {[0, 1, 2, 3].map((n) => (
                    <span key={n} className="wn-progress-seg">
                      <motion.span initial={{ scaleX: 0 }} animate={{ scaleX: n < 2 ? 1 : 0 }} transition={{ duration: 0.6, ease: smoothEase, delay: 0.6 + n * 0.25 }} />
                    </span>
                  ))}
                </div>
                <p>2 of 4 seated</p>
              </motion.div>
            )}
            {step === 'starting' && (
              <motion.div key="status" className="wn-all-checked" {...lineIn}>
                <motion.img src={icAllCheck} alt="" width={34.394} height={34.394} initial={{ scale: 0, rotate: -40 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 420, damping: 15, delay: 0.5 }} />
                <p>All checked</p>
              </motion.div>
            )}
          </AnimatePresence>

          {PEOPLE.map((_, i) => (
            <SeatCard key={i} step={step} i={i} />
          ))}

          {/* 출발 — 터미널에서 게이트까지 진행선이 차오름 */}
          <AnimatePresence>
            {step === 'starting' && (
              <motion.div key="route" className="wn-intro-route" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.8, ease: smoothEase, delay: 0.5 }}>
                <div className="wn-intro-end">
                  <p className="wn-intro-end-label">FROM</p>
                  <p className="wn-intro-end-value">Terminal 2</p>
                </div>
                <div className="wn-intro-track">
                  <img src={trackOrigin} alt="" width={18.76} height={18.76} />
                  <div className="wn-intro-track-line">
                    <motion.span className="wn-intro-track-done" initial={{ width: 0 }} animate={{ width: 343.936 }} transition={{ duration: 2.2, ease: smoothEase, delay: 0.9 }} />
                  </div>
                  <img src={trackDest} alt="" width={18.76} height={18.76} />
                </div>
                <div className="wn-intro-end is-right">
                  <p className="wn-intro-end-label">TO · 6 MIN</p>
                  <p className="wn-intro-end-value">Gate 248</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
