import { AnimatePresence, MotionConfig } from 'motion/react'
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

  return (
    <MotionConfig reducedMotion="user">
      <PhoneFrame>
        <AnimatePresence initial={false} custom={direction}>
          <Routes location={location} key={location.pathname}>
            {routes.map(({ path, element }) => (
              <Route key={path} path={path} element={<Screen direction={direction}>{element}</Screen>} />
            ))}
          </Routes>
        </AnimatePresence>
      </PhoneFrame>
    </MotionConfig>
  )
}
