import { AnimatePresence, motion } from 'motion/react'
import vlineClock from '../assets/window/vline-clock.svg'
import { smoothEase } from '../motion/transitions'
import Dashboard from './Dashboard'
import Menu from './Menu'
import type { MenuState, RouteVariant } from './scenes'

// 창가 차량 UI — 평소엔 대시보드, MENU를 누르면 왼쪽 버튼이 펼쳐지고, 고른 탭의 패널이 열림
export default function CarUI({ menu, variant, onMenu }: { menu: MenuState; variant: RouteVariant; onMenu: (m: MenuState) => void }) {
  const panel = menu === 'route' || menu === 'flight'
  return (
    <>
      <AnimatePresence>{!panel && <Dashboard key="dash" menuOpen={menu === 'open'} onMenu={() => onMenu('open')} />}</AnimatePresence>
      <AnimatePresence>{menu && <Menu key="menu" state={menu} variant={variant} onState={onMenu} />}</AnimatePresence>
      <Clock />
    </>
  )
}

// 날짜 · 시각 · 날씨 — 대시보드와 메뉴에서 늘 같은 자리
function Clock() {
  return (
    <motion.div
      className="wn-clock"
      style={{ x: '-50%' }}
      initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.9, ease: smoothEase, delay: 0.6 }}
    >
      <p className="wn-clock-side">Thu, Dec 24</p>
      <div className="wn-vline">
        <img src={vlineClock} alt="" />
      </div>
      <p className="wn-clock-time">12:40</p>
      <div className="wn-vline">
        <img src={vlineClock} alt="" />
      </div>
      <p className="wn-clock-side wn-clock-weather">
        <span>4°</span>
        <span>Rainy</span>
      </p>
    </motion.div>
  )
}
