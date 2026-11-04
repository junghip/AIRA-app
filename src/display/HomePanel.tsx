import { motion, useSpring, useTransform } from 'motion/react'
import { useEffect, useRef, useState, type PointerEvent } from 'react'
import arrowRight from '../assets/display/arrow-right-s.svg'
import avatar1 from '../assets/display/avatar-1.png'
import avatar2 from '../assets/display/avatar-2.jpg'
import avatar3 from '../assets/display/avatar-3.jpg'
import avatar4 from '../assets/display/avatar-4.jpg'
import btnBell from '../assets/display/btn-bell.svg'
import btnGlobe from '../assets/display/btn-globe.svg'
import btnMoon from '../assets/display/btn-moon.svg'
import carProgress from '../assets/display/car-progress.png'
import check from '../assets/display/check.svg'
import dialArc from '../assets/display/dial-arc.svg'
import dialDot from '../assets/display/dial-dot.svg'
import dividerLine from '../assets/display/divider-line.svg'
import flightPlane from '../assets/display/flight-plane.svg'
import flightTrail from '../assets/display/flight-trail.svg'
import poiCafe from '../assets/display/poi-cafe.svg'
import poiPub from '../assets/display/poi-pub.svg'
import poiRestroom from '../assets/display/poi-restroom.svg'
import progressLine from '../assets/display/progress-line.svg'
import qrCode from '../assets/display/qr-code.svg'
import seatTop from '../assets/display/seat-top.png'
import { softSpring, spring } from '../motion/transitions'
import Segmented from './Segmented'
import './HomePanel.css'

