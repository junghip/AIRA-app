import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import homeIcon from '../assets/icons/home-line.svg'
import flightIcon from '../assets/icons/flight-takeoff-line.svg'
import userIcon from '../assets/icons/user-line.svg'
import { spring } from '../motion/transitions'
import Icon from './Icon'
import './TabBar.css'

const tabs = [
  { id: 'home', label: 'Home', icon: homeIcon },
  { id: 'flight', label: 'Flight', icon: flightIcon },
  { id: 'my', label: 'My', icon: userIcon },
]

export default function TabBar() {
  const [active, setActive] = useState('home')

  return (
    <nav className="tab-bar">
      {tabs.map((tab) => {
        const isActive = tab.id === active
        return (
          <motion.button
            key={tab.id}
            layout
            transition={spring}
            whileTap={{ scale: 0.92 }}
            className={`tab-bar__tab${isActive ? ' is-active' : ''}`}
            onClick={() => setActive(tab.id)}
            aria-current={isActive ? 'page' : undefined}
            aria-label={tab.label}
          >
            {/* 선택된 탭 뒤의 하얀 알약이 탭 사이를 미끄러져 이동 */}
            {isActive && <motion.span layoutId="tab-pill" className="tab-bar__pill" transition={spring} />}
            <motion.span layout="position" className="tab-bar__content">
              <Icon src={tab.icon} width={24} color={isActive ? 'var(--color-ink)' : 'var(--color-icon-muted)'} />
              <AnimatePresence initial={false}>
                {isActive && (
                  <motion.span
                    className="tab-bar__label"
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={spring}
                  >
                    <span className="tab-bar__label-text">{tab.label}</span>
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.span>
          </motion.button>
        )
      })}
    </nav>
  )
}
