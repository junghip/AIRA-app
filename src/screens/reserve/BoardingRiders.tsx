import { motion } from 'motion/react'
import carBooked from '../../assets/reserve/car-side-booked.png'
import './BoardingRiders.css'

// 좌표는 예약 완료 차량 박스(299×140, 화면에 보이는 방향) 기준
// 문 열림 영역 (116,40) (206,26) (196,80) (107,97), 가운데 이음새 x=159
const DOOR_OPENING = 'polygon(38.8% 28.6%, 68.9% 18.6%, 65.6% 57.1%, 35.8% 69.3%)'
const DOOR_LEFT = 'polygon(38.8% 28.6%, 53.2% 22.1%, 53.2% 62.9%, 35.8% 69.3%)'
const DOOR_RIGHT = 'polygon(53.2% 22.1%, 68.9% 18.6%, 65.6% 57.1%, 53.2% 62.9%)'

const DOOR_OPEN_AT = 1.25 // 초 — 차가 멈춘 뒤
const FIRST_RIDER_AT = 1.5
const RIDER_GAP = 0.45
const WALK = 1.6

// 키·어깨가 조금씩 다른 4명
const figures = [
  { height: 46, width: 18 },
  { height: 43, width: 17 },
  { height: 40, width: 16 },
  { height: 34, width: 14 },
]
// 문 안으로 들어가는 발 위치 (문 아래 선을 따라)
const doorSpots = [
  { x: 180, y: 83 },
  { x: 162, y: 87 },
  { x: 145, y: 90 },
  { x: 128, y: 93 },
]

export default function BoardingRiders({ riders }: { riders: number }) {
  const count = Math.min(riders, figures.length)
  const closeAt = FIRST_RIDER_AT + (count - 1) * RIDER_GAP + WALK + 0.05
  const doorTimes = [0, DOOR_OPEN_AT, DOOR_OPEN_AT + 0.45, closeAt, closeAt + 0.45]
  const doorDuration = doorTimes[4]
  const doorTiming = { duration: doorDuration, times: doorTimes.map((t) => t / doorDuration), ease: 'easeInOut' as const }
  // 문짝 복사본은 차가 멈춘 순간에 바로 나타나야 브레이크 기울기와 어긋나지 않음
  const panelTiming = { ...doorTiming, opacity: { delay: DOOR_OPEN_AT - 0.02, duration: 0.01 } }

  return (
    <div className="boarding" aria-hidden>
      {/* 문 열림 영역 안에서만: 안쪽 빛 + 두 짝이 양옆 기둥 속으로 밀려 들어감 */}
      <div className="boarding__door" style={{ clipPath: DOOR_OPENING }}>
        <motion.div
          className="boarding__glow"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0, 1, 1, 0] }}
          transition={doorTiming}
        />
        <motion.div
          className="boarding__panel"
          style={{ clipPath: DOOR_LEFT }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, x: [0, 0, -46, -46, 0], y: [0, 0, 6, 6, 0] }}
          transition={panelTiming}
        >
          <CarImage />
        </motion.div>
        <motion.div
          className="boarding__panel"
          style={{ clipPath: DOOR_RIGHT }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, x: [0, 0, 48, 48, 0], y: [0, 0, -6, -6, 0] }}
          transition={panelTiming}
        >
          <CarImage />
        </motion.div>
      </div>
      <motion.div
        className="boarding__spill"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0, 0.8, 0.8, 0] }}
        transition={doorTiming}
      />

      {/* 한 명씩 걸어와서 문 안으로 */}
      {figures.slice(0, count).map((figure, i) => {
        const door = doorSpots[i]
        return (
          <motion.div
            key={i}
            className="rider"
            style={{ '--h': `${figure.height}px`, '--w': `${figure.width}px` } as React.CSSProperties}
            initial={{ x: 275, y: 128, opacity: 0, scale: 0.95 }}
            animate={{
              x: [275, 266, door.x + 6, door.x],
              y: [128, 128, door.y + 30, door.y],
              opacity: [0, 1, 1, 0],
              scale: [0.95, 1, 1, 0.72],
            }}
            transition={{ duration: WALK, times: [0, 0.14, 0.68, 1], ease: 'easeInOut', delay: FIRST_RIDER_AT + i * RIDER_GAP }}
          >
            <span className="rider__shadow" />
            <motion.span
              className="rider__figure"
              animate={{ y: [0, -2.5, 0], rotate: [-2.5, 2.5, -2.5] }}
              transition={{ duration: 0.36, repeat: Infinity, ease: 'easeInOut' }}
            >
              <span className="rider__head" />
              <span className="rider__body">
                <span className="rider__led" />
              </span>
            </motion.span>
          </motion.div>
        )
      })}
    </div>
  )
}

function CarImage() {
  return (
    <div className="booked__frame">
      <img src={carBooked} width={1536} height={1024} alt="" draggable={false} />
    </div>
  )
}
