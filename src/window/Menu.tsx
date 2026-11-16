import { AnimatePresence, motion, useAnimationControls } from 'motion/react'
import icBag from '../assets/window/v3-rail-bag.svg'
import icCamera from '../assets/window/v3-rail-camera.svg'
import icClose from '../assets/window/v3-rail-close.svg'
import icFlight from '../assets/window/v3-rail-flight.svg'
import icFlightWhite from '../assets/window/v3-pill-flight.svg'
import icRouteWhite from '../assets/window/v3-pill-route.svg'
import icRoute from '../assets/window/v3-rail-route.svg'
import { smoothEase } from '../motion/transitions'
import FlightPanel from './FlightPanel'
import RoutePanel from './RoutePanel'
import type { MenuState, RouteVariant } from './scenes'

// 피그마 "창문 디벨롭할게요" 왼쪽 메뉴 — 고른 탭은 둥근 버튼이 옆으로 늘어나 검은 알약(AIRA Route / OUR FLIGHT)이 됨
type Item = 'route' | 'flight' | 'suitcase' | 'camera' | 'close'
const ITEMS: Item[] = ['route', 'flight', 'suitcase', 'camera', 'close']
type Tab = 'route' | 'flight'

// 버튼 세로 위치 (피그마 "창문 디벨롭할게요1") — 메뉴를 펼친 상태·두 탭 모두 같은 자리
const RAIL = { route: 632, flight: 712, suitcase: 792, camera: 872, close: 952 }
const TOP: Record<'open' | Tab, Record<Item, number>> = { open: RAIL, route: RAIL, flight: RAIL }

const PILL: Record<Tab, { width: number; label: string; icon: string; size: [number, number] }> = {
  route: { width: 183, label: 'AIRA Route', icon: icRouteWhite, size: [22.119, 14.925] },
  flight: { width: 183, label: 'Our Flight', icon: icFlightWhite, size: [27, 27] },
}

const ICON: Record<Item, string> = { route: icRoute, flight: icFlight, suitcase: icBag, camera: icCamera, close: icClose }

const settle = { type: 'spring', stiffness: 260, damping: 30 } as const

function RailItem({ item, state, order, onPick }: { item: Item; state: 'open' | Tab; order: number; onPick: (i: Item) => void }) {
  const active = item === state
  const pill = active ? PILL[item as Tab] : null
  const shake = useAnimationControls()

  return (
    <motion.button
      type="button"
      className="wn-rail-item"
      aria-label={item}
      // MENU 자리(맨 아래)에서 하나씩 위로 펼쳐짐
      initial={{ top: 973, opacity: 0, scale: 0.6, width: 60, height: 60 }}
      animate={{
        top: TOP[state][item],
        opacity: 1,
        scale: 1,
        width: pill ? pill.width : 60,
        height: 60,
        backgroundColor: active ? 'rgba(9,18,31,1)' : 'rgba(223,223,223,0.2)',
        borderColor: active ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.05)',
        borderWidth: active ? 1.5 : 2.25,
        boxShadow: active ? '0 0 0px rgba(155,176,187,0)' : '0 0 15px rgba(155,176,187,1)',
      }}
      exit={{ top: 973, opacity: 0, scale: 0.6, transition: { duration: 0.35, ease: smoothEase, delay: (4 - order) * 0.03 } }}
      transition={{ default: settle, top: { ...settle, delay: order * 0.05 }, opacity: { duration: 0.4, delay: order * 0.05 }, scale: { ...settle, delay: order * 0.05 } }}
      whileTap={active ? undefined : { scale: 0.9 }}
      onClick={(e) => {
        e.stopPropagation()
        if (item === 'suitcase' || item === 'camera') {
          // 아직 화면이 없는 메뉴 — 고개를 젓듯 살짝 흔들림
          shake.start({ x: [0, -6, 6, -4, 4, 0], transition: { duration: 0.45 } })
          return
        }
        onPick(item)
      }}
    >
      <motion.span className="wn-rail-shake" animate={shake}>
        <motion.span className="wn-rail-icon" initial={false} animate={{ opacity: active ? 0 : 1 }} transition={{ duration: 0.2 }}>
          {item === 'route' ? <img src={ICON[item]} alt="" width={22.119} height={14.925} /> : <img src={ICON[item]} alt="" width={27} height={27} />}
        </motion.span>
        {pill && (
          <motion.span className="wn-pill" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.45, ease: smoothEase, delay: 0.15 }}>
            <span className="wn-pill-dot" />
            <span className="wn-pill-ic">
              <img src={pill.icon} alt="" width={pill.size[0]} height={pill.size[1]} />
            </span>
            <span className="wn-pill-text">{pill.label}</span>
          </motion.span>
        )}
      </motion.span>
    </motion.button>
  )
}

// 패널이 바뀔 때 — 유리판이 부풀어 오르듯
const panelMotion = {
  initial: { opacity: 0, scale: 0.94, filter: 'blur(16px)' },
  animate: { opacity: 1, scale: 1, filter: 'blur(0px)', transition: { duration: 0.7, ease: smoothEase } },
  exit: { opacity: 0, scale: 0.97, filter: 'blur(12px)', transition: { duration: 0.3, ease: smoothEase } },
}

export default function Menu({ state, variant, onState }: { state: Exclude<MenuState, null>; variant: RouteVariant; onState: (s: MenuState) => void }) {
  return (
    <motion.div className="wn-layer wn-noclick" exit={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <AnimatePresence mode="popLayout">
        {state === 'route' && (
          <motion.div key="route" className="wn-layer" style={{ originX: '20%', originY: '50%' }} {...panelMotion}>
            <RoutePanel variant={variant} />
          </motion.div>
        )}
        {state === 'flight' && (
          <motion.div key="flight" className="wn-layer" style={{ originX: '20%', originY: '60%' }} {...panelMotion}>
            <FlightPanel variant={variant} />
          </motion.div>
        )}
      </AnimatePresence>

      {ITEMS.map((item, i) => (
        <RailItem key={item} item={item} state={state} order={i} onPick={(picked) => onState(picked === 'close' ? null : (picked as Tab))} />
      ))}
    </motion.div>
  )
}
