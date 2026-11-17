import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useState } from 'react'
import Dashboard from './Dashboard'
import { usePreloaded } from './preload'
import Tour, { tourEnabled } from './Tour'
import Welcome from './Welcome'
import { getShared, resetShared, usePrimaryCopy, useSharedState } from './shared'
import './Display.css'

// 피그마 Section 8 "의자 디스플레이" — 2388×834 가로 화면을 창 크기에 맞춰 통째로 확대·축소
export const STAGE_W = 2388
export const STAGE_H = 834

export function useFitScale(w: number, h: number) {
  const calc = useCallback(() => Math.min(window.innerWidth / w, window.innerHeight / h), [w, h])
  const [scale, setScale] = useState(calc)
  useEffect(() => {
    const onResize = () => setScale(calc())
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [calc])
  return scale
}

// 화면 속 내용 — 평면(/display)과 휘어진 화면(/display-curved)이 같이 씀
// onboardingAutoplay: 웰컴 화면은 누를 수 없고 저절로만 넘어감 (휘어진 화면 미리보기용)
export function DisplayScene({ onboardingAutoplay = false }: { onboardingAutoplay?: boolean }) {
  const [boarded, setBoarded] = useSharedState('ds.boarded', false)
  // 처음부터 다시 보기 — R 키 (전시용)
  const [run, setRun] = useSharedState('ds.run', 0)
  // 다시 시작할 때는 하늘색 막을 먼저 덮고 → 그 뒤에서 화면을 바꾸고 → 자리 잡은 다음 걷어 냄
  // (휘어진 화면은 조각이 많아 화면이 통째로 바뀌는 순간 일부 조각이 늦게 그려지는데, 그 순간을 가림)
  const [curtain, setCurtain] = useSharedState('ds.curtain', false)
  const restart = useCallback(() => {
    setCurtain(true)
    setTimeout(() => {
      resetShared(['ds.run', 'ds.curtain'])
      setRun((n) => n + 1)
      setTimeout(() => setCurtain(false), 1500)
    }, 700)
  }, [setRun, setCurtain])

  const primary = usePrimaryCopy()
  useEffect(() => {
    if (!primary) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') restart()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [restart, primary])

  return (
    <>
      <div className="ds-sky" />
      <AnimatePresence mode="wait">
        {boarded ? (
          <motion.div key={`dash-${run}`} className="ds-layer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
            <Dashboard onRestart={restart} />
            {/* 홈에 들어오면 자동 둘러보기 시작 — 끝나면 처음(웰컴)부터 다시 */}
            <Tour onFinish={restart} />
            {/* 직접 누르는 화면: 홈에 들어온 뒤 10초 동안 아무도 안 누르면 처음(웰컴)부터 다시 */}
            {!tourEnabled() && <IdleReset onIdle={restart} />}
          </motion.div>
        ) : (
          <motion.div
            key={`welcome-${run}`}
            className="ds-layer"
            exit={{ opacity: 0, filter: 'blur(12px)' }}
            transition={{ duration: 0.7 }}
          >
            <Welcome onDone={() => setBoarded(true)} autoplay={onboardingAutoplay} />
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        className="ds-curtain"
        initial={false}
        animate={{ opacity: curtain ? 1 : 0 }}
        transition={{ duration: curtain ? 0.6 : 0.9, ease: 'easeInOut' }}
        style={{ pointerEvents: curtain ? 'auto' : 'none' }}
      />
    </>
  )
}

const IDLE_MS = 10_000
// 영화를 보는 중엔 안 누르는 게 당연하니 30초까지 기다려 줌
const IDLE_MOVIE_MS = 30_000

function IdleReset({ onIdle }: { onIdle: () => void }) {
  const primary = usePrimaryCopy()
  useEffect(() => {
    if (!primary) return
    let last = Date.now()
    let timer = 0
    const check = () => {
      const limit = getShared<string | null>('mp.playing', null) ? IDLE_MOVIE_MS : IDLE_MS
      const left = last + limit - Date.now()
      if (left <= 0) onIdle()
      else timer = window.setTimeout(check, left)
    }
    const touched = () => {
      last = Date.now()
      window.clearTimeout(timer)
      timer = window.setTimeout(check, IDLE_MS)
    }
    touched()
    window.addEventListener('pointerdown', touched)
    window.addEventListener('keydown', touched)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('pointerdown', touched)
      window.removeEventListener('keydown', touched)
    }
  }, [primary, onIdle])
  return null
}

export default function Display() {
  const scale = useFitScale(STAGE_W, STAGE_H)
  // 사진·영상을 다 받아 둔 뒤에 시작
  const ready = usePreloaded()
  if (!ready) return <div className="ds-viewport" />

  return (
    <div className={`ds-viewport ${tourEnabled() ? 'ds-no-cursor' : ''}`}>
      <div className="ds-stage" style={{ width: STAGE_W, height: STAGE_H, transform: `translate(-50%, -50%) scale(${scale})` }}>
        <DisplayScene />
      </div>
    </div>
  )
}
