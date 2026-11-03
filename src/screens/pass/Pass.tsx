import { AnimatePresence, motion } from 'motion/react'
import type { Transition } from 'motion/react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import cameraIcon from '../../assets/icons/camera-fill.svg'
import chevronSub from '../../assets/icons/chevron-right-sub.svg'
import closeIcon from '../../assets/icons/close-line.svg'
import fileIcon from '../../assets/icons/file-list-fill.svg'
import flightIcon from '../../assets/icons/flight-takeoff-line.svg'
import imageIcon from '../../assets/icons/image-fill.svg'
import miniPlane from '../../assets/pass/mini-card-plane.svg'
import scanCorners from '../../assets/pass/scan-corners.svg'
import GlassIconButton from '../../components/GlassIconButton'
import Icon from '../../components/Icon'
import { riseIn, softSpring, spring, stagger } from '../../motion/transitions'
import BoardingPass, { PASS_H } from './BoardingPass'
import './Pass.css'

type Step = 'upload' | 'reading' | 'done'

const copy: Record<Step, { title: string[]; sub: string[] }> = {
  upload: { title: ['Upload your', 'boarding pass'], sub: ['Snap it or pick a file, we read the rest.'] },
  reading: { title: ['Reading your', 'boarding pass.'], sub: ['Pulling out the flight, gate and time.'] },
  done: { title: ['All set!'], sub: ['KE 081 is on your trip.', 'Your gate and boarding time are saved.'] },
}

// 단계별 탑승권 위치 — 피그마 프레임(393×852) 기준 중심 좌표, 크기, 기울기
const poses: Record<Step, { cx: number; cy: number; scale: number; rotate: number }> = {
  upload: { cx: 251.59, cy: 431.11, scale: 0.8757, rotate: 8.65 },
  reading: { cx: 196.17, cy: 439.12, scale: 1, rotate: 0 },
  done: { cx: 196.13, cy: 453.97, scale: 1.1783, rotate: 0 },
}

const poseTransition: Record<Step, Transition> = {
  upload: softSpring,
  reading: { type: 'spring', stiffness: 160, damping: 20 },
  done: { type: 'spring', stiffness: 140, damping: 13 }, // 살짝 튕기며 안착
}

const sources = [
  { label: 'Camera', icon: cameraIcon },
  { label: 'Photo', icon: imageIcon },
  { label: 'File', icon: fileIcon },
]

const READING_MS = 3200

