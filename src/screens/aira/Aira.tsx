import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import airaLogoNotif from '../../assets/aira/aira-logo-notif.svg'
import flowChevron1 from '../../assets/aira/chevron-flow-1.svg'
import flowChevron2 from '../../assets/aira/chevron-flow-2.svg'
import endingScene from '../../assets/aira/ending-scene.jpg'
import mapPin from '../../assets/aira/map-pin.svg'
import mapScene from '../../assets/aira/map-scene.jpg'
import notificationCar from '../../assets/aira/notification-car.png'
import widgetMarker from '../../assets/aira/widget-marker.svg'
import widgetRing from '../../assets/aira/widget-ring.svg'
import widgetRings from '../../assets/aira/widget-rings.svg'
import backIcon from '../../assets/icons/arrow-left.svg'
import chevronDown from '../../assets/icons/chevron-down-sub.svg'
import chevronSub from '../../assets/icons/chevron-right-sub.svg'
import closeIcon from '../../assets/icons/close-line.svg'
import flightIcon from '../../assets/icons/flight-takeoff-line.svg'
import GlassIconButton from '../../components/GlassIconButton'
import Icon from '../../components/Icon'
import RollingText from '../../components/RollingText'
import { riseIn, softSpring, spring, stagger } from '../../motion/transitions'
import './Aira.css'

type Step = 'lock' | 'map' | 'ending'

const NOTIFY_DELAY_MS = 1400 // 잠금화면이 보이고 알림이 오기까지
const OPEN_MS = 550 // 알림이 화면 전체로 펼쳐지는 시간
const COUNTDOWN_MS = 3000 // 2min → 1min
const ARRIVE_MS = 6500 // 지도에서 엔딩으로

export default function Aira() {
  const navigate = useNavigate()
  const location = useLocation()
  const riders = (location.state as { riders?: number } | null)?.riders ?? 3
  const [step, setStep] = useState<Step>('lock')

  const goHome = () => navigate('/')
  const arrive = useCallback(() => setStep('ending'), [])

  return (
    <div className="aira">
      <AnimatePresence>
        {step === 'lock' && <LockScreen key="lock" onOpen={() => setStep('map')} />}
        {step === 'map' && <MapScreen key="map" riders={riders} onArrive={arrive} onBack={() => navigate(-1)} onClose={goHome} />}
        {step === 'ending' && <EndingScreen key="ending" onClose={goHome} />}
      </AnimatePresence>
    </div>
  )
}

