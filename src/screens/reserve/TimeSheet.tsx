import { motion, useDragControls } from 'motion/react'
import { useLayoutEffect, useRef, useState } from 'react'
import { softSpring, spring } from '../../motion/transitions'
import { formatTime, timeOptions, timeWithAira } from './time'
import './TimeSheet.css'

const ITEM_H = 44

type TimeSheetProps = {
  value: number
  onConfirm: (minutes: number) => void
  onClose: () => void
}

// "Pick another time" — 아래에서 올라오는 시간 휠
export default function TimeSheet({ value, onConfirm, onClose }: TimeSheetProps) {
  const listRef = useRef<HTMLDivElement>(null)
  const dragControls = useDragControls()
  const [index, setIndex] = useState(() => Math.max(0, timeOptions.indexOf(value)))

  // 열릴 때 현재 시간이 가운데 오도록
  useLayoutEffect(() => {
    if (listRef.current) listRef.current.scrollTop = index * ITEM_H
  }, []) // 처음 열릴 때 한 번만

  const handleScroll = () => {
    const list = listRef.current
    if (!list) return
    const next = Math.min(timeOptions.length - 1, Math.max(0, Math.round(list.scrollTop / ITEM_H)))
    if (next !== index) setIndex(next)
  }

  const scrollTo = (i: number) => listRef.current?.scrollTo({ top: i * ITEM_H, behavior: 'smooth' })
  const selected = timeOptions[index]

  return (
    <>
      <motion.div
        className="sheet-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-label="Pick your arrival time"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={softSpring}
        drag="y"
        dragControls={dragControls}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.6 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 80 || info.velocity.y > 500) onClose()
        }}
      >
        {/* 손잡이를 끌어내리면 닫힘 */}
        <div className="sheet__grab" onPointerDown={(e) => dragControls.start(e)}>
          <span className="sheet__handle" />
          <p className="sheet__title">Pick your arrival time</p>
        </div>

        <div className="wheel">
          <div className="wheel__highlight" />
          <div
            className="wheel__list"
            ref={listRef}
            onScroll={handleScroll}
            role="listbox"
            aria-label="Arrival time"
            aria-activedescendant={`time-${selected}`}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') scrollTo(Math.min(index + 1, timeOptions.length - 1))
              if (e.key === 'ArrowUp') scrollTo(Math.max(index - 1, 0))
            }}
          >
            {timeOptions.map((m, i) => (
              <button
                key={m}
                id={`time-${m}`}
                role="option"
                aria-selected={i === index}
                className="wheel__item"
                data-distance={Math.min(Math.abs(i - index), 3)}
                onClick={() => scrollTo(i)}
                tabIndex={-1}
              >
                {formatTime(m)}
              </button>
            ))}
          </div>
        </div>

        <p className="sheet__caption">{timeWithAira(selected)}</p>

        <motion.button className="cta" whileTap={{ scale: 0.95 }} transition={spring} onClick={() => onConfirm(selected)}>
          Set {formatTime(selected)}
        </motion.button>
      </motion.div>
    </>
  )
}
