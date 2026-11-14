import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useState } from 'react'
import Dashboard from './Dashboard'
import Welcome from './Welcome'
import { resetShared, usePrimaryCopy, useSharedState } from './shared'
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
  const restart = useCallback(() => {
    resetShared(['ds.run'])
    setRun((n) => n + 1)
  }, [setRun])

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
    </>
  )
}

export default function Display() {
  const scale = useFitScale(STAGE_W, STAGE_H)

  return (
    <div className="ds-viewport">
      <div className="ds-stage" style={{ width: STAGE_W, height: STAGE_H, transform: `translate(-50%, -50%) scale(${scale})` }}>
        <DisplayScene />
      </div>
    </div>
  )
}
