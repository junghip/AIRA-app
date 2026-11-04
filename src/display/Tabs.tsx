import { motion } from 'motion/react'
import { softSpring, spring } from '../motion/transitions'

// 화면 위쪽 카테고리 탭 — 흰 바탕이 고른 탭으로 미끄러짐
type Props = {
  id: string
  options: string[]
  value: string
  onChange: (v: string) => void
  dark?: boolean
  className?: string
}

export default function Tabs({ id, options, value, onChange, dark, className = '' }: Props) {
  return (
    <div className={`ds-tabs ${dark ? 'ds-tabs--dark' : ''} ${className}`}>
      {options.map((o, i) => {
        const on = o === value
        return (
          <motion.button
            key={o}
            type="button"
            className="ds-tab"
            aria-pressed={on}
            onClick={() => onChange(o)}
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.95 }}
            transition={{ ...softSpring, delay: 0.1 + i * 0.05 }}
          >
            <span className="ds-tab__bg" />
            {on && <motion.span layoutId={`${id}-thumb`} className="ds-tab__thumb" transition={spring} />}
            <span className="ds-tab__text" style={{ color: on ? 'var(--color-ink)' : dark ? 'rgba(255, 255, 255, 0.5)' : 'var(--color-sub)', fontWeight: on ? 600 : 500 }}>{o}</span>
          </motion.button>
        )
      })}
    </div>
  )
}
