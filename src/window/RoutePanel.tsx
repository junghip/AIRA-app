import { AnimatePresence, motion } from 'motion/react'
import carChip from '../assets/window/car-chip.png'
import carGlass from '../assets/window/car-glass.png'
import checkRoute from '../assets/window/check-route.svg'
import mapRoads2 from '../assets/window/map-roads-2.svg'
import mapRoads from '../assets/window/map-roads.svg'
import pinDim from '../assets/window/pin-route-dim.svg'
import pinOn from '../assets/window/pin-route-on.svg'
import planeRoute from '../assets/window/plane-route.svg'
import routeLine from '../assets/window/route-line.svg'
import unionShort from '../assets/window/union-route-short.svg'
import unionTall from '../assets/window/union-route-tall.svg'
import RollingText from '../components/RollingText'
import { smoothEase } from '../motion/transitions'
import type { RouteVariant } from './scenes'

// 피그마 "suggested" 484:2508(T1 Lounge) → 484:2603(Lounge Coffee 추가) → 484:3222(Gate 47)
const ROW_GAP = 37.427
const INK = '#050c2c'
const DIM = '#8e97a9'

type Row = { key: string; label: string; time: string; kind: 'done' | 'now' | 'past' | 'gate' }

function rowsOf(v: RouteVariant): Row[] {
  const gate = v === 'gate47' ? '47' : '16'
  return [
    { key: 'checkin', label: 'Check-in', time: '12:10', kind: 'done' },
    { key: 'baggage', label: 'Baggage Drop', time: '12:14', kind: 'done' },
    { key: 'security', label: 'Security Check', time: '12:20', kind: 'done' },
    { key: 't1', label: 'T1 Lounge', time: '12:43', kind: v === 'base' ? 'now' : 'past' },
    ...(v === 'base' ? [] : [{ key: 'coffee', label: 'Lounge Coffee', time: '12:50', kind: 'now' as const }]),
    { key: 'gate', label: `Gate ${gate}`, time: '14:20', kind: 'gate' },
  ]
}

function RowIcon({ kind }: { kind: Row['kind'] }) {
  if (kind === 'done')
    return (
      <span className="wn-r-ic">
        <img src={checkRoute} alt="" width={20.585} height={20.585} />
      </span>
    )
  if (kind === 'gate') return <img src={planeRoute} alt="" width={20.585} height={20.585} />
  // 지금 가는 곳은 진한 핀, 지나온 곳은 흐린 핀
  return (
    <span className="wn-r-pin">
      <motion.img src={pinDim} alt="" animate={{ opacity: kind === 'now' ? 0 : 1 }} transition={{ duration: 0.5 }} />
      <motion.img src={pinOn} alt="" animate={{ opacity: kind === 'now' ? 1 : 0 }} transition={{ duration: 0.5 }} />
    </span>
  )
}

const item = {
  hidden: { opacity: 0, x: -14, filter: 'blur(6px)' },
  show: { opacity: 1, x: 0, filter: 'blur(0px)', transition: { duration: 0.7, ease: smoothEase } },
}

export default function RoutePanel({ variant }: { variant: RouteVariant }) {
  const rows = rowsOf(variant)
  const tall = variant !== 'base'
  const gate = variant === 'gate47' ? '47' : '16'

  return (
    <motion.div className="wn-layer" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.06, delayChildren: 0.2 } } }}>
      {/* 유리판 — 경유지가 하나 늘면 판도 아래로 늘어남 */}
      <motion.img className="wn-union" src={unionShort} alt="" style={{ left: 60, top: 108, width: 1186, height: 526 }} animate={{ opacity: tall ? 0 : 1 }} transition={{ duration: 0.6, ease: smoothEase }} />
      <motion.img className="wn-union" src={unionTall} alt="" style={{ left: 60, top: 108, width: 1186, height: 526 }} initial={false} animate={{ opacity: tall ? 1 : 0 }} transition={{ duration: 0.6, ease: smoothEase }} />

      <motion.div className="wn-r-head" style={{ left: 262, top: 191 }} variants={item}>
        <p className="wn-r-label">OUR JOURNEY</p>
        <div className="wn-r-value">
          <p>Navigating to </p>
          <p>
            Gate <RollingText value={gate} />
          </p>
        </div>
      </motion.div>
      <motion.div className="wn-r-head" style={{ left: 262, top: 380 }} variants={item}>
        <p className="wn-r-label">AIRA</p>
        <div className="wn-r-value">
          <p>1hr 20min</p>
          <p>Left</p>
        </div>
      </motion.div>

      <motion.div className="wn-r-list" variants={item}>
        <motion.div className="wn-r-line" initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ duration: 1.1, ease: smoothEase, delay: 0.35 }}>
          <img src={routeLine} alt="" />
        </motion.div>
        <AnimatePresence initial={false}>
          {rows.map((r, i) => {
            const last = i === rows.length - 1
            const color = r.kind === 'now' ? INK : DIM
            const h = (r.kind === 'now' || r.kind === 'past' ? 31.813 : 31) + (last ? 0 : ROW_GAP)
            return (
              <motion.div
                key={r.key}
                className="wn-r-row-wrap"
                // 새 경유지가 목록 사이를 벌리고 들어옴
                initial={{ height: 0, opacity: 0, x: -20 }}
                animate={{ height: h, opacity: 1, x: 0 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ height: { type: 'spring', stiffness: 200, damping: 28 }, opacity: { duration: 0.6, delay: 0.25 }, x: { duration: 0.8, ease: smoothEase, delay: 0.25 } }}
              >
                <div className="wn-r-row">
                  <div className="wn-r-left">
                    <RowIcon kind={r.kind} />
                    <motion.p className="wn-r-text" animate={{ color }} transition={{ duration: 0.5 }}>
                      {r.kind === 'gate' ? (
                        <>
                          Gate <RollingText value={gate} />
                        </>
                      ) : (
                        r.label
                      )}
                    </motion.p>
                  </div>
                  <motion.p className="wn-r-time" animate={{ color }} transition={{ duration: 0.5 }}>
                    {r.time}
                  </motion.p>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </motion.div>

      {/* 오른쪽 작은 지도 — 차와 말풍선이 다음 목적지로 옮겨감 */}
      <motion.div className="wn-r-map" variants={item}>
        <div className="wn-r-roads1">
          <div className="wn-r-roads1-inner">
            <img src={mapRoads} alt="" />
          </div>
        </div>
        <div className="wn-r-roads2">
          <div className="wn-r-roads2-inner">
            <img src={mapRoads2} alt="" />
          </div>
        </div>
        <motion.div
          className="wn-r-car"
          initial={false}
          animate={tall ? { left: 46, top: 171, width: 88, height: 48.61 } : { left: 43.14, top: 143.19, width: 77.18, height: 58.4 }}
          transition={{ type: 'spring', stiffness: 70, damping: 16 }}
        >
          <motion.img className="wn-r-car-glass" src={carGlass} alt="" animate={{ opacity: tall ? 0 : 1 }} transition={{ duration: 0.6 }} />
          <motion.img className="wn-r-car-chip" src={carChip} alt="" initial={false} animate={{ opacity: tall ? 1 : 0 }} transition={{ duration: 0.6 }} />
        </motion.div>
        <motion.div
          className="wn-r-chip"
          initial={false}
          animate={tall ? { left: 127, top: 160 } : { left: 32.62, top: 104.6 }}
          transition={{ type: 'spring', stiffness: 90, damping: 16, delay: 0.1 }}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={tall ? 'coffee' : 't1'}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
            >
              {tall ? 'Lounge Coffee' : 'T1 Lounge'}
            </motion.span>
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
