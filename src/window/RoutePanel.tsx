import { AnimatePresence, motion } from 'motion/react'
import carChip from '../assets/window/car-chip.png'
import checkRoute from '../assets/window/check-route.svg'
import icRouteNow from '../assets/window/ic-route-now.svg'
import mapRoads2 from '../assets/window/map-roads-2-v2.svg'
import mapRoads from '../assets/window/map-roads-v2.svg'
import planeRoute from '../assets/window/plane-route.svg'
import rlineDone from '../assets/window/rline-done.svg'
import rlineNext from '../assets/window/rline-next.svg'
import unionShort from '../assets/window/union-route.svg'
import unionTall from '../assets/window/union-route-tall-v2.svg'
import RollingText from '../components/RollingText'
import { smoothEase } from '../motion/transitions'
import type { RouteVariant } from './scenes'

// 피그마 "창문" 525:2139(T1 Lounge) → 525:2238(Dunkin 추가) → 525:2349(Gate 47)
// 경유지가 늘면 유리판이 위로 자라고, 내용이 함께 올라감
const ROW_GAP = 37.427
const ORANGE = '#b4471f'

type Kind = 'done' | 'now' | 'gate'
type Row = { key: string; label: string; time: string; kind: Kind; dark?: boolean }

function rowsOf(v: RouteVariant): Row[] {
  return [
    { key: 'checkin', label: 'Check-in', time: '12:10', kind: 'done' },
    { key: 'baggage', label: 'Baggage Drop', time: '12:14', kind: 'done' },
    { key: 'security', label: 'Security Check', time: '12:20', kind: 'done' },
    { key: 't1', label: 'T1 Lounge', time: '12:43', kind: v === 'base' ? 'now' : 'done', dark: v !== 'base' },
    ...(v === 'base' ? [] : [{ key: 'dunkin', label: 'Dunkin', time: '12:50', kind: 'now' as const }]),
    { key: 'gate', label: 'Gate', time: '14:20', kind: 'gate' },
  ]
}

const spring = { type: 'spring', stiffness: 170, damping: 26 } as const

