import { AnimatePresence, motion, useAnimation } from 'motion/react'
import type { PanInfo, Variants } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import addIcon from '../../assets/icons/add-line.svg'
import arrowIcon from '../../assets/icons/arrow-right-s-line.svg'
import chevronSub from '../../assets/icons/chevron-right-sub.svg'
import closeIcon from '../../assets/icons/close-line.svg'
import subtractIcon from '../../assets/icons/subtract-line.svg'
import GlassIconButton from '../../components/GlassIconButton'
import Icon from '../../components/Icon'
import RollingText from '../../components/RollingText'
import { riseIn, softSpring, spring, stagger } from '../../motion/transitions'
import BoardingScene from './BoardingScene'
import { SUGGESTED, TIME_MAX, TIME_MIN, TIME_STEP, formatTime, timeWithAira } from './time'
import TimeSheet from './TimeSheet'
import './Reserve.css'

type Step = 'time' | 'passengers' | 'booked'
const order: Step[] = ['time', 'passengers', 'booked']

const DRAG_PX_PER_STEP = 36
const MAX_RIDERS = 4 // 이 인원이 되어야 다음으로 넘어갈 수 있음

// 단계 사이 내용이 옆으로 밀리며 바뀜 (dir: 1 앞으로, -1 뒤로)
const stepSlide: Variants = {
  enter: (dir: number) => ({ x: dir * 60, opacity: 0, filter: 'blur(6px)' }),
  center: { x: 0, opacity: 1, filter: 'blur(0px)' },
  exit: (dir: number) => ({ x: dir * -60, opacity: 0, filter: 'blur(6px)' }),
}

