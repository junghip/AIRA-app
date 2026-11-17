import { motion, useSpring, useTransform } from 'motion/react'
import { useEffect, useRef } from 'react'
import arrowRight from '../assets/display/arrow-right-s.svg'
import btnBell from '../assets/display/btn-bell-v2.svg'
import btnDot from '../assets/display/btn-dot.svg'
import btnGlobe from '../assets/display/btn-globe-v2.svg'
import btnMoon from '../assets/display/btn-moon-v2.svg'
import btnPeople from '../assets/display/btn-people.svg'
import carProgress from '../assets/display/car-progress.png'
import check from '../assets/display/check.svg'
import chipCafe from '../assets/display/chip-cafe.svg'
import chipRestaurant from '../assets/display/chip-restaurant.svg'
import chipRestroom from '../assets/display/chip-restroom.svg'
import dialArc from '../assets/display/dial-arc-v2.svg'
import dialBtn from '../assets/display/dial-btn.svg'
import dialDot from '../assets/display/dial-dot-v2.svg'
import dialMinus from '../assets/display/dial-minus.svg'
import dialPlusH from '../assets/display/dial-plus-h.svg'
import dialPlusV from '../assets/display/dial-plus-v.svg'
import dialRing from '../assets/display/dial-ring.svg'
import dividerLine from '../assets/display/divider-line-v2.svg'
import flightPlane from '../assets/display/flight-plane.svg'
import flightTrail from '../assets/display/flight-trail-v2.svg'
import progressLine from '../assets/display/progress-line-v2.svg'
import qrCode from '../assets/display/qr-code.svg'
import seatTop from '../assets/display/seat-top.png'
import { softSpring, spring } from '../motion/transitions'
import Segmented from './Segmented'
import { useSharedState } from './shared'
import './HomePanel.css'

// 피그마 Section 8 "홈 - 기본 메뉴" (522:1293)
const enter = (delay: number) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { ...softSpring, delay },
})

// 함께 타는 승객 — 이름 동그라미 (피그마 534:6938)
const PASSENGERS = ['Min', 'Halle', 'Noel', 'Eden']

// 진행선 위 주변 시설 칩
const CHIPS = [
  { icon: chipRestroom, label: 'Restroom', time: '2 min', x: 23, w: 261, round: 90 },
  { icon: chipCafe, label: 'Cafe', time: '4 min', x: 473, w: 223, round: 30 },
  { icon: chipRestaurant, label: 'Restaurant', time: '3min', x: 714, w: 283, round: 90 },
]

type Props = { onShowPass: () => void; onRest: () => void }

export default function HomePanel({ onShowPass, onRest }: Props) {
  const [remind, setRemind] = useSharedState('hp.remind', false)
  const [mode, setMode] = useSharedState('hp.mode', 'Private')

  return (
    <>
      <MyFlight onShowPass={onShowPass} />
      <BoardingIn />
      <MySeat />

      {/* 알림 · 언어 · 휴식 · 함께 보기 */}
      {[
        { icon: btnBell, x: 232, label: 'Reminder', on: remind, onClick: () => setRemind((v) => !v) },
        { icon: btnGlobe, x: 342, label: 'Language', on: false, onClick: () => {} },
        { icon: btnMoon, x: 452, label: 'Rest mode', on: false, onClick: onRest },
        { icon: btnPeople, x: 562, label: 'Share with passengers', on: mode === 'Share', onClick: () => setMode((m) => (m === 'Share' ? 'Private' : 'Share')), big: true },
      ].map((b, i) => (
        <motion.button
          key={b.label}
          type="button"
          className={`hp-round ${b.on ? 'hp-round--on' : ''}`}
          style={{ left: b.x }}
          aria-label={b.label}
          aria-pressed={b.on}
          onClick={b.onClick}
          whileTap={{ scale: 0.9 }}
          {...enter(0.35 + i * 0.06)}
        >
          <motion.img
            className={b.big ? 'hp-round__icon--big' : undefined}
            src={b.icon}
            alt=""
            animate={b.on ? { rotate: [0, -16, 14, -8, 0] } : { rotate: 0 }}
            transition={{ duration: 0.6 }}
          />
        </motion.button>
      ))}
      {/* 알림 버튼의 새 소식 점 */}
      <motion.img
        className="hp-round__dot"
        src={btnDot}
        alt=""
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.3, 1] }}
        transition={{ delay: 0.9, duration: 0.5 }}
      />
    </>
  )
}

