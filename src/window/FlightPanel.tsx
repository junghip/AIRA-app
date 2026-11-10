import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import flightLine from '../assets/window/flight-line.svg'
import icSnow from '../assets/window/ic-snow.svg'
import planeFlight from '../assets/window/plane-flight.svg'
import unionFlight from '../assets/window/union-flight.svg'
import RollingText from '../components/RollingText'
import { smoothEase } from '../motion/transitions'
import type { RouteVariant } from './scenes'

// 피그마 Section 10 "기본 v3" (485:3429) — OUR FLIGHT 탭, 창밖은 눈 내리는 베를린
const item = {
  hidden: { opacity: 0, y: 14, filter: 'blur(6px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: smoothEase } },
}

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="wn-f-field">
      <p className="wn-f-label">{label}</p>
      <p className="wn-f-value">{value}</p>
    </div>
  )
}

export default function FlightPanel({ variant }: { variant: RouteVariant }) {
  const gate = variant === 'gate47' ? '47' : '16'
  return (
    <motion.div className="wn-layer" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } } }}>
      <img className="wn-union" src={unionFlight} alt="" style={{ left: 60, top: 253, width: 595, height: 486 }} />

      <div className="wn-f-col">
        <motion.p className="wn-f-title" variants={item}>
          OUR FLIGHT
        </motion.p>
        <div className="wn-f-body">
          <motion.div className="wn-f-row" variants={item}>
            <div className="wn-f-line">
              <motion.img src={flightLine} alt="" initial={{ clipPath: 'inset(0 100% 0 0)' }} animate={{ clipPath: 'inset(0 0% 0 0)' }} transition={{ duration: 1.2, ease: smoothEase, delay: 0.5 }} />
            </div>
            <Field label="FROM" value="ICN" />
            <div className="wn-f-field">
              <p className="wn-f-label is-hidden">출발</p>
              {/* ICN → BER 사이를 비행기가 미끄러지듯 */}
              <motion.img src={planeFlight} alt="" width={46} height={45.061} initial={{ x: -60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 1.3, ease: smoothEase, delay: 0.45 }} />
            </div>
            <Field label="TO" value="BER" />
          </motion.div>
          <motion.div className="wn-f-row" variants={item}>
            <Field label="FLIGHT" value="LH 702" />
            <Field label="GATE" value={<RollingText value={gate} />} />
          </motion.div>
          <motion.div className="wn-f-row" variants={item}>
            <Field label="BOARDS" value="14:20" />
            <Field label="DEPARTS" value="15:00" />
          </motion.div>
        </div>
      </div>

      <motion.div
        className="wn-weather"
        initial={{ opacity: 0, x: 30, filter: 'blur(10px)' }}
        animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
        transition={{ duration: 1.2, ease: smoothEase, delay: 0.6 }}
      >
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
