import { animate } from 'motion/react'
import { useEffect } from 'react'
import { getShared, setShared, usePrimaryCopy, useSharedMotionValue } from './shared'

// 자동 둘러보기 — 누르지 않아도 정해진 순서대로 화면이 넘어감 (전시용)
// 웰컴이 끝나 홈에 들어온 뒤: 미디어 → 영화 둘러보기 → Midnight In Paris 재생(8초) → 공항 → 던킨 → 글레이즈드 → 경유 제안
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

export const tourEnabled = () => !new URLSearchParams(window.location.search).has('manual')

export default function Tour({ onFinish }: { onFinish: () => void }) {
  const primary = usePrimaryCopy()
  const dragX = useSharedMotionValue('mp.dragX')

  useEffect(() => {
    if (!primary || !tourEnabled()) return
    let alive = true
    const wait = (ms: number) =>
      new Promise<void>((resolve, reject) => setTimeout(() => (alive ? resolve() : reject(new Error('stopped'))), ms))

    // 누른 것처럼 화면만 반응 (손가락 자국은 안 보임) — 자리는 대본을 읽기 쉽게 남겨 둠
    const tap = async (_at: readonly [number, number], then: () => void) => {
      await wait(200)
      then()
    }

    // 영화 카드 넘기기: 손가락이 미끄러지는 만큼 카드 줄이 따라오다가 한 칸 넘어감
    const swipe = async (dir: 1 | -1) => {
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
      await swipe(1) // → Roman Holiday
      await wait(1100)
      await swipe(1) // → Midnight In Paris
      await wait(1500)
      await tap(AT.movieCenter, () => setShared('mp.playing', 'Midnight In Paris'))

      // 8초 감상 후 빠져나옴
      await wait(8000)
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
      await tap(AT.suggest, () => setShared('ap.sent', true))

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