function MyFlight({ onShowPass }: { onShowPass: () => void }) {
  return (
    <motion.section className="ds-card hp-flight" {...enter(0.1)}>
      <p className="ds-label hp-title">MY FLIGHT</p>
      <div className="hp-row hp-route">
        <img className="hp-route__trail" src={flightTrail} alt="" />
        <Field k="FROM" v="ICN" big />
        <div className="hp-field">
          <p className="hp-key" style={{ color: 'transparent' }}>출발</p>
          <motion.img
            className="hp-route__plane"
            src={flightPlane}
            alt=""
            animate={{ x: [-4, 6, -4], y: [0, -3, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
        <Field k="TO" v="BER" big />
      </div>
      <div className="hp-row">
        <Field k="FLIGHT" v="LH 702" />
        <Field k="SEAT" v="34A" />
      </div>
      <div className="hp-row">
        <Field k="DEPARTS" v="15:00" />
        <Field k="BAGGAGE" v="1 bag" />
      </div>
      <motion.button type="button" className="hp-pass-btn" onClick={onShowPass} whileTap={{ scale: 0.97 }}>
        <img src={qrCode} alt="" />
        View boarding pass
      </motion.button>
    </motion.section>
  )
}

function Field({ k, v, big }: { k: string; v: string; big?: boolean }) {
  return (
    <div className="hp-field">
      <p className="hp-key">{k}</p>
      <p className={`hp-val ${big ? 'hp-val--big' : ''}`}>{v}</p>
    </div>
  )
}

function BoardingIn() {
  const [stopAdded, setStopAdded] = useSharedState('hp.stop', false)

  return (
    <motion.section className="ds-card hp-boarding" {...enter(0.18)}>
      <p className="ds-label hp-title hp-boarding__title">BOARDING IN</p>
      <div className="hp-stats">
        <p className="hp-countdown">1h 40m</p>
        <Stat k="GATE" v="16" />
        <Stat k="BOARDS" v="14:20" />
        <div className="hp-stat">
          <p className="hp-stat__k">PASSENGERS</p>
          <div className="hp-avatars">
            {PASSENGERS.map((name, i) => (
              <motion.span
                key={name}
                className="hp-avatar"
                initial={{ opacity: 0, x: -14, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ ...spring, delay: 0.6 + i * 0.07 }}
              >
                {name}
              </motion.span>
            ))}
          </div>
        </div>
      </div>

      <div className="hp-progress">
        <img className="hp-progress__line" src={progressLine} alt="" />
        {/* 지나온 구간에서 앞으로 흐르는 빛 */}
        <motion.span
          className="hp-progress__shine"
          animate={{ x: [-160, 1015] }}
          transition={{ duration: 3.2, repeat: Infinity, repeatDelay: 1.2, ease: 'easeInOut' }}
        />
        {CHIPS.map((c, i) => (
          <motion.div
            key={c.label}
            className="hp-chip"
            style={{ left: c.x, width: c.w, borderRadius: c.round }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: [0, -4, 0] }}
            transition={{ opacity: { delay: 0.6 + i * 0.1 }, y: { duration: 3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 } }}
          >
            <img src={c.icon} alt="" />
            <span>
              {c.label}
              <b> ・ </b>
              {c.time}
            </span>
          </motion.div>
        ))}
        {/* 진행선 위 차 — 라운지 쪽으로 천천히 다가가며 살짝 떠 있음 */}
        <motion.div className="hp-car" initial={{ x: -140, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 40, damping: 14, delay: 0.5 }}>
          <motion.img src={carProgress} alt="" animate={{ y: [0, -3, 0] }} transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }} />
        </motion.div>
      </div>

      <div className="hp-steps">
        <div className="hp-step">
          <p>
            Security Check <img src={check} alt="" />
          </p>
          <p>12:20</p>
        </div>
        <div className="hp-step hp-step--end">
          <p>Gate 16</p>
          <p>Arrive 14:00</p>
        </div>
      </div>
      <p className="hp-now hp-now--place">T1 Lounge ・ now</p>
      <p className="hp-now hp-now--time">12:40</p>

      <div className="hp-foot">
        <p>We’ll remind you 20 min before boarding</p>
        <motion.button type="button" className="ds-pill-on hp-stop-btn" onClick={() => setStopAdded((v) => !v)} whileTap={{ scale: 0.95 }}>
          <motion.span key={String(stopAdded)} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            {stopAdded ? 'Stop added ✓' : 'Add a stop'}
          </motion.span>
        </motion.button>
      </div>
    </motion.section>
  )
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="hp-stat">
      <p className="hp-stat__k">{k}</p>
      <p className="hp-stat__v">{v}</p>
    </div>
  )
}

// MY SEAT — 링을 끌거나 −/+ 로 좌석 각도 조절 (점 위치 0~180° → 좌석 0~90°)
// 원호·점은 피그마 이미지 그대로, 함께 링을 따라 돎 (피그마 기본 = 점이 3시, 45°)
const SWEEP_STEP = 30 // −/+ 한 번에 좌석 15°

