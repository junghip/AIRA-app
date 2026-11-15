import { motion } from 'motion/react'
import icSnow from '../assets/window/ic-snow.svg'
import flightLine from '../assets/window/v3-flight-line.svg'
import planeFlight from '../assets/window/v3-plane-flight.svg'
import unionFlight from '../assets/window/v3-union-flight.svg'
import RollingText from '../components/RollingText'
import { smoothEase } from '../motion/transitions'
import type { RouteVariant } from './scenes'

// 피그마 "창문 디벨롭할게요" 기본 v3 (532:4147) — OUR FLIGHT 탭, 창밖은 눈 내리는 베를린
const item = {
  hidden: { opacity: 0, y: 14, filter: 'blur(6px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: smoothEase } },
}

export default function FlightPanel({ variant }: { variant: RouteVariant }) {
  const gate47 = variant === 'gate47'
  return (
    <motion.div className="wn-layer" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } } }}>
      <img className="wn-union" src={unionFlight} alt="" style={{ left: 274.8, top: 316.75, width: 418.534, height: 398.474 }} />

      <motion.p className="wn-f-title" variants={item}>
        OUR JOURNEY
      </motion.p>

      <div className="wn-f-body">
        <motion.div className="wn-f-row1" variants={item}>
          {/* ICN → BER 사이 빛줄기가 차오름 */}
          <div className="wn-f-line">
            <motion.img src={flightLine} alt="" initial={{ clipPath: 'inset(0 100% 0 0)' }} animate={{ clipPath: 'inset(0 0% 0 0)' }} transition={{ duration: 1.4, ease: smoothEase, delay: 0.5 }} />
          </div>
          <div className="wn-f-field">
            <p className="wn-f-label">FROM</p>
            <p className="wn-f-value">ICN</p>
          </div>
          <div className="wn-f-field">
            <p className="wn-f-label is-hidden">출발</p>
            {/* 비행기가 미끄러지듯 */}
            <motion.img src={planeFlight} alt="" width={41.945} height={41.088} initial={{ x: -60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 1.4, ease: smoothEase, delay: 0.45 }} />
          </div>
          <div className="wn-f-field">
            <p className="wn-f-label">TO</p>
            <p className="wn-f-value">BER</p>
          </div>
        </motion.div>

        <motion.div className="wn-f-field is-abs" style={{ left: 0, top: 90.27 }} variants={item}>
          <p className="wn-f-label">FLIGHT</p>
          <p className="wn-f-value is-small">LH 702</p>
        </motion.div>
        <motion.div className="wn-f-field is-abs" style={{ left: 276.29, top: 90.27 }} variants={item}>
          <p className="wn-f-label">GATE</p>
          <p className="wn-f-value is-small" style={{ color: gate47 ? '#b4471f' : '#050c2c', fontWeight: gate47 ? 600 : 500 }}>
            <RollingText value={gate47 ? '47' : '16'} />
          </p>
        </motion.div>
        <motion.div className="wn-f-field is-abs" style={{ left: 0, top: 175.98 }} variants={item}>
          <p className="wn-f-label">BOARDS</p>
          <p className="wn-f-value is-small">14:20</p>
        </motion.div>
        <motion.div className="wn-f-field is-abs is-right" style={{ left: 232.52, top: 175.98, width: 85.713 }} variants={item}>
          <p className="wn-f-label">DEPARTS</p>
          <p className="wn-f-value is-small">15:00</p>
        </motion.div>
      </div>

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
