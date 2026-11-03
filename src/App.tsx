import { AnimatePresence, MotionConfig } from 'motion/react'
import { useEffect, useRef } from 'react'
import { Route, Routes, useLocation, useNavigationType } from 'react-router-dom'
import PhoneFrame from './components/PhoneFrame'
import Screen from './components/Screen'
import Home from './screens/Home'
import Pass from './screens/pass/Pass'
import Aira from './screens/aira/Aira'
import Reserve from './screens/reserve/Reserve'

// 피그마 화면이 추가될 때마다 여기에 한 줄씩
const routes = [
  { path: '/', element: <Home /> },
  { path: '/pass', element: <Pass /> },
  { path: '/reserve', element: <Reserve /> },
  { path: '/aira', element: <Aira /> },
]

export default function App() {
  const location = useLocation()
  const direction = useNavigationType() === 'POP' ? -1 : 1
  // 처음 연 화면은 밀려 들어오지 않게 — 화면 속 애니메이션은 그대로 재생
  const isFirstRender = useRef(true)
  useEffect(() => {
    isFirstRender.current = false
  }, [])

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
