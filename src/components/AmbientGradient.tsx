import { motion } from 'motion/react'
import './AmbientGradient.css'

// 배경 그라데이션 위에서 빛 덩어리들이 천천히 떠다니며 일렁이는 효과
const blobs = [
  { className: 'ambient__blob--light', x: ['-30%', '35%', '-10%'], y: ['-15%', '20%', '-5%'], scale: [1, 1.35, 0.9], duration: 8 },
  { className: 'ambient__blob--deep', x: ['25%', '-30%', '15%'], y: ['10%', '-20%', '25%'], scale: [1.2, 0.85, 1.25], duration: 10 },
  { className: 'ambient__blob--blush', x: ['-20%', '30%', '-25%'], y: ['15%', '-15%', '5%'], scale: [0.9, 1.3, 1], duration: 7 },
  { className: 'ambient__blob--lilac', x: ['20%', '-25%', '30%'], y: ['-20%', '15%', '-10%'], scale: [1.1, 0.8, 1.2], duration: 9 },
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