export default function RoutePanel({ variant }: { variant: RouteVariant }) {
  const tall = variant !== 'base'
  const gate47 = variant === 'gate47'
  const top = tall ? 184 : 249
  const rows = rowsOf(variant)

  return (
    <div className="wn-layer">
      {/* 유리판 — 아래는 그대로, 위로 65px 자람 */}
      <motion.img className="wn-union" src={unionShort} alt="" style={{ left: 367, top: 166, width: 1060, height: 459 }} initial={false} animate={{ opacity: tall ? 0 : 1 }} transition={{ duration: 0.6 }} />
      <motion.img className="wn-union" src={unionTall} alt="" style={{ left: 367, top: 101, width: 1060, height: 524 }} initial={false} animate={{ opacity: tall ? 1 : 0 }} transition={{ duration: 0.6 }} />

      <motion.div className="wn-r-col" initial={false} animate={{ top }} transition={spring} style={{ left: 443 }}>
        <p className="wn-r-label">OUR JOURNEY</p>
        <div className="wn-r-title">
          <p>Navigating to </p>
          <motion.p className="wn-r-gate" initial={false} animate={{ color: gate47 ? ORANGE : '#13182e' }} transition={{ duration: 0.5 }} style={{ fontWeight: gate47 ? 600 : 500 }}>
            Gate <RollingText value={gate47 ? '47' : '16'} />
          </motion.p>
        </div>
      </motion.div>

      {/* 게이트가 바뀌면 붉은 꼬리표가 톡 */}
      <AnimatePresence>
        {gate47 && (
          <motion.p key="tag" className="wn-r-tag" initial={{ opacity: 0, scale: 0.6, y: -6 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ type: 'spring', stiffness: 420, damping: 18, delay: 0.25 }}>
            Route updated · +2 min
          </motion.p>
        )}
      </AnimatePresence>

      <motion.div className="wn-r-col" initial={false} animate={{ top: gate47 ? 417 : tall ? 352 : 417 }} transition={spring} style={{ left: 443 }}>
        <p className="wn-r-label">TIME LEFT</p>
        <p className="wn-r-left">
          <RollingText value={gate47 ? '1h 13m' : '1h 20m'} />
        </p>
      </motion.div>
      <motion.p className="wn-r-arrive" initial={false} animate={{ top: gate47 ? 521 : tall ? 456 : 521 }} transition={spring}>
        Arrive at gate 14:00
        <br />
        Boards 14:20
      </motion.p>

      <motion.div className="wn-r-list" initial={false} animate={{ top }} transition={spring}>
        <motion.div className="wn-r-line" style={{ top: 15 }} initial={false} animate={{ height: tall ? 271 : 206 }} transition={spring}>
          <img src={rlineDone} alt="" />
        </motion.div>
        <motion.div className="wn-r-line" initial={false} animate={{ top: tall ? 286 : 221 }} style={{ height: 73 }} transition={spring}>
          <img src={rlineNext} alt="" />
        </motion.div>
        <AnimatePresence initial={false}>
          {rows.map((r, i) => {
            const last = i === rows.length - 1
            const h = (r.kind === 'now' ? 31.813 : 31) + (last ? 0 : ROW_GAP)
            const isGate47 = r.kind === 'gate' && gate47
            const textColor = r.kind === 'now' ? '#050c2c' : isGate47 ? ORANGE : '#8e97a9'
            const timeColor = r.kind === 'now' || r.dark ? '#050c2c' : '#36424e'
            return (
              <motion.div
                key={r.key}
                className="wn-r-row-wrap"
                // 새 경유지가 목록 사이를 벌리고 들어옴
                initial={{ height: 0, opacity: 0, x: -20 }}
                animate={{ height: h, opacity: 1, x: 0 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ height: spring, opacity: { duration: 0.6, delay: 0.25 }, x: { duration: 0.8, ease: smoothEase, delay: 0.25 } }}
              >
                <div className="wn-r-row">
                  <div className="wn-r-left-cell">
                    {r.kind === 'gate' ? (
                      <img src={planeRoute} alt="" width={20.585} height={20.585} />
                    ) : (
                      <span className="wn-r-ic">
                        {/* 지금 가는 곳은 화살표 점, 지나간 곳은 체크 */}
                        <motion.img src={checkRoute} alt="" width={20.585} height={20.585} initial={false} animate={{ opacity: r.kind === 'done' ? 1 : 0, scale: r.kind === 'done' ? 1 : 0.5 }} transition={{ duration: 0.4 }} />
                        <motion.img className="is-now" src={icRouteNow} alt="" width={22} height={22} initial={false} animate={{ opacity: r.kind === 'now' ? 1 : 0, scale: r.kind === 'now' ? 1 : 0.5 }} transition={{ duration: 0.4 }} />
                      </span>
                    )}
                    <motion.p className="wn-r-text" initial={false} animate={{ color: textColor }} transition={{ duration: 0.5 }} style={{ fontWeight: r.kind === 'now' ? 600 : isGate47 ? 500 : 400 }}>
                      {r.kind === 'gate' ? (
                        <>
                          Gate <RollingText value={gate47 ? '47' : '16'} />
                        </>
                      ) : (
                        r.label
                      )}
                    </motion.p>
                  </div>
                  <motion.p className="wn-r-time" initial={false} animate={{ color: timeColor }} transition={{ duration: 0.5 }} style={{ fontWeight: r.kind === 'now' ? 600 : 400 }}>
                    {r.time}
                  </motion.p>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </motion.div>

      {/* 오른쪽 작은 지도 */}
      <motion.div className="wn-r-map" initial={false} animate={{ top }} transition={spring}>
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
        <motion.div className="wn-r-car" animate={{ y: [0, -2, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}>
          <img src={carChip} alt="" />
        </motion.div>
        <AnimatePresence>
          {variant === 'coffee' && (
            <motion.p key="chip" className="wn-r-chip" initial={{ opacity: 0, scale: 0.5, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ type: 'spring', stiffness: 380, damping: 18, delay: 0.35 }}>
              Dunkin
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
