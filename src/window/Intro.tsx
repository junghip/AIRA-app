import { AnimatePresence, motion } from 'motion/react'
import checkBlue from '../assets/window/v3-check-blue.svg'
import checkGray from '../assets/window/v3-check-gray.svg'
import seatIcon from '../assets/window/v3-seat-icon.svg'
import trackDest from '../assets/window/v3-track-dest.svg'
import trackOrigin from '../assets/window/v3-track-origin.svg'
import { smoothEase } from '../motion/transitions'
import type { Scene } from './scenes'

// 피그마 "창문 디벨롭할게요" 532:3796 → 532:3885 → 532:3972
// 좌석 카드 4장이 제자리에서 빈 자리 → 탑승 → 체크인으로 바뀌고, 마지막엔 낮게 접히며 진행선이 차오름
type Step = 'waiting' | 'seated' | 'starting'

const PEOPLE = [
  { seat: 'A1', name: 'Min Cole', short: 'Min' },
  { seat: 'A2', name: 'Halle Kim', short: 'Halle' },
  { seat: 'B1', name: 'Noel Gray', short: 'Noel' },
  { seat: 'B2', name: 'Eden Hall', short: 'Eden' },
]

type CardState = 'open' | 'boarded' | 'checked'

function stateOf(step: Step, i: number): CardState {
  if (step === 'waiting') return i < 2 ? 'boarded' : 'open'
  if (step === 'seated') return 'boarded'
  return 'checked'
}

// 카드 위치·크기 — 280px 카드 4장, 32px 간격으로 가운데 정렬 (피그마 그대로)
const CARD_W = 280
const CARD_LEFT = (i: number) => 352 + i * (CARD_W + 32)
const CARD_TOP = 457
const HEIGHT: Record<CardState, number> = { open: 320, boarded: 320, checked: 189 }

