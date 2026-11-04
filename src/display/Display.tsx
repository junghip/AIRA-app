import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useState } from 'react'
import Dashboard from './Dashboard'
import Welcome from './Welcome'
import './Display.css'

// 피그마 Section 8 "의자 디스플레이" — 2388×834 가로 화면을 창 크기에 맞춰 통째로 확대·축소
export const STAGE_W = 2388
export const STAGE_H = 834

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

export default function Display() {
  const scale = useStageScale()
  const [boarded, setBoarded] = useState(false)
  // 처음부터 다시 보기 — R 키 (전시용)
  const [run, setRun] = useState(0)
  const restart = useCallback(() => {
    setBoarded(false)
    setRun((n) => n + 1)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') restart()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [restart])

  return (
    <div className="ds-viewport">
      <div className="ds-stage" style={{ width: STAGE_W, height: STAGE_H, transform: `translate(-50%, -50%) scale(${scale})` }}>
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
              <Welcome onDone={() => setBoarded(true)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
