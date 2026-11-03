import { motion } from 'motion/react'
import type { CSSProperties } from 'react'
import carClosed from '../../assets/reserve/car-closed.png'
import carOpen from '../../assets/reserve/car-open.png'
import './BoardingScene.css'

// 차가 천천히 들어와 멈추면 → 문이 열리고 → 한 명씩 걸어와 타고 → 문이 닫힘 (초 단위)
export const CAR_ARRIVE = 2.2 // 차가 들어오는 시간
const DOOR_OPEN_AT = 0.15 + CAR_ARRIVE * 0.85 // 거의 멈췄을 때
const DOOR_FADE = 0.6
const FIRST_RIDER_AT = DOOR_OPEN_AT + 0.5
const RIDER_GAP = 0.55
const WALK = 2

// 키가 조금씩 다른 4명
const figures = [
  { height: 46, width: 18 },
  { height: 43, width: 17 },
  { height: 40, width: 16 },
  { height: 34, width: 14 },
]

// 좌표는 차량 박스(299×140) 기준. 문 안 바닥 위치를 따라 한 명씩 들어감
const START = { x: 275, y: 130 }
const doorSpots = [
  { x: 175, y: 105 },
  { x: 163, y: 106 },
  { x: 151, y: 107 },
  { x: 141, y: 108 },
]

export default function BoardingScene({ riders }: { riders: number }) {
  const count = Math.min(riders, figures.length)
  const closeAt = FIRST_RIDER_AT + (count - 1) * RIDER_GAP + WALK + 0.1
  const keyTimes = [0, DOOR_OPEN_AT, DOOR_OPEN_AT + DOOR_FADE, closeAt, closeAt + DOOR_FADE]
  const total = keyTimes[4]
  const doorTiming = { duration: total, times: keyTimes.map((t) => t / total), ease: 'easeInOut' as const }
  const flashTiming = (at: number) => ({ duration: 1.1, delay: at - 0.2, ease: 'easeInOut' as const })

  return (
    <div className="boarding">
      {/* 닫힌 차 ↔ 문 열린 차를 겹쳐서 바꿈 */}
      <motion.img
        className="boarding__car boarding__car--closed"
        src={carClosed}
        width={552}
        height={280}
        alt="AIRA 07"
        draggable={false}
        animate={{ opacity: [1, 1, 0, 0, 1] }}
        transition={doorTiming}
      />
      <motion.img
        className="boarding__car boarding__car--open"
        src={carOpen}
        width={548}
        height={280}
        alt=""
        draggable={false}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0, 1, 1, 0] }}
        transition={doorTiming}
      />
      {/* 문이 열리고 닫히는 순간 문 쪽에서 은은한 빛이 번짐 */}
      {[DOOR_OPEN_AT, closeAt].map((at) => (
        <motion.span
          key={at}
          className="boarding__flash"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: [0, 0.5, 0], scale: [0.85, 1.05, 1.15] }}
          transition={flashTiming(at)}
        />
      ))}

      {figures.slice(0, count).map((figure, i) => {
        const door = doorSpots[i]
        return (
          <motion.div
            key={i}
            className="rider"
            aria-hidden
            style={{ '--h': `${figure.height}px`, '--w': `${figure.width}px` } as CSSProperties}
            initial={{ x: START.x, y: START.y, opacity: 0, scale: 0.95 }}
            animate={{
              x: [START.x, START.x - 9, door.x + 6, door.x],
              y: [START.y, START.y, door.y + 20, door.y],
              opacity: [0, 1, 1, 0],
              scale: [0.95, 1, 1, 0.72],
            }}
            transition={{ duration: WALK, times: [0, 0.18, 0.7, 1], ease: 'easeInOut', delay: FIRST_RIDER_AT + i * RIDER_GAP }}
          >
            {/* 통통 튀지 않고 미끄러지듯 이동 */}
            <span className="rider__shadow" />
            <span className="rider__figure">
              <span className="rider__head" />
              <span className="rider__body" />
            </span>
          </motion.div>
        )
      })}
    </div>
  )
}
