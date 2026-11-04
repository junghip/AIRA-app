import { motion } from 'motion/react'
import { spring } from '../motion/transitions'

// 두 칸 세그먼트 — 흰 알약이 눌린 쪽으로 미끄러짐
type Props = {
  id: string
  options: string[]
  value: string
  onChange: (v: string) => void
  width?: number
  className?: string
}

export default function Segmented({ id, options, value, onChange, width, className = '' }: Props) {
  return (
    <div className={`ds-seg ${className}`} style={{ width: width ?? '100%' }}>
      {options.map((o) => (
        <button key={o} type="button" className="ds-seg__opt" aria-pressed={o === value} onClick={() => onChange(o)}>
          {o === value && <motion.span layoutId={`${id}-thumb`} className="ds-seg__thumb ds-pill-on" transition={spring} />}
          <span className="ds-seg__text">{o}</span>
        </button>
      ))}
    </div>
  )
}
