import { AnimatePresence, motion, useAnimationControls } from 'motion/react'
import icAira from '../assets/window/ic-aira-2.svg'
import icAiraWhite from '../assets/window/ic-aira-white.svg'
import icCamera from '../assets/window/ic-camera-v2.svg'
import icClose from '../assets/window/ic-close-v2.svg'
import icFlightPill from '../assets/window/ic-flight-pill.svg'
import icFlight from '../assets/window/ic-flight-v2.svg'
import icSuitcase from '../assets/window/ic-suitcase-v2.svg'
import { smoothEase } from '../motion/transitions'
import FlightPanel from './FlightPanel'
import RoutePanel from './RoutePanel'
import type { MenuState, RouteVariant } from './scenes'

// 피그마 "창문" 왼쪽 메뉴 — 고른 탭은 둥근 버튼이 옆으로 늘어나 검은 알약(AIRA Route / OUR FLIGHT)이 됨
type Item = 'route' | 'flight' | 'suitcase' | 'camera' | 'close'
const ITEMS: Item[] = ['route', 'flight', 'suitcase', 'camera', 'close']
type Tab = 'route' | 'flight'

// 버튼 세로 위치 (피그마 그대로)
const TOP: Record<'open' | Tab, Record<Item, number>> = {
  open: { route: 538, flight: 636, suitcase: 737, camera: 835, close: 933 },
  route: { route: 524, flight: 636, suitcase: 737, camera: 835, close: 933 },
  flight: { route: 538, flight: 635, suitcase: 737, camera: 835, close: 933 },
}

const PILL: Record<Tab, { width: number; height: number; label: string }> = {
  route: { width: 248, height: 81.311, label: 'AIRA Route' },
  flight: { width: 263, height: 81, label: 'OUR FLIGHT' },
}

const ICON: Record<Item, string> = { route: icAira, flight: icFlight, suitcase: icSuitcase, camera: icCamera, close: icClose }

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
      initial={{ top: 933, opacity: 0, scale: 0.6, width: 80, height: 80 }}
      animate={{
        top: TOP[state][item],
        opacity: 1,
        scale: 1,
        width: pill ? pill.width : 80,
        height: pill ? pill.height : 80,
        backgroundColor: active ? 'rgba(9,18,31,1)' : 'rgba(223,223,223,0.2)',
        borderColor: active ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.05)',
        borderWidth: active ? 2.033 : 3,
        boxShadow: active ? '0 0 0px rgba(155,176,187,0)' : '0 0 20px rgba(155,176,187,1)',
      }}
      exit={{ top: 933, opacity: 0, scale: 0.6, transition: { duration: 0.35, ease: smoothEase, delay: (4 - order) * 0.03 } }}
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
          {item === 'route' ? (
            <span className="wn-ic-aira">
              <img src={ICON[item]} alt="" />
            </span>
          ) : (
            <img src={ICON[item]} alt="" width={36} height={36} />
          )}
        </motion.span>
        {pill && (
          <motion.span className="wn-pill" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.45, ease: smoothEase, delay: 0.15 }}>
            {item === 'route' ? (
              <>
                <span className="wn-pill-dot" />
                <span className="wn-ic-aira is-pill">
                  <img src={icAiraWhite} alt="" />
                </span>
              </>
            ) : (
              <img className="wn-pill-flight" src={icFlightPill} alt="" width={49.803} height={49.803} />
            )}
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