const content = {
  initial: { opacity: 0, y: 10, filter: 'blur(6px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.55, ease: smoothEase, delay: 0.25 } },
  exit: { opacity: 0, filter: 'blur(6px)', transition: { duration: 0.2 } },
}

function SeatCard({ step, i }: { step: Step; i: number }) {
  const p = PEOPLE[i]
  const state = stateOf(step, i)
  const filled = state !== 'open'
  // 방금 앉은 사람은 살짝 늦게, 차례로
  const justSat = step === 'seated' && i >= 2

  return (
    <motion.div
      className="wn-seat"
      initial={{ left: CARD_LEFT(i), top: CARD_TOP, width: CARD_W, height: HEIGHT[state], opacity: 0, y: 40 }}
      animate={{
        left: CARD_LEFT(i),
        top: CARD_TOP,
        height: HEIGHT[state],
        opacity: 1,
        y: 0,
        borderRadius: filled ? 30 : 40,
        backgroundColor: filled ? 'rgba(10,18,28,0.4)' : 'rgba(255,255,255,0.1)',
      }}
      exit={{ opacity: 0, y: 20, transition: { duration: 0.4 } }}
      transition={{
        type: 'spring',
        stiffness: 150,
        damping: 24,
        delay: step === 'starting' ? i * 0.06 : justSat ? 0.35 + (i - 2) * 0.25 : 0,
        opacity: { duration: 0.6, delay: step === 'waiting' ? 0.5 + i * 0.08 : 0 },
        y: { type: 'spring', stiffness: 150, damping: 22, delay: step === 'waiting' ? 0.5 + i * 0.08 : 0 },
      }}
    >
      {/* 테두리 — 빈 자리는 점선, 탑승하면 하늘빛 실선 + 안쪽 빛 */}
      <motion.span className="wn-seat-edge is-dashed" initial={false} animate={{ opacity: filled ? 0 : 1 }} transition={{ duration: 0.5, delay: justSat ? 0.35 + (i - 2) * 0.25 : 0 }} />
      <motion.span className="wn-seat-edge is-blue" initial={false} animate={{ opacity: filled ? 1 : 0 }} transition={{ duration: 0.7, delay: justSat ? 0.35 + (i - 2) * 0.25 : 0 }} />

      <div className="wn-seat-head">
        <p>Seat {p.seat}</p>
        <AnimatePresence mode="popLayout" initial={false}>
          {state === 'checked' ? (
            <motion.p key="in" className="is-blue" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, ease: smoothEase, delay: 0.3 + i * 0.08 }}>
              Checked in
            </motion.p>
          ) : (
            <motion.span key="check" className="wn-seat-check" exit={{ opacity: 0, scale: 0.6, transition: { duration: 0.2 } }}>
              <img src={checkGray} alt="" width={24} height={24} />
              {/* 앉는 순간 회색 체크가 하늘색으로 톡 */}
              <motion.img
                className="is-on"
                src={checkBlue}
                alt=""
                width={24}
                height={24}
                initial={false}
                animate={{ opacity: filled ? 1 : 0, scale: filled ? [1, 1.35, 1] : 0.6 }}
                transition={{ duration: 0.5, ease: smoothEase, delay: justSat ? 0.75 + (i - 2) * 0.25 : 0 }}
              />
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence mode="popLayout" initial={false}>
        {state === 'open' && (
          <motion.div key="free" className="wn-seat-free" {...content}>
            <img src={seatIcon} alt="" width={100} height={100} />
            <div className="wn-seat-free-text">
              <p className="wn-seat-code">{p.seat}</p>
              <p className="wn-seat-status">Available</p>
            </div>
          </motion.div>
        )}
        {state === 'boarded' && (
          <motion.div key="boarded" className="wn-seat-boarded" {...content} animate={{ ...content.animate, transition: { ...content.animate.transition, delay: justSat ? 0.55 + (i - 2) * 0.25 : 0.25 } }}>
            {/* 모두 타면 얼굴 자리가 조금 커짐 */}
            <motion.div className="wn-seat-avatar" initial={false} animate={{ width: step === 'seated' ? 100 : 74.919, height: step === 'seated' ? 100 : 74.919, fontSize: step === 'seated' ? '24px' : '22px' }} transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.2 }}>
              {p.short}
            </motion.div>
            <div className="wn-seat-info">
              <p className="wn-seat-name">{p.name}</p>
              <p className="wn-seat-line">Boarding pass matched</p>
            </div>
          </motion.div>
        )}
        {state === 'checked' && (
          <motion.div key="checked" className="wn-seat-info is-checked" {...content}>
            <p className="wn-seat-name">{p.name}</p>
            <p className="wn-seat-line">Boarding pass matched</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

const lineIn = {
  initial: { opacity: 0, y: 18, filter: 'blur(8px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: smoothEase, delay: 0.2 } },
  exit: { opacity: 0, y: -10, filter: 'blur(8px)', transition: { duration: 0.3 } },
}

// 진행선 — 출발점에서 343.9px까지 (피그마 Progress 너비)
const TRACK_DONE = 343.936

export default function Intro({ scene }: { scene: Scene }) {
  const step = (scene === 'waiting' || scene === 'seated' || scene === 'starting' ? scene : null) as Step | null
  const title = step === 'waiting' ? 'Waiting for everyone' : 'Starting your journey'

  return (
    <AnimatePresence>
      {step && (
        <motion.div key="intro" className="wn-layer wn-noclick" exit={{ opacity: 0, filter: 'blur(12px)', transition: { duration: 0.6 } }}>
          {/* 항공편 칩 */}
          <motion.div className="wn-trip-chip" style={{ x: '-50%' }} initial={{ opacity: 0, y: -12, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.7, ease: smoothEase, delay: 0.15 }}>
            <span className="is-flight">LH 702</span>
            <span>Berlin</span>
            <span className="is-dot">·</span>
            <span>Gate 16</span>
            <span className="is-dot">·</span>
            <span>Boarding 14:20</span>
          </motion.div>

          <AnimatePresence>
            <motion.p key={title} className="wn-intro-title" {...lineIn}>
              {title}
            </motion.p>
          </AnimatePresence>

          <AnimatePresence>
            {step === 'waiting' ? (
              <motion.p key="count" className="wn-intro-sub" {...lineIn}>
                2 of 4 seated
              </motion.p>
            ) : (
              <motion.div key="checked" className="wn-intro-sub" {...lineIn}>
                <motion.img src={checkBlue} alt="" width={24} height={24} initial={{ scale: 0, rotate: -40 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 420, damping: 15, delay: 0.5 }} />
                All checked
              </motion.div>
            )}
          </AnimatePresence>

          {PEOPLE.map((_, i) => (
            <SeatCard key={i} step={step} i={i} />
          ))}

          {/* 출발 — 터미널에서 게이트까지 진행선이 차오르고, 앞머리 빛이 함께 달림 */}
          <AnimatePresence>
            {step === 'starting' && (
              <motion.div key="route" className="wn-intro-route" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.8, ease: smoothEase, delay: 0.5 }}>
                <div className="wn-intro-end">
                  <p className="wn-intro-end-label">FROM</p>
                  <p className="wn-intro-end-value">Terminal 1</p>
                </div>
                <div className="wn-intro-track">
                  <motion.img src={trackOrigin} alt="" width={16} height={16} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 16, delay: 0.8 }} />
                  <div className="wn-intro-track-line">
                    <motion.span className="wn-intro-track-done" initial={{ width: 0 }} animate={{ width: TRACK_DONE }} transition={{ duration: 3, ease: smoothEase, delay: 1 }}>
                      <motion.i className="wn-intro-track-head" animate={{ opacity: [0.5, 1, 0.5], scale: [0.9, 1.15, 0.9] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }} />
                    </motion.span>
                  </div>
                  <img src={trackDest} alt="" width={16} height={16} />
                </div>
                <div className="wn-intro-end is-right">
                  <p className="wn-intro-end-label">TO</p>
                  <p className="wn-intro-end-value">Gate 16</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
