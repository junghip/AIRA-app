import { animate, AnimatePresence, motion } from 'motion/react'
import { useEffect } from 'react'
import { getShared, setShared, usePrimaryCopy, useSharedMotionValue, useSharedState } from './shared'
import './Tour.css'

// 자동 둘러보기 — 누르지 않아도 정해진 순서대로 화면이 넘어감 (전시용)
// 웰컴이 끝나 홈에 들어온 뒤: 미디어 → 영화 둘러보기 → Midnight In Paris 재생(5초) → 공항 → 던킨 → 글레이즈드 → 경유 제안
// 주소에 ?manual 을 붙이면 꺼짐

// 화면(2388×834) 위의 터치 위치
const AT = {
  railMedia: [111, 417],
  railAirport: [111, 654],
  movieCenter: [1194, 417],
  dunkin: [1810, 330],
  glazed: [760, 359],
  suggest: [2192, 570],
} as const

type Touch = { id: number; x: number; y: number; x2?: number }

export const tourEnabled = () => !new URLSearchParams(window.location.search).has('manual')

export default function Tour({ onFinish }: { onFinish: () => void }) {
  const primary = usePrimaryCopy()
  const dragX = useSharedMotionValue('mp.dragX')

  useEffect(() => {
    if (!primary || !tourEnabled()) return
    let alive = true
    let touchId = 0
    const wait = (ms: number) =>
      new Promise<void>((resolve, reject) => setTimeout(() => (alive ? resolve() : reject(new Error('stopped'))), ms))

    // 누르는 자리에 물결이 번진 다음 화면이 반응
    const tap = async ([x, y]: readonly [number, number], then: () => void) => {
      setShared<Touch>('tour.touch', { id: ++touchId, x, y })
      await wait(260)
      then()
    }

    // 영화 카드 넘기기: 손가락이 미끄러지는 만큼 카드 줄이 따라오다가 한 칸 넘어감
    const swipe = async (dir: 1 | -1) => {
      const from = 1194 - dir * 170
      setShared<Touch>('tour.touch', { id: ++touchId, x: from, y: 417, x2: from + dir * 340 })
      await animate(dragX, dir * 150, { duration: 0.45, ease: [0.4, 0, 0.6, 1] })
      if (!alive) return
      const n = 5
      setShared('mp.active', (getShared('mp.active', 2) - dir + n) % n)
      animate(dragX, 0, { type: 'spring', stiffness: 260, damping: 30 })
    }

    const run = async () => {
      // 홈 둘러보기
      await wait(4500)
      await tap(AT.railMedia, () => setShared('db.tab', 'media'))

      // 영화 둘러보다가 Midnight In Paris 로
      await wait(2600)
      await swipe(-1) // → The Road Trip
      await wait(1300)
      await swipe(1) // ← Before Sunrise
      await wait(1100)
      await swipe(1) // ← Roman Holiday
      await wait(1100)
      await swipe(1) // ← Midnight In Paris
      await wait(1500)
      await tap(AT.movieCenter, () => setShared('mp.playing', 'Midnight In Paris'))

      // 5초 감상 후 빠져나옴
      await wait(5600)
      await tap(AT.movieCenter, () => setShared('mp.playing', null))

      // 공항 → Cafe & Dessert 목록
      await wait(1400)
      await tap(AT.railAirport, () => setShared('db.tab', 'airport'))
      await wait(3000)

      // 던킨 열기 (아무것도 안 담긴 채로)
      await tap(AT.dunkin, () => {
        setShared('ap.sent', false)
        setShared<string[]>('ap.picked', [])
        setShared('ap.open', 'dunkin')
      })
      await wait(2800)
      await tap(AT.glazed, () => setShared<string[]>('ap.picked', ['Original Glazed']))
      await wait(1600)
      await tap(AT.suggest, () => {
        setShared('ap.sent', true)
        setShared('ap.toast', true)
      })

      // 알림을 보여 준 뒤 처음부터 다시
      await wait(7000)
      onFinish()
    }
    run().catch(() => {})
    return () => {
      alive = false
    }
  }, [primary, dragX, onFinish])

  return null
}

// 자동 둘러보기의 손가락 자국 — 모든 조각에 같이 그림
export function TouchMark() {
  const [touch] = useSharedState<Touch | null>('tour.touch', null)
  return (
    <div className="tm-layer">
      <AnimatePresence>
        {touch &&
          (touch.x2 === undefined ? (
            <motion.span
              key={touch.id}
              className="tm-dot"
              style={{ left: touch.x, top: touch.y }}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: [0.5, 1, 1.5], opacity: [0, 1, 0] }}
              transition={{ duration: 0.9, times: [0, 0.3, 1], ease: 'easeOut' }}
            />
          ) : (
            <motion.span
              key={touch.id}
              className="tm-dot tm-dot--drag"
              style={{ top: touch.y }}
              initial={{ left: touch.x, opacity: 0, scale: 0.7 }}
              animate={{ left: touch.x2, opacity: [0, 1, 1, 0], scale: 1 }}
              transition={{ duration: 0.6, ease: [0.4, 0, 0.6, 1], opacity: { duration: 0.6, times: [0, 0.15, 0.75, 1] } }}
            />
          ))}
      </AnimatePresence>
    </div>
  )
}
