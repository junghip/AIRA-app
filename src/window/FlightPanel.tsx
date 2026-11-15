import { motion } from 'motion/react'
import flightLine from '../assets/window/flight-line-v2.svg'
import icSnow from '../assets/window/ic-snow.svg'
import planeFlight from '../assets/window/plane-flight.svg'
import unionFlight from '../assets/window/union-flight-v2.svg'
import RollingText from '../components/RollingText'
import { smoothEase } from '../motion/transitions'
import type { RouteVariant } from './scenes'

// 피그마 "창문" 기본 v3 (525:2808) — OUR FLIGHT 탭, 창밖은 눈 내리는 베를린
const item = {
  hidden: { opacity: 0, y: 14, filter: 'blur(6px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: smoothEase } },
}

export default function FlightPanel({ variant }: { variant: RouteVariant }) {
  const gate47 = variant === 'gate47'
  return (
    <motion.div className="wn-layer" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } } }}>
      <img className="wn-union" src={unionFlight} alt="" style={{ left: 367, top: 317, width: 459, height: 419 }} />

      <motion.p className="wn-f-title" variants={item}>
        OUR FLIGHT
      </motion.p>
      <motion.p className="wn-f-ontime" variants={item}>
        On time
      </motion.p>

      <div className="wn-f-body">
        <motion.div className="wn-f-row1" variants={item}>
          <div className="wn-f-line">
            <motion.img src={flightLine} alt="" initial={{ clipPath: 'inset(0 100% 0 0)' }} animate={{ clipPath: 'inset(0 0% 0 0)' }} transition={{ duration: 1.2, ease: smoothEase, delay: 0.5 }} />
          </div>
          <div className="wn-f-field">
            <p className="wn-f-label">FROM</p>
            <p className="wn-f-value">ICN</p>
          </div>
          <div className="wn-f-field">
            <p className="wn-f-label is-hidden">출발</p>
            {/* ICN → BER 사이를 비행기가 미끄러지듯 */}
            <motion.img src={planeFlight} alt="" width={46} height={45.061} initial={{ x: -60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 1.3, ease: smoothEase, delay: 0.45 }} />
          </div>
          <div className="wn-f-field">
            <p className="wn-f-label">TO</p>
            <p className="wn-f-value">BER</p>
          </div>
        </motion.div>

        <motion.div className="wn-f-field is-abs" style={{ left: 0, top: 99 }} variants={item}>
          <p className="wn-f-label">FLIGHT</p>
          <p className="wn-f-value is-small">LH 702</p>
        </motion.div>
        <motion.div className="wn-f-field is-abs" style={{ left: 303, top: 99 }} variants={item}>
          <p className="wn-f-label">GATE</p>
          <p className="wn-f-value is-small" style={{ color: gate47 ? '#b4471f' : '#050c2c', fontWeight: gate47 ? 600 : 500 }}>
            <RollingText value={gate47 ? '47' : '16'} />
          </p>
        </motion.div>
        <motion.div className="wn-f-field is-abs" style={{ left: 0, top: 193 }} variants={item}>
          <p className="wn-f-label">BOARDS</p>
          <p className="wn-f-value is-small">14:20</p>
        </motion.div>
        <motion.div className="wn-f-field is-abs is-right" style={{ left: 255, top: 193, width: 94 }} variants={item}>
          <p className="wn-f-label">DEPARTS</p>
          <p className="wn-f-value is-small">15:00</p>
        </motion.div>
      </div>

      {/* 탑승권 절취선 */}
      <motion.div className="wn-f-perf" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.9, ease: smoothEase, delay: 0.4 }} style={{ originX: 0 }} />

      <motion.div className="wn-weather" initial={{ opacity: 0, x: 30, filter: 'blur(10px)' }} animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }} transition={{ duration: 1.2, ease: smoothEase, delay: 0.6 }}>
        <p className="wn-weather-city">BERLIN</p>
        <div className="wn-weather-temp">
          <p className="wn-weather-now">-1°</p>
          <p className="wn-weather-range">6° / -3°</p>
        </div>
        <div className="wn-weather-desc">
          <p>LIGHT SNOW</p>
          <motion.img src={icSnow} alt="" width={40} height={40} animate={{ y: [0, 3, 0] }} transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }} />
        </div>
      </motion.div>
    </motion.div>
  )
}
