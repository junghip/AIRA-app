import { AnimatePresence, motion } from 'motion/react'
import QRCode from 'qrcode'
import { useCallback, useEffect, useRef, useState } from 'react'
import airaLogo from '../assets/common/aira-logo.svg'
import carIvory from '../assets/home/car-ivory.png'
import AmbientGradient from '../components/AmbientGradient'
import { riseIn, softSpring, spring, stagger } from '../motion/transitions'
import { backdrops, loadBackdropImages, type Backdrop } from './backgrounds'
import { BoothCamera } from './camera'
import { composeStrip, SHOTS } from './compose'
import { isOnline, newId, photoPageUrl, savePhoto } from './store'
import './Booth.css'

// 아이패드 세로 포토부스: 시작 → 배경 고르기 → 4컷 촬영 → 결과 + QR
type Phase = 'intro' | 'setup' | 'shooting' | 'result'
type Upload = 'working' | 'done' | 'error'

const COUNT_FROM = 3
const RESET_AFTER = 90 // 결과 화면에서 이만큼(초) 지나면 처음으로

export default function Booth() {
  const [phase, setPhase] = useState<Phase>('intro')
  const [backdrop, setBackdrop] = useState<Backdrop>(backdrops[0])
  const [camError, setCamError] = useState<string | null>(null)
  const [segState, setSegState] = useState<'loading' | 'ready' | 'failed'>('loading')
  const [count, setCount] = useState<number | null>(null)
  const [flash, setFlash] = useState(0)
  const [shots, setShots] = useState<string[]>([])
  const [strip, setStrip] = useState<string | null>(null)
  const [qr, setQr] = useState<string | null>(null)
  const [link, setLink] = useState<string | null>(null)
  const [upload, setUpload] = useState<Upload>('working')
  const [left, setLeft] = useState(RESET_AFTER)

  // 시작 화면이 사라진 뒤에 캔버스가 생기므로, 생기는 순간을 state로 받아 카메라를 켬
  const [canvasEl, setCanvasEl] = useState<HTMLCanvasElement | null>(null)
  const camRef = useRef<BoothCamera | null>(null)
  const stripBlob = useRef<Blob | null>(null)
  const photoId = useRef('')

  useEffect(() => {
    loadBackdropImages()
  }, [])

  // 배경 바꾸면 카메라 합성에도 바로 반영
  useEffect(() => {
    if (camRef.current) camRef.current.backdrop = backdrop
  }, [backdrop])

  const startCamera = useCallback(async () => {
    const canvas = canvasEl
    if (!canvas || camRef.current) return
    const cam = new BoothCamera(canvas, backdrop)
    camRef.current = cam
    try {
      setCamError(null)
      await cam.start(() => setSegState(cam.segReady ? 'ready' : 'failed'))
    } catch (e) {
      console.error(e)
      camRef.current = null
      setCamError('카메라를 켤 수 없어요. 설정에서 카메라 권한을 허용해 주세요.')
    }
  }, [backdrop, canvasEl])

  const stopCamera = () => {
    camRef.current?.stop()
    camRef.current = null
  }

  useEffect(() => stopCamera, [])

  // 촬영 화면에 들어오면 카메라 켜기 (캔버스가 그려진 다음)
  useEffect(() => {
    if (phase === 'setup' && canvasEl) startCamera()
  }, [phase, canvasEl, startCamera])

  const goIntro = () => {
    stopCamera()
    setShots([])
    setStrip(null)
    setQr(null)
    setLink(null)
    setPhase('intro')
  }

  // 4컷 연속 촬영
  const shoot = async () => {
    const cam = camRef.current
    if (!cam) return
    setPhase('shooting')
    const canvases: HTMLCanvasElement[] = []
    setShots([])
    for (let i = 0; i < SHOTS; i++) {
      for (let n = COUNT_FROM; n > 0; n--) {
        setCount(n)
        await wait(1000)
      }
      setCount(null)
      const snap = cam.snapshot()
      canvases.push(snap)
      setFlash((f) => f + 1)
      setShots((s) => [...s, snap.toDataURL('image/jpeg', 0.7)])
      await wait(900)
    }
    stopCamera()
    await finish(canvases)
  }

  const finish = async (canvases: HTMLCanvasElement[]) => {
    const blob = await composeStrip(canvases)
    stripBlob.current = blob
    setStrip(URL.createObjectURL(blob))
    photoId.current = newId()
    const url = photoPageUrl(photoId.current)
    setLink(url)
    setQr(await QRCode.toDataURL(url, { margin: 1, width: 520, color: { dark: '#050c2c', light: '#ffffff' } }))
    setLeft(RESET_AFTER)
    setPhase('result')
    await doUpload()
  }

  const doUpload = async () => {
    if (!stripBlob.current) return
    setUpload('working')
    try {
      await savePhoto(photoId.current, stripBlob.current)
      setUpload('done')
    } catch (e) {
      console.error(e)
      setUpload('error')
    }
  }

  // 결과 화면 자동 초기화
  useEffect(() => {
    if (phase !== 'result') return
    const t = setInterval(() => setLeft((s) => s - 1), 1000)
    return () => clearInterval(t)
  }, [phase])
  useEffect(() => {
    if (phase === 'result' && left <= 0) goIntro()
  }, [left, phase])

  const showCamera = phase === 'setup' || phase === 'shooting'

  return (
    <div className="booth">
      <AmbientGradient />

      <header className="booth__top">
        <img src={airaLogo} alt="AIRA" className="booth__logo" onDoubleClick={goIntro} />
        <span className="booth__chip">포토부스</span>
      </header>

      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <motion.section
            key="intro"
            className="booth__intro"
            variants={stagger(0.09, 0.1)}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, y: -20, filter: 'blur(8px)', transition: { duration: 0.35 } }}
          >
            <motion.p className="booth__eyebrow" variants={riseIn}>
              AIRA PHOTO BOOTH
            </motion.p>
            <motion.h1 className="booth__title" variants={riseIn}>
              공항 가는 길,
              <br />
              오늘을 네 컷으로
            </motion.h1>
            <motion.p className="booth__lead" variants={riseIn}>
              배경을 고르고 사진을 찍으면
              <br />
              QR로 내 휴대폰에 바로 받을 수 있어요.
            </motion.p>

            <motion.div className="booth__car" variants={riseIn}>
              <motion.img
                src={carIvory}
                alt=""
                draggable={false}
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
              />
            </motion.div>

            <motion.ol className="booth__steps" variants={riseIn}>
              <li>
                <b>1</b>배경 고르기
              </li>
              <li>
                <b>2</b>네 컷 촬영
              </li>
              <li>
                <b>3</b>QR로 받기
              </li>
            </motion.ol>

            <motion.button
              className="booth__cta"
              variants={riseIn}
              whileTap={{ scale: 0.95 }}
              transition={spring}
              onClick={() => setPhase('setup')}
            >
              시작하기
            </motion.button>
          </motion.section>
        )}

        {showCamera && (
          <motion.section
            key="camera"
            className="booth__shoot"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.3 } }}
            transition={softSpring}
          >
            <div className="booth__stage">
              <canvas ref={setCanvasEl} className="booth__canvas" />

              {camError && (
                <div className="booth__notice">
                  <p>{camError}</p>
                  <button className="booth__ghost" onClick={startCamera}>
                    다시 시도
                  </button>
                </div>
              )}

              {phase === 'setup' && backdrop.kind !== 'none' && segState === 'loading' && !camError && (
                <div className="booth__badge">배경 준비 중…</div>
              )}
              {segState === 'failed' && backdrop.kind !== 'none' && <div className="booth__badge">배경 바꾸기를 불러오지 못했어요</div>}

              <AnimatePresence>
                {count !== null && (
                  <motion.div
                    key={`${shots.length}-${count}`}
                    className="booth__count"
                    initial={{ opacity: 0, scale: 1.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.6 }}
                    transition={{ duration: 0.35 }}
                  >
                    {count}
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {flash > 0 && (
                  <motion.div
                    key={flash}
                    className="booth__flash"
                    initial={{ opacity: 0.95 }}
                    animate={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                  />
                )}
              </AnimatePresence>

              {phase === 'shooting' && (
                <div className="booth__progress">
                  {Array.from({ length: SHOTS }, (_, i) => (
                    <span key={i} className={i < shots.length ? 'is-done' : i === shots.length ? 'is-now' : ''} />
                  ))}
                </div>
              )}
            </div>

            <AnimatePresence mode="wait">
              {phase === 'setup' ? (
                <motion.div key="controls" className="booth__controls" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
                  <div className="booth__backdrops" role="radiogroup" aria-label="배경">
                    {backdrops.map((b) => (
                      <motion.button
                        key={b.id}
                        role="radio"
                        aria-checked={b.id === backdrop.id}
                        className={`backdrop-chip ${b.id === backdrop.id ? 'is-on' : ''}`}
                        whileTap={{ scale: 0.92 }}
                        transition={spring}
                        onClick={() => setBackdrop(b)}
                      >
                        <span className={`backdrop-chip__thumb backdrop-chip__thumb--${b.kind}`} style={b.kind === 'image' ? { backgroundImage: `url(${b.src})`, backgroundPosition: `${b.focusX * 100}% ${b.focusY * 100}%` } : undefined} />
                        {b.label}
                      </motion.button>
                    ))}
                  </div>
                  <div className="booth__shutter-row">
                    <button className="booth__back" onClick={goIntro}>
                      처음으로
                    </button>
                    <motion.button
                      className="booth__shutter"
                      aria-label="촬영 시작"
                      disabled={!!camError}
                      whileTap={{ scale: 0.9 }}
                      transition={spring}
                      onClick={shoot}
                    >
                      <span />
                    </motion.button>
                    <span className="booth__shutter-hint">눌러서 네 컷 촬영</span>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="thumbs" className="booth__thumbs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {Array.from({ length: SHOTS }, (_, i) => (
                    <div key={i} className="booth__thumb">
                      {shots[i] && <motion.img src={shots[i]} alt="" initial={{ opacity: 0, scale: 1.2 }} animate={{ opacity: 1, scale: 1 }} transition={softSpring} />}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>
        )}

        {phase === 'result' && (
          <motion.section key="result" className="booth__result" variants={stagger(0.12, 0.1)} initial="hidden" animate="show" exit={{ opacity: 0, transition: { duration: 0.3 } }}>
            <motion.h2 className="booth__result-title" variants={riseIn}>
              사진이 완성됐어요!
            </motion.h2>

            {strip && (
              <motion.img
                className="booth__strip"
                src={strip}
                alt="완성된 네 컷 사진"
                initial={{ opacity: 0, y: 60, rotate: -4, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, rotate: -1.5, scale: 1 }}
                transition={{ ...softSpring, delay: 0.15 }}
              />
            )}

            <motion.div className="booth__qr-card" variants={riseIn}>
              <a className="booth__qr" href={link ?? undefined} target="_blank" rel="noreferrer">
                {qr && <img src={qr} alt="사진 받기 QR 코드" />}
                {upload !== 'done' && <div className="booth__qr-cover">{upload === 'working' ? '사진 올리는 중…' : '업로드 실패'}</div>}
              </a>
              <div className="booth__qr-text">
                <b>휴대폰 카메라로 QR을 찍어 주세요</b>
                <p>사진 저장하고, 방명록도 남길 수 있어요.</p>
                {upload === 'error' && (
                  <button className="booth__ghost booth__ghost--dark" onClick={doUpload}>
                    다시 올리기
                  </button>
                )}
                {!isOnline && <span className="booth__test">테스트 모드 · 이 기기에서만 열려요</span>}
              </div>
            </motion.div>

            <motion.div className="booth__result-actions" variants={riseIn}>
              <motion.button className="booth__cta booth__cta--small" whileTap={{ scale: 0.95 }} transition={spring} onClick={goIntro}>
                처음으로
              </motion.button>
              <p className="booth__timer">{left}초 뒤 처음 화면으로 돌아가요</p>
            </motion.div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  )
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))
