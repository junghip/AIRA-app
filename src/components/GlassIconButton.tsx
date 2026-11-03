import { motion } from 'motion/react'
import { spring } from '../motion/transitions'
import Icon from './Icon'

type GlassIconButtonProps = {
  icon: string
  label: string
  onClick?: () => void
  flip?: boolean // ← 처럼 아이콘을 좌우 반전
}

// 화면 상단의 반투명 원형 버튼 (✕, ← 등)
export default function GlassIconButton({ icon, label, onClick, flip }: GlassIconButtonProps) {
  return (
    <motion.button
      aria-label={label}
      onClick={onClick}
      whileTap={{ scale: 0.88 }}
      transition={spring}
      style={{
        display: 'grid',
        placeItems: 'center',
        width: 40,
        height: 40,
        border: '1px solid var(--glass-border)',
        borderRadius: 23,
        background: 'var(--glass-chip)',
      }}
    >
      <Icon src={icon} width={24} color="#fff" style={flip ? { scale: '-1 1' } : undefined} />
    </motion.button>
  )
}