function MySeat() {
  const [sweep, setSweep] = useSharedState('hp.sweep', 90)
  const [mode, setMode] = useSharedState('hp.mode', 'Private')
  const [size, setSize] = useSharedState('hp.size', 'Compact')
  const dialRef = useRef<HTMLDivElement>(null)

  const seatAngle = Math.round(sweep / 2)
  const smooth = useSpring(sweep, { stiffness: 260, damping: 30 })
  useEffect(() => smooth.set(sweep), [smooth, sweep])
  const seatRotate = useTransform(smooth, (s) => -90 + (s / 2 - 45))
  const ringRotate = useTransform(smooth, (s) => s - 90)
  const nudge = (d: number) => setSweep((s) => Math.min(180, Math.max(0, s + d)))

  // 링 가장자리를 잡으면 점이 손가락 위치로, 가운데 좌석을 잡으면 손가락이 돈 만큼 좌석이 같이 돎
  const grab = useRef<{ ring: boolean; from: number; sweep: number } | null>(null)
  const pointer = (e: { clientX: number; clientY: number }) => {
    const r = dialRef.current!.getBoundingClientRect()
    const dx = e.clientX - (r.left + r.width / 2)
    const dy = e.clientY - (r.top + r.height / 2)
    return { deg: (Math.atan2(dx, -dy) * 180) / Math.PI, dist: Math.hypot(dx, dy) / (r.width / 2) }
  }
  const toRing = (deg: number) => setSweep(Math.min(180, Math.max(0, deg < 0 ? (deg < -90 ? 180 : 0) : deg)))
  const start = (e: { clientX: number; clientY: number }) => {
    const p = pointer(e)
    const ring = p.dist > 0.78
    grab.current = { ring, from: p.deg, sweep }
    if (ring) toRing(p.deg)
  }
  const track = (e: { clientX: number; clientY: number }) => {
    const g = grab.current
    if (!g) return
    const p = pointer(e)
    if (g.ring) return toRing(p.deg)
    // 한 바퀴 경계(±180°)를 넘어도 끊기지 않게
    let turn = p.deg - g.from
    if (turn > 180) turn -= 360
    if (turn < -180) turn += 360
    // 좌석 각도 = 점 위치의 절반 → 좌석을 θ만큼 돌리면 점은 2θ
    setSweep(Math.min(180, Math.max(0, g.sweep + turn * 2)))
  }

  return (
    <motion.section className="ds-card hp-seat" {...enter(0.26)}>
      <div className="hp-seat__head">
        <p className="ds-label">MY SEAT</p>
        <p className="ds-label hp-seat__deg">{seatAngle}°</p>
        <img src={arrowRight} alt="" />
      </div>

      <div
        ref={dialRef}
        className="hp-dial"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId)
          start(e)
        }}
        onPointerMove={(e) => track(e)}
        onPointerUp={() => (grab.current = null)}
        onPointerCancel={() => (grab.current = null)}
      >
        <motion.img className="hp-dial__seat" src={seatTop} alt="" draggable={false} style={{ rotate: seatRotate }} />
        <motion.div className="hp-dial__turn" style={{ rotate: ringRotate }}>
          <img className="hp-dial__arc" src={dialArc} alt="" />
          <img className="hp-dial__dot" src={dialDot} alt="" />
        </motion.div>
      </div>
      <img className="hp-dial__ring" src={dialRing} alt="" />

      {/* − / + */}
      <motion.button type="button" className="hp-dial__btn hp-dial__btn--minus" aria-label="Recline less" onClick={() => nudge(-SWEEP_STEP)} whileTap={{ scale: 0.85 }}>
        <img src={dialBtn} alt="" />
        <img className="hp-dial__minus" src={dialMinus} alt="" />
      </motion.button>
      <motion.button type="button" className="hp-dial__btn hp-dial__btn--plus" aria-label="Recline more" onClick={() => nudge(SWEEP_STEP)} whileTap={{ scale: 0.85 }}>
        <img src={dialBtn} alt="" />
        <img className="hp-dial__plus-h" src={dialPlusH} alt="" />
        <img className="hp-dial__plus-v" src={dialPlusV} alt="" />
      </motion.button>

      <Segmented id="seat-mode" className="hp-seg hp-seg--mode" options={['Private', 'Share']} value={mode} onChange={setMode} />
      <img className="hp-seat__divider" src={dividerLine} alt="" />
      <div className="hp-seat__row">
        <p className="ds-label">SEAT DISPLAY</p>
        <img src={arrowRight} alt="" />
      </div>
      <Segmented id="seat-size" className="hp-seg hp-seg--size" options={['Compact', 'Wide']} value={size} onChange={setSize} width={320} />
    </motion.section>
  )
}
