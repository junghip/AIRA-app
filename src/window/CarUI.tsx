import { AnimatePresence } from 'motion/react'
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
    </>
  )
}