export default function Reserve() {
  const navigate = useNavigate()
  const location = useLocation()
  const [[step, dir], setStepState] = useState<[Step, number]>(['time', 1])
  const [time, setTime] = useState(SUGGESTED)
  const [timeDir, setTimeDir] = useState(1)
  const [riders, setRiders] = useState(1)
  const [ridersDir, setRidersDir] = useState(1)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [ridersNudge, setRidersNudge] = useState(0)

  const goTo = (next: Step) => setStepState([next, order.indexOf(next) > order.indexOf(step) ? 1 : -1])

  const back = () => {
    if (step === 'time') return location.key === 'default' ? navigate('/pass') : navigate(-1)
    goTo(order[order.indexOf(step) - 1])
  }

  const changeTime = (delta: number) => {
    const next = Math.min(TIME_MAX, Math.max(TIME_MIN, time + delta))
    if (next === time) return false
    setTimeDir(Math.sign(delta))
    setTime(next)
    return true
  }

  const changeRiders = (delta: number) => {
    const next = Math.min(MAX_RIDERS, Math.max(1, riders + delta))
    if (next === riders) return false
    setRidersDir(Math.sign(delta))
    setRiders(next)
    return true
  }

  const pickTime = (minutes: number) => {
    changeTime(minutes - time)
    setSheetOpen(false)
  }

  const ctaDisabled = step === 'passengers' && riders < MAX_RIDERS

  const cta = {
    time: { label: `Ride at ${formatTime(time)}`, arrow: true, onClick: () => goTo('passengers') },
    passengers: { label: `Ride with ${riders}`, arrow: true, onClick: () => goTo('booked') },
    booked: { label: 'Done!', arrow: false, onClick: () => navigate('/aira', { state: { riders } }) },
  }[step]

  return (
    <div className="reserve">
      <div className="reserve__top">
        <GlassIconButton icon={arrowIcon} label="Back" flip onClick={back} />
        <GlassIconButton icon={closeIcon} label="Close" onClick={() => navigate('/')} />
      </div>

      <AnimatePresence initial={false} custom={dir}>
        <motion.div
          key={step}
          className="reserve__step"
          custom={dir}
          variants={stepSlide}
          initial="enter"
          animate="center"
          exit="exit"
          transition={softSpring}
        >
          {step === 'time' && (
            <>
              <Headline title="What time will you arrive on Dec 24?" sub={['We picked a time based on your boarding.']} />
              <TimePicker
                time={time}
                direction={timeDir}
                onChange={changeTime}
                onReset={() => changeTime(SUGGESTED - time)}
              />
            </>
          )}
          {step === 'passengers' && (
            <>
              <Headline title="How many are riding?" sub={['Add up to 4 people, including yourself.']} />
              <RiderCounter riders={riders} direction={ridersDir} onChange={changeRiders} nudge={ridersNudge} />
            </>
          )}
          {step === 'booked' && (
            <>
              <Headline
                title="Your pickup is booked!"
                sub={['In 2 days, we’ll meet you where you arrive.', 'We’ll notify you 10 min before.']}
                loose
              />
              <BookedSummary time={formatTime(time)} riders={riders} />
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* 하단 버튼은 단계가 바뀌어도 그대로 두고 글자·너비만 바뀜 */}
      <div className="reserve__center reserve__center--cta">
        <motion.button
          layout
          className={`cta${cta.arrow ? '' : ' cta--hug'}${ctaDisabled ? ' cta--disabled' : ''}`}
          transition={spring}
          whileTap={{ scale: ctaDisabled ? 0.98 : 0.95 }}
          aria-disabled={ctaDisabled}
          onClick={ctaDisabled ? () => setRidersNudge((n) => n + 1) : cta.onClick}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={step}
              layout="position"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={spring}
              style={{ display: 'flex', alignItems: 'center', gap: 10 }}
            >
              {step === 'time' ? (
                <span style={{ display: 'flex' }}>
                  Ride at&nbsp;
                  <RollingText value={formatTime(time)} direction={timeDir} />
                </span>
              ) : step === 'passengers' ? (
                <span style={{ display: 'flex' }}>
                  Ride with&nbsp;
                  <RollingText value={String(riders)} direction={ridersDir} />
                </span>
              ) : (
                cta.label
              )}
              {cta.arrow && <Icon src={arrowIcon} width={24} color="var(--color-ink)" />}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </div>

      <AnimatePresence>
        {step !== 'passengers' && (
          <motion.div
            key={step}
            className="reserve__center reserve__center--link"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={softSpring}
          >
            <motion.button
              className="text-link"
              whileTap={{ scale: 0.96 }}
              onClick={step === 'time' ? () => setSheetOpen(true) : () => goTo('time')}
            >
              {step === 'time' ? 'Pick another time' : 'Change or cancel the reservation'}
              <img src={chevronSub} width={20} height={20} alt="" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {sheetOpen && <TimeSheet key="sheet" value={time} onConfirm={pickTime} onClose={() => setSheetOpen(false)} />}
      </AnimatePresence>
    </div>
  )
}

function Headline({ title, sub, loose }: { title: string; sub: string[]; loose?: boolean }) {
  return (
    <motion.div className="reserve__headline" variants={stagger(0.06, 0.05)} initial="hidden" animate="show">
      <motion.h1 className="reserve__title" variants={riseIn}>
        {title}
      </motion.h1>
      <motion.p className={`reserve__sub${loose ? ' reserve__sub--loose' : ''}`} variants={riseIn}>
        {sub.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </motion.p>
    </motion.div>
  )
}

// 큰 시간 숫자 — 위아래로 끌면 10분씩 바뀜
function TimePicker({
  time,
  direction,
  onChange,
  onReset,
}: {
  time: number
  direction: number
  onChange: (delta: number) => boolean
  onReset: () => void
}) {
  const dragged = useRef(0)
  const nudge = useAnimation()

  const handlePan = (_: PointerEvent, info: PanInfo) => {
    const steps = Math.trunc((-info.offset.y - dragged.current) / DRAG_PX_PER_STEP)
    if (!steps) return
    dragged.current += steps * DRAG_PX_PER_STEP
    if (!onChange(steps * TIME_STEP)) nudge.start({ y: [0, steps > 0 ? -10 : 10, 0], transition: { duration: 0.3 } })
  }

  const handleWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaY) < 4) return
    onChange(e.deltaY < 0 ? TIME_STEP : -TIME_STEP)
  }

  const isSuggested = time === SUGGESTED

  return (
    <motion.div className="time-picker" variants={stagger(0.08, 0.15)} initial="hidden" animate="show">
      <motion.button
        className="time-picker__hint"
        variants={riseIn}
        animate={{ opacity: isSuggested ? 1 : 0.5 }}
        onClick={onReset}
        disabled={isSuggested}
      >
        {isSuggested ? 'Suggested' : 'Tap to use suggested'}
      </motion.button>
      <motion.div
        className="time-picker__value"
        variants={riseIn}
        onPanStart={() => (dragged.current = 0)}
        onPan={handlePan}
        onWheel={handleWheel}
        whileTap={{ scale: 0.97 }}
        animate={nudge}
        role="spinbutton"
        aria-valuenow={time}
        aria-valuetext={formatTime(time)}
        aria-label="Arrival time, drag up or down to change"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowUp') onChange(TIME_STEP)
          if (e.key === 'ArrowDown') onChange(-TIME_STEP)
        }}
      >
        <RollingText value={formatTime(time)} direction={direction} />
      </motion.div>
      <motion.p className="time-picker__caption" variants={riseIn}>
        {timeWithAira(time)}
      </motion.p>
    </motion.div>
  )
}

