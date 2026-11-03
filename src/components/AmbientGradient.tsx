import { motion } from 'motion/react'
import './AmbientGradient.css'

// 배경 그라데이션 위에서 빛 덩어리들이 천천히 떠다니며 일렁이는 효과
const blobs = [
  { className: 'ambient__blob--sky', x: ['-12%', '14%', '-6%'], y: ['-8%', '10%', '-4%'], scale: [1, 1.18, 0.96], duration: 13 },
  { className: 'ambient__blob--lilac', x: ['10%', '-14%', '6%'], y: ['6%', '-10%', '12%'], scale: [1.1, 0.92, 1.12], duration: 16 },
  { className: 'ambient__blob--blush', x: ['-6%', '12%', '-10%'], y: ['10%', '-6%', '4%'], scale: [0.95, 1.15, 1], duration: 11 },
  { className: 'ambient__blob--mist', x: ['8%', '-8%', '12%'], y: ['-12%', '6%', '-2%'], scale: [1.05, 0.9, 1.1], duration: 18 },
]

export default function AmbientGradient() {
  return (
    <div className="ambient" aria-hidden>
      {blobs.map(({ className, x, y, scale, duration }) => (
        <motion.span
          key={className}
          className={`ambient__blob ${className}`}
          animate={{ x, y, scale }}
          transition={{ duration, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}
