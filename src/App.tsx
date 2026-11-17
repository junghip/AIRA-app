import { AnimatePresence, MotionConfig } from 'motion/react'
import { lazy, Suspense, useEffect, useRef } from 'react'
import { Route, Routes, useLocation, useNavigate, useNavigationType } from 'react-router-dom'
import PhoneFrame from './components/PhoneFrame'
import Screen from './components/Screen'
import CurvedDisplay from './display/CurvedDisplay'
import Display from './display/Display'
import Home from './screens/Home'
import Pass from './screens/pass/Pass'
import Aira from './screens/aira/Aira'
import Reserve from './screens/reserve/Reserve'
import Window from './window/Window'

// 포토부스는 무거운 라이브러리(사람 인식·저장소)를 쓰니 그 화면에 갈 때만 불러옴
const Booth = lazy(() => import('./booth/Booth'))
const PhotoPage = lazy(() => import('./booth/PhotoPage'))

// 피그마 화면이 추가될 때마다 여기에 한 줄씩
const routes = [
  { path: '/', element: <Home /> },
  { path: '/pass', element: <Pass /> },
  { path: '/reserve', element: <Reserve /> },
  { path: '/aira', element: <Aira /> },
  // 포토부스 QR로 여는 사진 받기 + 방명록
  { path: '/photo/:id', element: <Suspense fallback={null}><PhotoPage /></Suspense> },
]

const IDLE_RESET_MS = 10_000 // 이 시간 동안 터치가 없으면 첫 화면으로

// 전시용: 아무도 만지지 않으면 홈으로 되돌려 다음 관람객이 처음부터 보게 함
function useIdleReset(active: boolean) {
  const navigate = useNavigate()
  useEffect(() => {
    if (!active) return
    let timer = setTimeout(() => navigate('/'), IDLE_RESET_MS)
    const restart = () => {
      clearTimeout(timer)
      timer = setTimeout(() => navigate('/'), IDLE_RESET_MS)
    }
    const events = ['pointerdown', 'pointermove', 'keydown', 'wheel'] as const
    events.forEach((e) => window.addEventListener(e, restart, { passive: true }))
    return () => {
      clearTimeout(timer)
      events.forEach((e) => window.removeEventListener(e, restart))
    }
  }, [active, navigate])
}

export default function App() {
  const location = useLocation()
  const direction = useNavigationType() === 'POP' ? -1 : 1
  // 처음 연 화면은 밀려 들어오지 않게 — 화면 속 애니메이션은 그대로 재생
  const isFirstRender = useRef(true)
  useEffect(() => {
    isFirstRender.current = false
  }, [])

  // 폰 화면 흐름(홈 제외)에서만 — 가로 화면들과 QR 사진 페이지는 그대로
  const { pathname } = location
  useIdleReset(['/pass', '/reserve', '/aira'].includes(pathname))

  // 의자 디스플레이는 폰 프레임 없이 가로 화면 전체로
  // 차량 창문(Section 10)도 1920×1080 가로 화면 전체로
  if (location.pathname.startsWith('/window')) {
    return (
      <MotionConfig reducedMotion="user">
        <Window />
      </MotionConfig>
    )
  }

  // 아이패드 세로 포토부스
  if (location.pathname.startsWith('/booth')) {
    return (
      <MotionConfig reducedMotion="user">
        <Suspense fallback={null}>
          <Booth />
        </Suspense>
      </MotionConfig>
    )
  }

  // 휘어진 화면 미리보기는 /display-curved
  if (location.pathname.startsWith('/display')) {
    return (
      <MotionConfig reducedMotion="user">
        {location.pathname.startsWith('/display-curved') ? <CurvedDisplay /> : <Display />}
      </MotionConfig>
    )
  }

  return (
    <MotionConfig reducedMotion="user">
      <PhoneFrame>
        <AnimatePresence custom={direction}>
          <Routes location={location} key={location.pathname}>
            {routes.map(({ path, element }) => (
              <Route key={path} path={path} element={<Screen direction={direction} skipEnter={isFirstRender.current}>{element}</Screen>} />
            ))}
          </Routes>
        </AnimatePresence>
      </PhoneFrame>
    </MotionConfig>
  )
}