function RiderCounter({
  riders,
  direction,
  onChange,
  nudge,
}: {
  riders: number
  direction: number
  onChange: (delta: number) => boolean
  nudge: number
}) {
  const shake = useAnimation()
  const plusHint = useAnimation()

  // 아직 4명이 아닌데 버튼을 누르면 + 를 콩콩 눌러보라고 알려줌
  useEffect(() => {
    if (nudge) plusHint.start({ scale: [1, 1.25, 1, 1.18, 1], transition: { duration: 0.6 } })
  }, [nudge, plusHint])

  const press = (delta: number) => {
    if (!onChange(delta)) shake.start({ x: [0, -10, 10, -6, 6, 0], transition: { duration: 0.4 } })
  }

  return (
    <motion.div className="rider-counter" variants={stagger(0.08, 0.15)} initial="hidden" animate="show">
      <motion.div variants={riseIn}>
        <StepperButton icon={subtractIcon} label="Remove a passenger" disabled={riders <= 1} onClick={() => press(-1)} />
      </motion.div>
      <motion.div className="rider-counter__value" variants={riseIn}>
        <motion.div animate={shake}>
          <RollingText className="rider-counter__number" value={String(riders)} direction={direction} />
        </motion.div>
        <p className="rider-counter__label">Passengers</p>
      </motion.div>
      <motion.div variants={riseIn}>
        <motion.div animate={plusHint}>
          <StepperButton icon={addIcon} label="Add a passenger" disabled={riders >= MAX_RIDERS} onClick={() => press(1)} />
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

function StepperButton({ icon, label, disabled, onClick }: { icon: string; label: string; disabled: boolean; onClick: () => void }) {
  return (
    <motion.button
      className={`stepper${disabled ? ' is-disabled' : ''}`}
      aria-label={label}
      aria-disabled={disabled}
      whileTap={{ scale: disabled ? 0.96 : 0.82 }}
      transition={spring}
      onClick={onClick}
    >
      <Icon src={icon} width={36} color={disabled ? 'var(--color-sub)' : '#fff'} />
    </motion.button>
  )
}

function BookedSummary({ time, riders }: { time: string; riders: number }) {
  const rows = [
    ['DATE', 'Dec 24'],
    ['TIME', time],
    ['PASSENGERS', String(riders)],
  ]

  return (
    <div className="booked">
      {/* 차가 오른쪽에서 달려와 살짝 앞으로 쏠리며 멈춘 뒤, 문이 열리고 탑승 */}
      <motion.div
        className="booked__car"
        initial={{ x: 320, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 90, damping: 14, delay: 0.15 }}
      >
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: [0, 0, -2.5, 1, 0] }}
          transition={{ duration: 1.1, times: [0, 0.45, 0.6, 0.8, 1], delay: 0.15 }}
        >
          <BoardingScene riders={riders} />
        </motion.div>
      </motion.div>
      <motion.div className="booked__info" variants={stagger(0.09, 0.55)} initial="hidden" animate="show">
        <motion.p className="booked__name" variants={riseIn}>
          AIRA 07
        </motion.p>
        {rows.map(([key, value]) => (
          <motion.div key={key} className="booked__row" variants={riseIn}>
            <span className="booked__key">{key}</span>
            <span className="booked__value">{value}</span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
