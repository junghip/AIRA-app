import { AnimatePresence, motion, useAnimationControls } from 'motion/react'
import icAiraDark from '../assets/window/ic-aira.svg'
import icAira from '../assets/window/ic-aira-2.svg'
import icCameraDark from '../assets/window/ic-camera-dark.svg'
import icCamera from '../assets/window/ic-camera.svg'
import icClose from '../assets/window/ic-close.svg'
import icFlightDark from '../assets/window/ic-flight-dark.svg'
import icFlight from '../assets/window/ic-flight.svg'
import icSuitcase from '../assets/window/ic-suitcase.svg'
import { smoothEase } from '../motion/transitions'
import FlightPanel from './FlightPanel'
import RoutePanel from './RoutePanel'
import unionPhoto from '../assets/window/union-photo.svg'
import type { MenuTab, RouteVariant } from './scenes'

// 피그마 Section 9/10 왼쪽 메뉴 — 고른 탭은 둥근 버튼에서 빠져나와 패널의 손잡이(탭)가 됨
type Item = 'route' | 'flight' | 'suitcase' | 'photo' | 'close'
const ITEMS: Item[] = ['route', 'flight', 'suitcase', 'photo', 'close']

// 탭마다 버튼 세로 위치 (피그마 그대로, 80×80 버튼의 top)
const TOPS: Record<MenuTab, Record<Item, number>> = {
  route: { route: 534, flight: 636, suitcase: 737, photo: 835, close: 933 },
  flight: { route: 541, flight: 639, suitcase: 737, photo: 835, close: 933 },
  photo: { route: 534, flight: 636, suitcase: 735, photo: 832, close: 933 },
}

const ICON: Record<Item, { light: string; dark?: string; label?: string }> = {
  route: { light: icAira, dark: icAiraDark, label: 'AIRA Route' },
  flight: { light: icFlight, dark: icFlightDark, label: 'OUR FLIGHT' },
  suitcase: { light: icSuitcase },
  photo: { light: icCamera, dark: icCameraDark, label: 'PHOTO' },
  close: { light: icClose },
}

const settle = { type: 'spring', stiffness: 260, damping: 30 } as const

function RailItem({ item, tab, order, onPick }: { item: Item; tab: MenuTab; order: number; onPick: (i: Item) => void }) {
  const active = item === tab
  const { light, dark, label } = ICON[item]
  const shake = useAnimationControls()
  const isAira = item === 'route'

  return (
    <motion.button
      type="button"
      className="wn-rail-item"
      aria-label={label ?? item}
      // MENU 버튼 자리(아래)에서 하나씩 위로 펼쳐짐
      initial={{ top: 933, opacity: 0, scale: 0.6 }}
      animate={{ top: TOPS[tab][item], opacity: 1, scale: 1 }}
      exit={{ top: 933, opacity: 0, scale: 0.6, transition: { duration: 0.35, ease: smoothEase, delay: (4 - order) * 0.03 } }}
      transition={{ top: { ...settle, delay: order * 0.05 }, opacity: { duration: 0.4, delay: order * 0.05 }, scale: { ...settle, delay: order * 0.05 } }}
      whileTap={active ? undefined : { scale: 0.9 }}
      onClick={(e) => {
        e.stopPropagation()
        if (item === 'suitcase') {
          // 아직 화면이 없는 메뉴 — 고개를 젓듯 살짝 흔들림
          shake.start({ x: [0, -6, 6, -4, 4, 0], transition: { duration: 0.45 } })
          return
        }
        onPick(item)
      }}
    >
      <motion.span className="wn-rail-shake" animate={shake}>
        <motion.span className="wn-rail-circle" animate={{ opacity: active ? 0 : 1, scale: active ? 1.4 : 1 }} transition={{ duration: 0.35, ease: smoothEase }} />
        <motion.span className="wn-rail-icon" animate={{ opacity: active ? 0 : 1 }} transition={{ duration: 0.25 }}>
          {isAira ? (
            <span className="wn-ic-aira">
              <img src={light} alt="" />
            </span>
          ) : (
            <img src={light} alt="" width={36} height={36} />
          )}
        </motion.span>
        {dark && (
          <motion.span
            className="wn-rail-label"
            initial={false}
            animate={{ opacity: active ? 1 : 0, x: active ? 0 : -8, filter: active ? 'blur(0px)' : 'blur(4px)' }}
            transition={{ duration: 0.45, ease: smoothEase, delay: active ? 0.15 : 0 }}
          >
            {isAira ? (
              <span className="wn-ic-aira">
                <img src={dark} alt="" />
              </span>
            ) : (
              <img src={dark} alt="" width={36} height={36} />
            )}
            <span className="wn-rail-text">{label}</span>
          </motion.span>
        )}
      </motion.span>
    </motion.button>
  )
}

// 패널이 바뀔 때 — 탭 쪽(왼쪽 아래)에서 부풀어 오르듯
const panelMotion = {
  initial: { opacity: 0, scale: 0.94, filter: 'blur(16px)' },
  animate: { opacity: 1, scale: 1, filter: 'blur(0px)', transition: { duration: 0.7, ease: smoothEase } },
  exit: { opacity: 0, scale: 0.97, filter: 'blur(12px)', transition: { duration: 0.3, ease: smoothEase } },
}

export default function Menu({ tab, variant, onTab, onClose }: { tab: MenuTab; variant: RouteVariant; onTab: (t: MenuTab) => void; onClose: () => void }) {
  return (
    <motion.div className="wn-layer" initial={false} exit={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <AnimatePresence mode="popLayout">
        {tab === 'route' && (
          <motion.div key="route" className="wn-layer wn-panel-wrap" style={{ originX: '10%', originY: '90%' }} {...panelMotion}>
            <RoutePanel variant={variant} />
          </motion.div>
        )}
        {tab === 'flight' && (
          <motion.div key="flight" className="wn-layer wn-panel-wrap" style={{ originX: '8%', originY: '62%' }} {...panelMotion}>
            <FlightPanel variant={variant} />
          </motion.div>
        )}
        {tab === 'photo' && (
          <motion.div key="photo" className="wn-layer wn-panel-wrap" style={{ originX: '6%', originY: '82%' }} {...panelMotion}>
            <img className="wn-union" src={unionPhoto} alt="" style={{ left: 60, top: 60, width: 1800, height: 960 }} />
            <motion.div
              className="wn-photo-frame"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, ease: smoothEase, delay: 0.2 }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {ITEMS.map((item, i) => (
        <RailItem
          key={item}
          item={item}
          tab={tab}
          order={i}
          onPick={(picked) => {
            if (picked === 'close') onClose()
            else onTab(picked as MenuTab)
          }}
        />
      ))}
    </motion.div>
  )
}