function LockScreen({ onOpen }: { onOpen: () => void }) {
  const [notified, setNotified] = useState(false)
  const [opening, setOpening] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setNotified(true), NOTIFY_DELAY_MS)
    return () => clearTimeout(timer)
  }, [])

  const open = () => {
    if (opening) return
    setOpening(true)
    setTimeout(onOpen, OPEN_MS)
  }

  return (
    <motion.div className="lock" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.4 } }} transition={{ duration: 0.5 }}>
      <motion.div className="lock__clock" variants={stagger(0.1, 0.2)} initial="hidden" animate={opening ? { opacity: 0, scale: 0.94 } : 'show'}>
        <motion.p className="lock__date" variants={riseIn}>
          Monday, December 24
        </motion.p>
        <motion.p className="lock__time" variants={riseIn}>
          11:48
        </motion.p>
        <motion.div className="lock__widgets" variants={riseIn}>
          <div className="widget">
            <img className="widget__ring" src={widgetRing} width={56} height={43.395} alt="" />
            <img className="widget__marker" src={widgetMarker} width={7} height={7} alt="" />
            <span className="widget__temp">72</span>
            <span className="widget__low">68</span>
            <span className="widget__high">86</span>
          </div>
          <img src={widgetRings} width={56} height={56} alt="" />
          <div className="widget widget--clock">
            <span className="widget__city">CUP</span>
            <span className="widget__clock-time">9:41</span>
            <span className="widget__ampm">AM</span>
          </div>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {notified && (
          <motion.button
            layout
            className={`notif${opening ? ' notif--open' : ''}`}
            onClick={open}
            aria-label="AIRA notification: 2 minutes until pickup. Open"
            initial={{ y: 160, opacity: 0, scale: 0.92 }}
            animate={opening ? { y: 0, opacity: 1, scale: 1, borderRadius: 0 } : { y: 0, opacity: 1, scale: 1, borderRadius: 24 }}
            whileTap={opening ? undefined : { scale: 0.97 }}
            transition={opening ? { type: 'spring', stiffness: 260, damping: 32 } : { type: 'spring', stiffness: 300, damping: 22 }}
          >
            <motion.div
              className="notif__body"
              animate={opening ? { opacity: 0 } : { opacity: 1, x: [0, -3, 3, -2, 2, 0] }}
              transition={opening ? { duration: 0.15 } : { x: { delay: 0.35, duration: 0.45 } }}
            >
              <img src={airaLogoNotif} width={98} height={18} alt="AIRA" />
              <div className="notif__row">
                <span className="notif__streak">
                  {/* 길이 뒤로 흘러가듯 빛이 오른쪽에서 왼쪽으로 계속 지나감 */}
                  <motion.span
                    className="notif__streak-flow"
                    initial={{ x: '260%' }}
                    animate={{ x: '-110%' }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: 'linear', delay: 1.2 }}
                  />
                </span>
                <div className="notif__text">
                  <p className="notif__title">
                    <span className="notif__accent">2min</span> until pick up
                  </p>
                  <p className="notif__desc">
                    <span>AIRA 07 is almost there.</span>
                    <span>Meet at 3F Departures.</span>
                  </p>
                </div>
                {/* 알림 속 작은 차가 왼쪽에서 빛줄기를 따라 미끄러져 들어와, 달리는 듯 살짝 흔들림 */}
                <motion.div
                  className="notif__car"
                  initial={{ x: -110, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1], delay: 0.45 }}
                >
                  <motion.img
                    src={notificationCar}
                    width={59}
                    height={30.307}
                    alt=""
                    animate={{ y: [0, -0.6, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </motion.div>
              </div>
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function MapScreen({ riders, onArrive, onBack, onClose }: { riders: number; onArrive: () => void; onBack: () => void; onClose: () => void }) {
  const navigate = useNavigate()
  const [minutes, setMinutes] = useState(2)

  useEffect(() => {
    const tick = setTimeout(() => setMinutes(1), COUNTDOWN_MS)
    const arrive = setTimeout(onArrive, ARRIVE_MS)
    return () => {
      clearTimeout(tick)
      clearTimeout(arrive)
    }
  }, [onArrive])

  return (
    <motion.div
      className="map"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.12, transition: { duration: 0.7, ease: 'easeIn' } }}
      transition={{ duration: 0.45 }}
    >
      {/* 차 쪽으로 천천히 다가가는 카메라, 탭하면 바로 도착 */}
      <motion.img
        className="map__scene"
        src={mapScene}
        alt="AIRA 07 approaching along the blue path"
        onClick={onArrive}
        initial={{ scale: 1 }}
        animate={{ scale: 1.08 }}
        transition={{ duration: ARRIVE_MS / 1000 + 1, ease: 'linear' }}
        style={{ transformOrigin: '50% 40%' }}
      />
      <div className="map__fade map__fade--top" />
      <div className="map__fade map__fade--bottom" />

      <div className="aira__top aira__top--split">
        <GlassIconButton icon={backIcon} label="Back" onClick={onBack} />
        <GlassIconButton icon={closeIcon} label="Close" onClick={onClose} />
      </div>

      <motion.div className="aira__headline" variants={stagger(0.08, 0.3)} initial="hidden" animate="show">
        <motion.h1 className="aira__title" variants={riseIn}>
          <span className="aira__accent">AIRA 07</span> is on its way
        </motion.h1>
        <motion.p className="aira__sub" variants={riseIn}>
          AIRA 07 is almost there.
        </motion.p>
      </motion.div>

      <motion.div
        className="ride-card"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...softSpring, delay: 0.5 }}
      >
        <div className="ride-card__row">
          <div className="ride-card__location">
            <p className="ride-card__label">Your Location</p>
            <p className="ride-card__value ride-card__value--sm">A12</p>
            <p className="ride-card__place">
              <img src={mapPin} width={10} height={10} alt="" />
              Terminal 1 · 3F
            </p>
          </div>
          <div className="ride-card__eta">
            <p className="ride-card__label">Pick up&nbsp; in</p>
            <p className="ride-card__value ride-card__value--sm">
              <RollingText value={`${minutes}min`} direction={-1} />
            </p>
          </div>
        </div>
        <div className="ride-card__divider" />
        <div className="ride-card__stats">
          {[
            ['RIDERS', String(riders)],
            ['LEVEL', '3F'],
            ['GATE', '28'],
          ].map(([label, value]) => (
            <div key={label} className="ride-card__stat">
              <p className="ride-card__label ride-card__label--caps">{label}</p>
              <p className="ride-card__value">{value}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* 위치 → 픽업 방향으로 흐르는 두 개의 꺾쇠 */}
      {[flowChevron1, flowChevron2].map((src, i) => (
        <motion.img
          key={src}
          className={`map__flow map__flow--${i + 1}`}
          src={src}
          alt=""
          animate={{ opacity: [0.35, 1, 0.35] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: 0.9 + i * 0.25, ease: 'easeInOut' }}
        />
      ))}

      <motion.div
        className="aira__center aira__center--cancel"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...softSpring, delay: 0.7 }}
      >
        <motion.button className="cancel-request" whileTap={{ scale: 0.96 }} transition={spring} onClick={onClose}>
          Cancel request
        </motion.button>
      </motion.div>

      <motion.div
        className="aira__center aira__center--link"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        <motion.button className="text-link" whileTap={{ scale: 0.96 }} onClick={() => navigate('/reserve')}>
          Change the reservation
          <img src={chevronSub} width={20} height={20} alt="" />
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

function EndingScreen({ onClose }: { onClose: () => void }) {
  return (
    <motion.div className="ending" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
      {/* 하얀 빛에서 장면이 드러나며 카메라가 살짝 물러남 */}
      <motion.img
        className="ending__scene"
        src={endingScene}
        alt="AIRA 07 waiting with doors open"
        initial={{ scale: 1.18, filter: 'brightness(1.6) blur(6px)' }}
        animate={{ scale: 1, filter: 'brightness(1) blur(0px)' }}
        transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
      />
      {/* 바닥의 파란 빛줄기를 따라 빛이 차 쪽으로 흘러감 */}
      <motion.div
        className="ending__beam"
        initial={{ backgroundPositionY: '100%', opacity: 0 }}
        animate={{ backgroundPositionY: ['100%', '0%'], opacity: 1 }}
        transition={{ backgroundPositionY: { duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: 1 }, opacity: { delay: 1, duration: 0.6 } }}
      />
      <div className="ending__fade ending__fade--top1" />
      <div className="ending__fade ending__fade--top2" />
      <div className="ending__fade ending__fade--bottom1" />
      <div className="ending__fade ending__fade--bottom2" />

      <div className="aira__top">
        <GlassIconButton icon={closeIcon} label="Close" onClick={onClose} />
      </div>

      <motion.div className="aira__headline aira__headline--center" variants={stagger(0.12, 0.7)} initial="hidden" animate="show">
        <motion.h1 className="ending__title" variants={riseIn}>
          Here we go
        </motion.h1>
        <motion.p className="aira__sub" variants={riseIn}>
          Starting your ride to Gate 28
        </motion.p>
      </motion.div>

      <motion.div className="ending__actions" variants={stagger(0.1, 1.1)} initial="hidden" animate="show">
        <motion.div className="aira__center aira__center--done" variants={riseIn}>
          <motion.button className="cta cta--solid" whileTap={{ scale: 0.95 }} transition={spring} onClick={onClose}>
            Done
            <Icon src={flightIcon} width={20} color="var(--color-ink)" />
          </motion.button>
        </motion.div>
        <motion.div className="aira__center aira__center--help" variants={riseIn}>
          <motion.button className="info-pill ending__help" whileTap={{ scale: 0.96 }} transition={spring}>
            Need a help?
            <img src={chevronDown} width={10.3} height={6.3} alt="" />
          </motion.button>
        </motion.div>
        <motion.div className="aira__center aira__center--link" variants={riseIn}>
          <motion.button className="text-link" whileTap={{ scale: 0.96 }} onClick={onClose}>
            Go to my page
            <img src={chevronSub} width={20} height={20} alt="" />
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
