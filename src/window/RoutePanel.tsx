import { AnimatePresence, motion } from 'motion/react'
import carChip from '../assets/window/car-chip.png'
import mapRoads2 from '../assets/window/map-roads-2-v2.svg'
import planeRoute from '../assets/window/plane-route.svg'
import checkRoute from '../assets/window/v3-r-check.svg'
import icDunkin from '../assets/window/v3-r-dunkin.svg'
import icRouteNow from '../assets/window/v3-r-now.svg'
import mapRoads from '../assets/window/v3-r-roads1.svg'
import unionShort from '../assets/window/v3-union-base.svg'
import unionTall from '../assets/window/v3-union-tall.svg'
import RollingText from '../components/RollingText'
import { smoothEase } from '../motion/transitions'
import type { RouteVariant } from './scenes'

// 피그마 "창문 디벨롭할게요" 532:3340(T1 Lounge) → 532:3443(Dunkin 추가) → 532:3562(Gate 47)
// 경유지가 늘면 유리판이 위로 자라고, 내용이 함께 올라감. 지나온 길은 선이 위에서부터 차오름
const ORANGE = '#cd4f36'
const ROW_H = 31.3

type Kind = 'done' | 'now' | 'stop' | 'gate'
type Row = { key: string; label: string; time: string; kind: Kind }

function rowsOf(v: RouteVariant): Row[] {
  return [
    { key: 'checkin', label: 'Check-in', time: '12:10', kind: 'done' },
    { key: 'baggage', label: 'Baggage Drop', time: '12:14', kind: 'done' },
    { key: 'security', label: 'Security Check', time: '12:20', kind: 'done' },
    { key: 't1', label: 'T1 Lounge', time: '12:43', kind: 'now' },
    ...(v === 'base' ? [] : [{ key: 'dunkin', label: 'Dunkin', time: '12:50', kind: 'stop' as const }]),
    { key: 'gate', label: 'Gate', time: '14:20', kind: 'gate' },
  ]
}

// 아래 칸으로 이어지는 선 색 — 지나온 길은 옅은 회색, 지금 → 다음 경유지는 진한 남색, 게이트까지는 회색
function lineColor(from: Row, to: Row) {
  if (to.kind === 'gate') return '#979a9c'
  if (from.kind === 'now' && to.kind === 'stop') return '#050c2c'
  return '#8e97a9'
}

const spring = { type: 'spring', stiffness: 170, damping: 26 } as const