// 피그마 "홈 - 기본 메뉴"
const enter = (delay: number) => ({
  initial: { opacity: 0, y: 30, filter: 'blur(8px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  transition: { ...softSpring, delay },
})

// 승객 얼굴 — 피그마 크롭 그대로 (원 49×60 안에서 이미지 위치·크기)
const AVATARS = [
  { src: avatar1, left: -10.51, top: -5.25, w: 70.261, h: 70.261, shade: 'a' },
  { src: avatar2, left: -4.65, top: -13.35, w: 55.519, h: 98.667, shade: 'b' },
  { src: avatar3, left: 0, top: -4.5, w: 49.05, h: 65.511, shade: 'a' },
  { src: avatar4, left: -2.87, top: -1.64, w: 54.21, h: 66.321, shade: 'a' },
]

type Props = { onShowPass: () => void; onRest: () => void }

export default function HomePanel({ onShowPass, onRest }: Props) {
  const [remind, setRemind] = useState(false)

  return (
    <>
      <MyFlight onShowPass={onShowPass} />
      <BoardingIn />
      <MySeat />

      {/* 알림 · 언어 · 휴식 */}
      {[
        { icon: btnBell, x: 232, label: 'Reminder', on: remind, onClick: () => setRemind((v) => !v) },
        { icon: btnGlobe, x: 342, label: 'Language', on: false, onClick: () => {} },
        { icon: btnMoon, x: 452, label: 'Rest mode', on: false, onClick: onRest },
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
          <motion.img src={b.icon} alt="" animate={b.on ? { rotate: [0, -16, 14, -8, 0] } : { rotate: 0 }} transition={{ duration: 0.6 }} />
        </motion.button>
      ))}
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
      <motion.button type="button" className="ds-pill-on hp-pass-btn" onClick={onShowPass} whileTap={{ scale: 0.97 }}>
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
  const [stopAdded, setStopAdded] = useState(false)

  return (
    <motion.section className="ds-card hp-boarding" {...enter(0.18)}>
      <p className="ds-label hp-title">BOARDING IN</p>
      <div className="hp-stats">
        <p className="hp-countdown">1h 40m</p>
        <Stat k="GATE" v="16" />
        <Stat k="BOARDS" v="14:20" />
        <div className="hp-stat">
          <p className="hp-stat__k">PASSENGERS</p>
          <div className="hp-avatars">
            {AVATARS.map((a, i) => (
              <motion.div
                key={i}
                className="hp-avatar"
                initial={{ opacity: 0, x: -14, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ ...spring, delay: 0.6 + i * 0.07 }}
              >
                <img src={a.src} alt="" style={{ left: a.left, top: a.top, width: a.w, height: a.h }} />
                <span className={`hp-avatar__shade hp-avatar__shade--${a.shade}`} />
              </motion.div>
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
        <div className="hp-steps">
          <div className="hp-step hp-step--done">
            <p>
              Security Check <img src={check} alt="" />
            </p>
            <p>12:20</p>
          </div>
          <div className="hp-step hp-step--now">
            <p>T1 Lounge</p>
            <p>12:40</p>
          </div>
          <div className="hp-step hp-step--done">
            <p>Gate 16</p>
            <p>Arrive 14:00</p>
          </div>
        </div>
        <Poi icon={poiRestroom} n="+2" x={159} w={90} d={0} />
        <Poi icon={poiPub} n="+19" x={605} d={0.5} />
        <Poi icon={poiCafe} n="+15" x={717} d={1} />
      </div>

      <div className="hp-foot">
        <p>We’ll remind you 20 min before boarding</p>
        <motion.button type="button" className="ds-pill-on hp-stop-btn" onClick={() => setStopAdded((v) => !v)} whileTap={{ scale: 0.95 }} layout transition={spring}>
          <motion.span key={String(stopAdded)} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            {stopAdded ? 'Stop added ✓' : 'Add a stop'}
          </motion.span>
        </motion.button>
      </div>

      {/* 진행선 위 차 — 라운지 쪽으로 천천히 다가가며 살짝 떠 있음 */}
      <motion.div className="hp-car" initial={{ x: -140, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 40, damping: 14, delay: 0.5 }}>
        <motion.img src={carProgress} alt="" animate={{ y: [0, -3, 0] }} transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }} />
      </motion.div>
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

function Poi({ icon, n, x, w, d }: { icon: string; n: string; x: number; w?: number; d: number }) {
  return (
    <motion.div
      className="hp-poi"
      style={{ left: x, width: w }}
      animate={{ y: [0, -5, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: d }}
    >
      <img src={icon} alt="" />
      <span>{n}</span>
    </motion.div>
  )
}

// MY SEAT — 링을 돌려 좌석 각도 조절 (점 위치 0~180° → 좌석 0~90°)
// 원호·점은 피그마 이미지 그대로, 끌면 함께 링을 따라 돎 (피그마 기본 = 점이 3시, 45°)
function MySeat() {
  const [sweep, setSweep] = useState(90)
  const [mode, setMode] = useState('Private')
  const [size, setSize] = useState('Compact')
  const dialRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const seatAngle = Math.round(sweep / 2)
  const smooth = useSpring(sweep, { stiffness: 260, damping: 30 })
  useEffect(() => smooth.set(sweep), [smooth, sweep])
  const seatRotate = useTransform(smooth, (s) => -90 + (s / 2 - 45))
  const ringRotate = useTransform(smooth, (s) => s - 90)

  const track = (e: PointerEvent) => {
    const r = dialRef.current!.getBoundingClientRect()
    const dx = e.clientX - (r.left + r.width / 2)
    const dy = e.clientY - (r.top + r.height / 2)
    let deg = (Math.atan2(dx, -dy) * 180) / Math.PI
    if (deg < 0) deg = deg < -90 ? 180 : 0
    setSweep(Math.min(180, Math.max(0, deg)))
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
          dragging.current = true
          e.currentTarget.setPointerCapture(e.pointerId)
          track(e)
        }}
        onPointerMove={(e) => dragging.current && track(e)}
        onPointerUp={() => (dragging.current = false)}
        onPointerCancel={() => (dragging.current = false)}
      >
        <motion.img className="hp-dial__seat" src={seatTop} alt="" style={{ rotate: seatRotate }} />
        <motion.div className="hp-dial__ring" style={{ rotate: ringRotate }}>
          <img className="hp-dial__arc" src={dialArc} alt="" />
          <img className="hp-dial__dot" src={dialDot} alt="" />
        </motion.div>
      </div>

      <Segmented id="seat-mode" options={['Private', 'Share']} value={mode} onChange={setMode} />
      <img className="hp-seat__divider" src={dividerLine} alt="" />
      <div className="hp-seat__row">
        <p className="ds-label">SEAT DISPLAY</p>
        <img src={arrowRight} alt="" />
      </div>
      <Segmented id="seat-size" options={['Compact', 'Wide']} value={size} onChange={setSize} width={320} />
    </motion.section>
  )
}
