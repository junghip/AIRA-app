import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useState } from 'react'
import { smoothEase } from '../motion/transitions'
import { ArrivedCoffee } from './Arrival'
import Backdrop from './Backdrop'
import CarUI from './CarUI'
import { BottomBar, TopBar } from './Chrome'
import GateUpdated from './GateUpdated'
import Intro from './Intro'
import Logo from './Logo'
import Suggest from './Suggest'
import { SCENES, isCarScene, type MenuState, type RouteVariant, type Scene } from './scenes'
import './Window.css'

// 피그마 "창문" 섹션 — 1920×1080 화면을 창 크기에 맞춰 통째로 확대·축소
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
  route: ['base', 'base'],
  routeCoffee: ['base', 'coffee'],
  route47: ['coffee', 'gate47'],
  flight: ['gate47', 'gate47'],
}

// 저절로 넘어가는 시간 (ms) — 장면 안 모션이 다 끝나고 잠깐 머문 뒤 다음으로. 마지막 장면 뒤엔 처음부터 다시
const HOLD: Record<Scene, number> = {
  welcome: 5000,
  waiting: 4500,
  seated: 4000,
  starting: 5500,
  dashboard: 7500,
  route: 5000,
  suggest: 7000,
  routeCoffee: 5500,
  arrivedCoffee: 8000,
  gate: 6500,
  route47: 5500,
  flight: 6500,
  bye: 6000,
}
// 대시보드에선 잠시 뒤 MENU가 저절로 눌린 것처럼 펼쳐짐
const AUTO_MENU_AT = 4000
// 추천 장면이 끝나기 이만큼 전에 Add to route가 강조됨
const CUE_BEFORE = 2000

const layerExit = { opacity: 0, filter: 'blur(14px)', transition: { duration: 0.6, ease: smoothEase } }

export default function Window() {
  const scale = useStageScale()
  const [index, setIndex] = useState(0)
  const scene: Scene = SCENES[index]
  const [run, setRun] = useState(0)
  // 추천 장면 — 넘어가기 직전 Add to route 버튼을 강조 (다음 화면이 이 버튼의 결과임을 보여줌)
  const [cue, setCue] = useState(false)

  // 메뉴 — 대시보드에선 닫힌 채로, 경로 장면에선 AIRA Route 탭이 열린 채로 시작
  const [menu, setMenu] = useState<MenuState>(null)
  const [variant, setVariant] = useState<RouteVariant>('base')

  // 장면을 바꿀 때 메뉴·경로 상태도 한 번에 맞춤 (한 프레임이라도 엉뚱한 화면이 끼지 않게)
  const enter = useCallback((i: number) => {
    const s = SCENES[i]
    setIndex(i)
    setCue(false)
    setMenu(s === 'flight' ? 'flight' : s === 'route' || s === 'routeCoffee' || s === 'route47' ? 'route' : null)
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

  // 자동 재생 — P 키로 멈춤/다시 재생. 터치하면 기다리지 않고 바로 다음으로
  const [paused, setPaused] = useState(false)
  useEffect(() => {
    if (paused) return
    const t = setTimeout(() => (scene === 'bye' ? restart() : go(1)), HOLD[scene])
    const m = scene === 'dashboard' ? setTimeout(() => setMenu((cur) => cur ?? 'open'), AUTO_MENU_AT) : undefined
    const c = scene === 'suggest' ? setTimeout(() => setCue(true), HOLD.suggest - CUE_BEFORE) : undefined
    return () => {
      clearTimeout(t)
      clearTimeout(m)
      clearTimeout(c)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, run, paused])

  // 전시용 키 — →/스페이스 다음, ← 이전, R 처음부터, Esc 메뉴 닫기, P 자동 재생 멈춤
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') go(1)
      else if (e.key === 'ArrowLeft') go(-1)
      else if (e.key === 'r' || e.key === 'R') restart()
      else if (e.key === 'Escape') setMenu(null)
      else if (e.key === 'p' || e.key === 'P') setPaused((v) => !v)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, restart])

  const car = isCarScene(scene)

  return (
    <div className="wn-viewport">
      <div
        className="wn-stage"
        style={{ width: STAGE_W, height: STAGE_H, transform: `translate(-50%, -50%) scale(${scale})` }}
        // 화면 아무 데나 터치하면 다음 장면, 마지막 장면에선 처음으로
        onClick={() => (scene === 'bye' ? restart() : go(1))}
      >
        <Backdrop scene={scene} menu={car ? menu : null} />
        <TopBar scene={scene} />
        <BottomBar scene={scene} />
        <Intro key={`intro-${run}`} scene={scene} />

        <AnimatePresence>
          {car && (
            <motion.div key={`car-${run}`} className="wn-layer" exit={layerExit}>
              <CarUI menu={menu} variant={variant} onMenu={setMenu} />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {scene === 'suggest' && (
            <motion.div key={`suggest-${run}`} className="wn-layer" exit={{ ...layerExit, scale: 0.97 }}>
              <Suggest cue={cue} onAdd={() => go(1)} onSkip={() => go(-1)} />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {scene === 'arrivedCoffee' && (
            <motion.div key={`coffee-${run}`} className="wn-layer" exit={layerExit}>
              <ArrivedCoffee />
            </motion.div>
          )}
          {scene === 'gate' && (
            <motion.div key={`gate-${run}`} className="wn-layer" exit={layerExit}>
              <GateUpdated onNext={() => go(1)} />
            </motion.div>
          )}
        </AnimatePresence>

        <Logo scene={scene} run={run} />
      </div>
    </div>
  )
}
