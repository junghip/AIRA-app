import { AnimatePresence, motion } from 'motion/react'
import type { Transition } from 'motion/react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import cameraIcon from '../../assets/icons/camera-fill.svg'
import backIcon from '../../assets/icons/arrow-left.svg'
import chevronSub from '../../assets/icons/chevron-right-sub.svg'
import closeIcon from '../../assets/icons/close-line.svg'
import fileIcon from '../../assets/icons/file-list-fill.svg'
import flightIcon from '../../assets/icons/flight-takeoff-line.svg'
import imageIcon from '../../assets/icons/image-fill.svg'
import chevronManual from '../../assets/pass/chevron-manual.svg'
import doneBloom from '../../assets/pass/done-bloom.svg'
import bookmarkIcon from '../../assets/pass/done-bookmark.svg'
import checkIcon from '../../assets/pass/done-check.svg'
import lightPool from '../../assets/pass/done-light-pool.svg'
import shockwave from '../../assets/pass/done-shockwave.svg'
import glowReading from '../../assets/pass/glow-reading.svg'
import glowUpload from '../../assets/pass/glow-upload.svg'
import miniPerforation from '../../assets/pass/mini-card-perforation.svg'
import miniPlane from '../../assets/pass/mini-card-plane.svg'
import scanCorners from '../../assets/pass/scan-corners.svg'
import AmbientGradient from '../../components/AmbientGradient'
import GlassIconButton from '../../components/GlassIconButton'
import Icon from '../../components/Icon'
import { riseIn, softSpring, spring, stagger } from '../../motion/transitions'
import BoardingPass, { PASS_H } from './BoardingPass'
import './Pass.css'

type Step = 'upload' | 'reading' | 'done'

const copy: Record<Step, { title: string[]; sub: string[] }> = {
  upload: { title: ['Upload your', 'boarding pass'], sub: ['Snap it or pick a file, we read the rest.'] },
  reading: { title: ['Reading your', 'boarding pass.'], sub: ['Pulling out the flight, gate and time.'] },
  done: { title: ['Your All set!'], sub: ['KE 081 is on your trip.', 'Your gate and boarding time are saved.'] },
}

// 단계별 탑승권 위치 — 피그마 프레임(393×852) 기준 중심 좌표, 크기, 기울기
const poses: Record<Step, { cx: number; cy: number; scale: number; rotate: number }> = {
  upload: { cx: 252.62, cy: 462.06, scale: 0.8913, rotate: 8.65 },
  reading: { cx: 196.17, cy: 459.12, scale: 1, rotate: 0 },
  done: { cx: 196.15, cy: 453.27, scale: 1.1381, rotate: 0 },
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
      <motion.div className="pass__bg-done" animate={{ opacity: step === 'done' ? 1 : 0 }} transition={{ duration: 0.8 }}>
        <AmbientGradient />
      </motion.div>

      {/* 단계마다 탑승권 뒤에 깔리는 빛 */}
      <AnimatePresence>
        {step === 'upload' && (
          <motion.img
            key="glow-upload"
            className="pass__glow pass__glow--upload"
            src={glowUpload}
            alt=""
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          />
        )}
        {step === 'reading' && (
          <motion.img
            key="glow-reading"
            className="pass__glow pass__glow--reading"
            src={glowReading}
            alt=""
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: [0.7, 1, 0.7], scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ opacity: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }, scale: { duration: 0.6 } }}
          />
        )}
        {step === 'done' && <DoneBackdrop key="done-backdrop" />}
      </AnimatePresence>

      <div className="pass__top">
        <AnimatePresence>
          {step !== 'done' && (
            <motion.div key="back" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
              <GlassIconButton icon={backIcon} label="Back" onClick={step === 'reading' ? () => setStep('upload') : close} />
            </motion.div>
          )}
        </AnimatePresence>
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
                transition={{ delay: 0.45, duration: 1.2, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1.8 }}
              />
            </div>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>{step === 'done' && <DoneOverlay key="done-overlay" />}</AnimatePresence>

      {/* 작은 가로 카드 — 큰 탑승권 앞에 겹침. 업로드 단계에만, 고르면 옆으로 날아감 */}
      <AnimatePresence>
        {step === 'upload' && (
          <motion.div
            className="pass__mini-anchor"
            initial={{ x: -200, rotate: -30, opacity: 0 }}
            animate={{ x: 0, rotate: -12.98, opacity: 1 }}
            exit={{ x: -240, y: 40, rotate: -40, opacity: 0 }}
            transition={{ ...softSpring, delay: 0.15 }}
          >
            <motion.div
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
            >
              <motion.div className="mini-pass-wrap" drag dragSnapToOrigin dragElastic={0.5} whileDrag={{ scale: 1.06 }}>
                <div className="mini-pass">
                  <motion.span className="mini-pass__beam-glow" animate={beamSweep} transition={beamSweepTransition} />
                  <span className="mini-pass__scanlines" />
                  <p className="mini-pass__label">BOARDING PASS</p>
                  <p className="mini-pass__route">ICN → LAX</p>
                  <p className="mini-pass__key">GATE</p>
                  <p className="mini-pass__gate">28</p>
                  <span className="mini-pass__bar" style={{ top: 56.86, width: 38.4, background: 'rgba(255, 255, 255, 0.26)' }} />
                  <span className="mini-pass__bar" style={{ top: 67.2, width: 28.061, background: 'rgba(255, 255, 255, 0.2)' }} />
                  <p className="mini-pass__flight">KE 081</p>
                  <img className="mini-pass__perforation" src={miniPerforation} width={82.707} height={0.738} alt="" />
                  <img className="mini-pass__plane" src={miniPlane} width={16.246} height={16.246} alt="" />
                  <p className="mini-pass__seat">28A</p>
                </div>
                {/* 카드를 가로지르며 훑는 파란 빛줄기 */}
                <motion.span className="mini-pass__beam" animate={beamSweep} transition={beamSweepTransition} />
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
            <div className="pass__sources-row">
            {sources.map(({ label, icon }) => (
              <motion.button key={label} className="source" variants={riseIn} onClick={() => setStep('reading')}>
                <motion.span className="source__tile" whileHover={{ y: -3 }} whileTap={{ scale: 0.9 }} transition={spring}>
                  <Icon src={icon} width={32} color="#fff" />
                </motion.span>
                <span className="source__label">{label}</span>
              </motion.button>
            ))}
            </div>
            <motion.div className="pass__center pass__center--manual" variants={riseIn}>
              <motion.button className="manual-link" whileTap={{ scale: 0.96 }} transition={spring}>
                Enter flight number instead
                <img src={chevronManual} width={13} height={13} alt="" />
              </motion.button>
            </motion.div>
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
            <motion.div className="pass__progress" variants={riseIn}>
              <motion.span
                className="pass__progress-fill"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: READING_MS / 1000, ease: [0.4, 0, 0.2, 1] }}
              />
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
                className="cta cta--solid"
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
                  <Icon src={flightIcon} width={20} color="var(--color-ink)" />
                </motion.span>
              </motion.button>
            </motion.div>
            <motion.div className="pass__center pass__center--saved" variants={riseIn}>
              <div className="saved-pill" role="status">
                Saved to your trip
                <img src={bookmarkIcon} width={20} height={16} alt="" />
              </div>
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