export default function RoutePanel({ variant }: { variant: RouteVariant }) {
  const tall = variant !== 'base'
  const gate47 = variant === 'gate47'
  const top = tall ? 289 : 336
  const listH = tall ? 350.937 : 317
  const rows = rowsOf(variant)
  // 칸 사이 간격 — 피그마: 5칸일 땐 37.4px, 6칸이면 목록 높이에 맞춰 촘촘해짐
  const gap = tall ? (listH - rows.length * ROW_H) / (rows.length - 1) : 37.427
  // 왼쪽 글 묶음 — 위·가운데·아래로 벌어짐 (피그마 space-between)
  const timeTop = gate47 ? 189 : tall ? 172.7 : 151.75
  const arriveTop = tall ? 306.1 : 264.2

  return (
    <div className="wn-layer">
      {/* 유리판 — 아래는 그대로, 위로 44px 자람 */}
      <motion.img className="wn-union" src={unionShort} alt="" style={{ left: 274, top: 261, width: 1060, height: 451 }} initial={false} animate={{ opacity: tall ? 0 : 1 }} transition={{ duration: 0.6 }} />
      <motion.img className="wn-union" src={unionTall} alt="" style={{ left: 274, top: 217, width: 1060, height: 495 }} initial={false} animate={{ opacity: tall ? 1 : 0 }} transition={{ duration: 0.6 }} />

      <motion.div className="wn-r-col" initial={false} animate={{ top }} transition={spring} style={{ left: 350 }}>
        <p className="wn-r-label">OUR JOURNEY</p>
        <div className="wn-r-title">
          <p>Navigating to </p>
          <motion.p initial={false} animate={{ color: gate47 ? ORANGE : '#13182e' }} transition={{ duration: 0.5 }}>
            Gate <RollingText value={gate47 ? '47' : '16'} />
          </motion.p>
        </div>
        {/* 게이트가 바뀌면 붉은 꼬리표가 톡 */}
        <AnimatePresence>
          {gate47 && (
            <motion.p key="tag" className="wn-r-tag" initial={{ opacity: 0, scale: 0.6, y: -6 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ type: 'spring', stiffness: 420, damping: 18, delay: 0.25 }}>
              Route updated +2 min
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div className="wn-r-col" initial={false} animate={{ top: top + timeTop }} transition={spring} style={{ left: 350 }}>
        <p className="wn-r-label">TIME LEFT</p>
        <p className="wn-r-left">
          <RollingText value={gate47 ? '1h 22m' : '1h 20m'} />
        </p>
      </motion.div>
      <motion.p className="wn-r-arrive" initial={false} animate={{ top: top + arriveTop }} transition={spring}>
        Arrive at gate 14:00
        <br />
        Boards 14:20
      </motion.p>

      <motion.div className="wn-r-list" initial={false} animate={{ top }} transition={spring}>
        <AnimatePresence initial={false}>
          {rows.map((r, i) => {
            const next = rows[i + 1]
            const h = ROW_H + (next ? gap : 0)
            const strong = r.kind === 'now' || r.kind === 'stop'
            const isGate47 = r.kind === 'gate' && gate47
            const textColor = strong ? '#050c2c' : isGate47 ? ORANGE : '#8e97a9'
            const timeColor = strong ? '#050c2c' : '#36424e'
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
                {/* 다음 칸까지 이어지는 선 — 위에서 아래로 차오름 */}
                {next && (
                  <motion.span
                    className="wn-r-seg"
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1, height: ROW_H + gap - 12.8, backgroundColor: lineColor(r, next) }}
                    transition={{ scaleY: { duration: 0.5, ease: smoothEase, delay: 0.35 + i * 0.18 }, height: spring, backgroundColor: { duration: 0.5 } }}
                  />
                )}
                <div className="wn-r-row">
                  <div className="wn-r-left-cell">
                    <span className="wn-r-ic">
                      {r.kind === 'gate' ? (
                        <img src={planeRoute} alt="" width={20.585} height={20.585} />
                      ) : r.kind === 'done' ? (
                        <img src={checkRoute} alt="" width={22} height={22} />
                      ) : r.kind === 'now' ? (
                        // 지금 있는 곳 — 화살표가 앞으로 살짝살짝
                        <motion.img src={icRouteNow} alt="" width={22} height={22} animate={{ x: [0, 1.5, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }} />
                      ) : (
                        // 새 경유지 — 과녁처럼 한 번 퍼짐
                        <motion.img src={icDunkin} alt="" width={22} height={22} initial={{ scale: 0 }} animate={{ scale: [0, 1.3, 1] }} transition={{ duration: 0.6, ease: smoothEase, delay: 0.6 }} />
                      )}
                    </span>
                    <motion.p className="wn-r-text" initial={false} animate={{ color: textColor }} transition={{ duration: 0.5 }} style={{ fontWeight: strong ? 600 : isGate47 ? 500 : 400 }}>
                      {r.kind === 'gate' ? (
                        <>
                          Gate <RollingText value={gate47 ? '47' : '16'} />
                        </>
                      ) : (
                        r.label
                      )}
                    </motion.p>
                  </div>
                  <motion.p className="wn-r-time" initial={false} animate={{ color: timeColor }} transition={{ duration: 0.5 }} style={{ fontWeight: strong ? 600 : 400 }}>
                    {r.time}
                  </motion.p>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </motion.div>

      {/* 오른쪽 작은 지도 */}
      <motion.div className="wn-r-map" initial={false} animate={{ top, height: listH }} transition={spring}>
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
          {tall && (
            <motion.p key="chip" className="wn-r-chip" initial={{ opacity: 0, scale: 0.5, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ type: 'spring', stiffness: 380, damping: 18, delay: 0.35 }}>
              Dunkin
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
