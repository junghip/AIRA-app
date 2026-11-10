import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useState } from 'react'
import { smoothEase } from '../motion/transitions'
import Backdrop from './Backdrop'
import CarUI from './CarUI'
import GateUpdated from './GateUpdated'
import Logo from './Logo'
import Suggest from './Suggest'
import TextScene from './TextScene'
import { SCENES, isCarScene, type MenuTab, type RouteVariant, type Scene } from './scenes'
import './Window.css'

// 피그마 Section 10 "차량 창문" — 1920×1080 화면을 창 크기에 맞춰 통째로 확대·축소
export const STAGE_W = 1920
export const STAGE_H = 1080

function useStageScale() {
  const calc = () => Math.min(window.innerWidth / STAGE_W, window.innerHeight / STAGE_H)
  const [scale, setScale] = useState(calc)
  useEffect(() => {
    const onResize = () => setScale(calc())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return scale
}

// 장면에 들어올 때 보여줄 경로 → 잠시 뒤 바뀔 경로 (끼어드는 모션을 보여주려고 한 박자 늦춤)
const ROUTE_FLOW: Partial<Record<Scene, [RouteVariant, RouteVariant]>> = {
  dashboard: ['base', 'base'],
  route: ['base', 'coffee'],
  route47: ['coffee', 'gate47'],
}

// 온보딩·마무리 장면은 손대지 않아도 이만큼(ms) 지나면 저절로 넘어감 — 터치하면 바로 넘어가는 건 그대로
const AUTO_NEXT: Partial<Record<Scene, number>> = {
  welcome: 4500,
  seat: 5000,
  waiting: 4500,
  starting: 4000,
  arrivedGate: 5000,
  bye: 6000, // 마지막 → 처음으로 (전시 반복)
}

const TEXT: Partial<Record<Scene, { title: string; sub: string; weight?: 'semibold' }>> = {
  seat: { title: 'Take a seat to get started', sub: 'Your seat will recognize your flight and guide you through check-in' },
  waiting: { title: 'Waiting for everyone', sub: '2 of 4 seated' },
  starting: { title: 'Starting your journey', sub: 'All seated!' },
  arrivedCoffee: { title: 'We’ve arrived at Lounge Coffee', sub: 'AIRA will wait right here for you', weight: 'semibold' },
  arrivedGate: { title: 'We’ve arrived at Gate 47', sub: 'Have a wonderful trip to Berlin', weight: 'semibold' },
}

export default function Window() {
  const scale = useStageScale()
  const [index, setIndex] = useState(0)
  const scene: Scene = SCENES[index]
  const [run, setRun] = useState(0)

  // 메뉴 — 대시보드에선 닫힌 채로, 경로 장면에선 AIRA Route 탭이 열린 채로 시작
  const [menu, setMenu] = useState<MenuTab | null>(null)
  const [variant, setVariant] = useState<RouteVariant>('base')

  // 장면을 바꿀 때 메뉴·경로 상태도 한 번에 맞춤 (한 프레임이라도 엉뚱한 화면이 끼지 않게)
  const enter = useCallback((i: number) => {
    const s = SCENES[i]
    setIndex(i)
    setMenu(s === 'route' || s === 'route47' ? 'route' : null)
    const flow = ROUTE_FLOW[s]
    if (flow) setVariant(flow[0])
  }, [])

  // 경로가 바뀌는 장면 — 들어오고 한 박자 뒤에 새 경유지·새 게이트가 끼어듦
  useEffect(() => {
    const flow = ROUTE_FLOW[scene]
    if (!flow || flow[0] === flow[1]) return
    const t = setTimeout(() => setVariant(flow[1]), 900)
    return () => clearTimeout(t)
  }, [scene, run])

  const go = useCallback((d: number) => enter(Math.min(SCENES.length - 1, Math.max(0, index + d))), [enter, index])
  const restart = useCallback(() => {
    enter(0)
    setRun((n) => n + 1)
  }, [enter])

  useEffect(() => {
    const wait = AUTO_NEXT[scene]
    if (!wait) return
    const t = setTimeout(() => (scene === 'bye' ? restart() : go(1)), wait)
    return () => clearTimeout(t)
  }, [scene, run, go, restart])

  // 전시용 키 — →/스페이스 다음, ← 이전, R 처음부터, Esc 메뉴 닫기
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') go(1)
      else if (e.key === 'ArrowLeft') go(-1)
      else if (e.key === 'r' || e.key === 'R') restart()
      else if (e.key === 'Escape') setMenu(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, restart])

  const car = isCarScene(scene)
  const text = TEXT[scene]

  return (
    <div className="wn-viewport">
      <div
        className="wn-stage"
        style={{ width: STAGE_W, height: STAGE_H, transform: `translate(-50%, -50%) scale(${scale})` }}
        onClick={() => {
          // 마지막 장면에선 처음으로
          if (scene === 'bye') restart()
          else go(1)
        }}
      >
        <Backdrop scene={scene} menu={car ? menu : null} />

        <AnimatePresence>
          {car && (
            <motion.div
              key={`car-${run}`}
              className="wn-layer"
              exit={{ opacity: 0, filter: 'blur(14px)' }}
              transition={{ duration: 0.7, ease: smoothEase }}
            >
              <CarUI menu={menu} variant={variant} onMenu={setMenu} />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {scene === 'suggest' && (
            <motion.div key={`suggest-${run}`} className="wn-layer" exit={{ opacity: 0, scale: 0.97, filter: 'blur(14px)' }} transition={{ duration: 0.6, ease: smoothEase }}>
              <Suggest onAdd={() => go(1)} />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {scene === 'gate' && (
            <motion.div key={`gate-${run}`} className="wn-layer" exit={{ opacity: 0, filter: 'blur(14px)' }} transition={{ duration: 0.6, ease: smoothEase }}>
              <GateUpdated />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {text && (
            <motion.div key={`${scene}-${run}`} className="wn-layer" exit={{ opacity: 0, y: -16, filter: 'blur(10px)' }} transition={{ duration: 0.45, ease: smoothEase }}>
              <TextScene title={text.title} sub={text.sub} semibold={text.weight === 'semibold'} />
            </motion.div>
          )}
        </AnimatePresence>

        <Logo scene={scene} run={run} />
      </div>
    </div>
  )
}