// 업로드 화면 작은 카드의 빛줄기 — 좌우로 왕복
const beamSweep = { x: [0, 70, -60, 0] }
const beamSweepTransition: Transition = { duration: 3.2, times: [0, 0.4, 0.85, 1], ease: 'easeInOut', repeat: Infinity, delay: 0.8 }

// 완료 — 탑승권 뒤로 퍼지는 빛과 파동
function DoneBackdrop() {
  return (
    <motion.div className="pass__layer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
      <motion.img
        className="pass__bloom"
        src={doneBloom}
        alt=""
        initial={{ scale: 0.4 }}
        animate={{ scale: [1, 1.07, 1] }}
        transition={{ scale: { duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 } }}
      />
      <motion.img
        className="pass__shockwave"
        src={shockwave}
        alt=""
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: [0.5, 1, 1.04, 1], opacity: [0, 1, 0.7, 1] }}
        transition={{ duration: 1.4, delay: 0.25, ease: 'easeOut' }}
      />
      <motion.img
        className="pass__light-pool"
        src={lightPool}
        alt=""
        initial={{ opacity: 0, scaleX: 0.5 }}
        animate={{ opacity: [0.75, 1, 0.75], scaleX: 1 }}
        transition={{ opacity: { duration: 3, repeat: Infinity, ease: 'easeInOut' }, scaleX: { duration: 0.9, ease: 'easeOut' } }}
      />
    </motion.div>
  )
}

// 완료 — 탑승권 위로 지나가는 빛줄기와 체크 배지
function DoneOverlay() {
  return (
    <motion.div className="pass__layer" initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
      <motion.span
        className="pass__streak"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: [0, 1, 0.75, 1] }}
        transition={{ scaleX: { duration: 0.7, delay: 0.35, ease: 'easeOut' }, opacity: { duration: 2.4, delay: 0.35, repeat: Infinity, ease: 'easeInOut' } }}
      />
      <motion.span
        className="pass__badge"
        initial={{ scale: 0, rotate: -45 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 16, delay: 0.55 }}
      >
        <motion.img
          src={checkIcon}
          width={23.182}
          height={23.182}
          alt=""
          initial={{ clipPath: 'inset(0 100% 0 0)' }}
          animate={{ clipPath: 'inset(0 0% 0 0)' }}
          transition={{ duration: 0.35, delay: 0.85, ease: 'easeOut' }}
        />
      </motion.span>
    </motion.div>
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