export default function Pass() {
  const navigate = useNavigate()
  const location = useLocation()
  const [step, setStep] = useState<Step>('upload')

  // 스캔 연출이 끝나면 자동으로 완료 단계로
  useEffect(() => {
    if (step !== 'reading') return
    const timer = setTimeout(() => setStep('done'), READING_MS)
    return () => clearTimeout(timer)
  }, [step])

  const close = () => (location.key === 'default' ? navigate('/') : navigate(-1))
  const pose = poses[step]

  return (
    <div className="pass">
      <motion.div className="pass__bg-done" animate={{ opacity: step === 'done' ? 1 : 0 }} transition={{ duration: 0.8 }} />

      <div className="pass__top">
        <GlassIconButton icon={closeIcon} label="Close" onClick={close} />
      </div>

      <AnimatePresence initial={false}>
        <motion.div
          key={step}
          className="pass__headline"
          initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -16, filter: 'blur(6px)' }}
          transition={softSpring}
        >
          <h1 className="pass__title">
            {copy[step].title.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </h1>
          <p className="pass__sub">
            {copy[step].sub.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* 스캔 프레임 모서리 */}
      <AnimatePresence>
        {step === 'reading' && (
          <motion.img
            className="pass__corners"
            src={scanCorners}
            width={209}
            height={321}
            alt=""
            initial={{ opacity: 0, scale: 1.18 }}
            animate={{ opacity: 1, scale: [1, 1.025, 1] }}
            exit={{ opacity: 0, scale: 1.12 }}
            transition={{
              opacity: { duration: 0.3 },
              scale: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' },
            }}
          />
        )}
      </AnimatePresence>

      {/* 하나의 탑승권이 단계마다 기울기·크기·위치를 바꾸며 이어짐 */}
      <motion.div
        className="pass__ticket-anchor"
        initial={{ x: pose.cx - 196.5 + 200, y: pose.cy - PASS_H / 2, scale: pose.scale, rotate: pose.rotate + 20, opacity: 0 }}
        animate={{ x: pose.cx - 196.5, y: pose.cy - PASS_H / 2, scale: pose.scale, rotate: pose.rotate, opacity: 1 }}
        transition={poseTransition[step]}
      >
        <motion.div
          animate={step === 'upload' ? { y: [0, -7, 0] } : { y: 0 }}
          transition={step === 'upload' ? { duration: 3.6, repeat: Infinity, ease: 'easeInOut' } : softSpring}
        >
          <motion.div
            drag={step === 'upload'}
            dragSnapToOrigin
            dragElastic={0.5}
            whileDrag={{ scale: 1.04, rotate: -4 }}
            style={{ cursor: step === 'upload' ? 'grab' : 'default' }}
          >
            <BoardingPass />
          </motion.div>
        </motion.div>

        <AnimatePresence>
          {step === 'reading' && <ScanBeam key="beam" />}
          {step === 'done' && (
            <div key="shine" className="pass__ticket-clip">
              <motion.div
                className="pass__shine"
                initial={{ x: '-130%' }}
                animate={{ x: '130%' }}
                transition={{ delay: 0.45, duration: 1.1, ease: 'easeInOut' }}
              />
            </div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* 작은 가로 카드 — 큰 탑승권 앞에 겹침. 업로드 단계에만, 고르면 옆으로 날아감 */}
      <AnimatePresence>
        {step === 'upload' && (
          <motion.div
            className="pass__mini-anchor"
            initial={{ x: -260, y: 435, rotate: -30, opacity: 0 }}
            animate={{ x: -69.17, y: 435, rotate: -12.19, opacity: 1 }}
            exit={{ x: -300, y: 470, rotate: -40, opacity: 0 }}
            transition={{ ...softSpring, delay: 0.15 }}
          >
            <motion.div
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
            >
              <motion.div className="mini-pass" drag dragSnapToOrigin dragElastic={0.5} whileDrag={{ scale: 1.06 }}>
                <p className="mini-pass__label">BOARDING PASS</p>
                <p className="mini-pass__route">ICN → LAX</p>
                <span className="mini-pass__bar" style={{ top: 48.95, width: 54.547, opacity: 1 }} />
                <span className="mini-pass__bar" style={{ top: 58.74, width: 72.73, opacity: 0.73 }} />
                <span className="mini-pass__bar" style={{ top: 68.53, width: 39.162, opacity: 0.73 }} />
                <p className="mini-pass__flight">KE 081</p>
                <img className="mini-pass__plane" src={miniPlane} width={15.385} height={15.385} alt="" />
                <p className="mini-pass__seat">28A</p>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="popLayout">
        {step === 'upload' && (
          <motion.div
            key="upload"
            className="pass__sources"
            variants={stagger(0.07, 0.25)}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, y: 20, transition: { duration: 0.2 } }}
          >
            {sources.map(({ label, icon }) => (
              <motion.button key={label} className="source" variants={riseIn} onClick={() => setStep('reading')}>
                <motion.span className="source__tile" whileHover={{ y: -3 }} whileTap={{ scale: 0.9 }} transition={spring}>
                  <Icon src={icon} width={32} color="#fff" />
                </motion.span>
                <span className="source__label">{label}</span>
              </motion.button>
            ))}
          </motion.div>
        )}

        {step === 'reading' && (
          <motion.div
            key="reading"
            className="pass__reading"
            variants={stagger(0.08, 0.3)}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
          >
            <motion.div className="pass__caption" variants={riseIn} role="status">
              <p className="pass__caption-title">
                Reading flight details
                <LoadingDots />
              </p>
              <p className="pass__caption-sub">Keep this screen open</p>
            </motion.div>
            <motion.div className="pass__center pass__center--cancel" variants={riseIn}>
              <motion.button className="glass-pill" whileTap={{ scale: 0.94 }} transition={spring} onClick={() => setStep('upload')}>
                Cancel
              </motion.button>
            </motion.div>
          </motion.div>
        )}

        {step === 'done' && (
          <motion.div key="done" variants={stagger(0.08, 0.55)} initial="hidden" animate="show" exit={{ opacity: 0 }}>
            <motion.div className="pass__center pass__center--cta" variants={riseIn}>
              <motion.button
                className="cta"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                transition={spring}
                onClick={() => navigate('/reserve')}
              >
                Find my ride
                {/* 버튼 누르기 전부터 비행기가 살짝 이륙 준비 */}
                <motion.span
                  animate={{ x: [0, 3, 0], y: [0, -2, 0] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
                >
                  <Icon src={flightIcon} width={24} color="var(--color-ink)" />
                </motion.span>
              </motion.button>
            </motion.div>
            <motion.div className="pass__center pass__center--link" variants={riseIn}>
              <motion.button className="text-link" whileTap={{ scale: 0.96 }} onClick={() => setStep('upload')}>
                Upload a different pass
                <img src={chevronSub} width={20} height={20} alt="" />
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// 스캔 빛줄기 — 탑승권 위아래를 왕복 (위치는 탑승권 기준 좌표)
function ScanBeam() {
  const sweep = { y: [0, 190, -85, 0] }
  const sweepTransition: Transition = { duration: 2.6, times: [0, 0.4, 0.85, 1], ease: 'easeInOut', repeat: Infinity }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
      <div className="pass__ticket-clip">
        <motion.div className="pass__beam-glow" animate={sweep} transition={sweepTransition} />
      </div>
      <motion.div className="pass__beam" animate={sweep} transition={sweepTransition} />
    </motion.div>
  )
}

function LoadingDots() {
  return (
    <span className="loading-dots" aria-hidden>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
        >
          .
        </motion.span>
      ))}
    </span>
  )
}
