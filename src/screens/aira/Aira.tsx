import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import airaLogoSmall from '../../assets/aira/aira-logo-small.svg'
import endingScene from '../../assets/aira/ending-scene.jpg'
import mapScene from '../../assets/aira/map-scene.jpg'
import notificationCar from '../../assets/aira/notification-car.png'
import widgetMarker from '../../assets/aira/widget-marker.svg'
import widgetRing from '../../assets/aira/widget-ring.svg'
import widgetRings from '../../assets/aira/widget-rings.svg'
import closeIcon from '../../assets/icons/close-line.svg'
import GlassIconButton from '../../components/GlassIconButton'
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
        {step === 'map' && <MapScreen key="map" riders={riders} onArrive={arrive} onClose={goHome} />}
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
              <img src={airaLogoSmall} width={76.495} height={14} alt="AIRA" />
              <div className="notif__row">
                <span className="notif__streak" />
                <div className="notif__text">
                  <p className="notif__title">
                    <span className="notif__accent">2min</span> until pickup
                  </p>
                  <p className="notif__desc">
                    <span>AIRA 07 is almost there.</span>
                    <span>Meet at 3F Departures.</span>
                  </p>
                </div>
                <p className="notif__place">3F Departures · Terminal 1</p>
                {/* 알림 속 작은 차가 빛줄기를 따라 들어옴 */}
                <motion.img
                  className="notif__car"
                  src={notificationCar}
                  width={59}
                  height={30.307}
                  alt=""
                  initial={{ x: 90, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 120, damping: 16, delay: 0.45 }}
                />
              </div>
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function MapScreen({ riders, onArrive, onClose }: { riders: number; onArrive: () => void; onClose: () => void }) {
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
      {/* 차 쪽으로 천천히 다가가는 카메라 */}
      <motion.img
        className="map__scene"
        src={mapScene}
        alt="Map showing AIRA 07 approaching 3F Departures"
        initial={{ scale: 1.08 }}
        animate={{ scale: 1.16 }}
        transition={{ duration: ARRIVE_MS / 1000 + 1, ease: 'linear' }}
        style={{ transformOrigin: '51% 46%' }}
      />
      <motion.button
        className="map__pulse"
        aria-label="AIRA 07 — skip to pickup"
        onClick={onArrive}
        animate={{ scale: [0.6, 1.6], opacity: [0.7, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
      />
      <div className="map__fade map__fade--top" />
      <div className="map__fade map__fade--bottom" />

      <div className="aira__top">
        <GlassIconButton icon={closeIcon} label="Close" onClick={onClose} />
      </div>

      <motion.div className="aira__headline" variants={stagger(0.08, 0.3)} initial="hidden" animate="show">
        <motion.h1 className="aira__title" variants={riseIn}>
          <span className="map__minutes">
            <RollingText value={`${minutes}min`} direction={-1} />
          </span>{' '}
          until pickup
          <br />
          AIRA 07 is on its way
        </motion.h1>
        <motion.p className="aira__sub" variants={riseIn}>
          AIRA 07 is almost there
        </motion.p>
      </motion.div>

      <motion.div className="map__info" variants={stagger(0.08, 0.6)} initial="hidden" animate="show">
        <motion.p variants={riseIn}>3F Departures · Terminal 1</motion.p>
        <motion.p variants={riseIn}>Arrives in 1~2min</motion.p>
        <motion.p variants={riseIn}>
          {riders} {riders === 1 ? 'rider' : 'riders'}
        </motion.p>
        <motion.p variants={riseIn}>To Gate 28</motion.p>
      </motion.div>

      <motion.div
        className="aira__center aira__center--cancel"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...softSpring, delay: 0.9 }}
      >
        <motion.button className="cta cta--hug" whileTap={{ scale: 0.95 }} transition={spring} onClick={onClose}>
          Cancel
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
    </motion.div>
  )
}
