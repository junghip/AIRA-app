import { AnimatePresence } from 'motion/react'
import Dashboard from './Dashboard'
import Menu from './Menu'
import type { MenuTab, RouteVariant } from './scenes'

// 창가 차량 UI — 평소엔 대시보드, MENU를 누르면 Section 9처럼 왼쪽 메뉴 + 패널
export default function CarUI({ menu, variant, onMenu }: { menu: MenuTab | null; variant: RouteVariant; onMenu: (t: MenuTab | null) => void }) {
  return (
    <AnimatePresence mode="wait">
      {menu ? (
        <Menu key="menu" tab={menu} variant={variant} onTab={onMenu} onClose={() => onMenu(null)} />
      ) : (
        <Dashboard key="dash" onMenu={() => onMenu('route')} />
      )}
    </AnimatePresence>
  )
}
