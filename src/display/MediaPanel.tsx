import { motion, type PanInfo } from 'motion/react'
import { useEffect, useRef, type CSSProperties } from 'react'
import genreAction from '../assets/display/genre-action.jpg'
import genreAnimation from '../assets/display/genre-animation.jpg'
import genreComedy from '../assets/display/genre-comedy.jpg'
import genreDrama from '../assets/display/genre-drama.jpg'
import genreFamily from '../assets/display/genre-family.jpg'
import genreRomance from '../assets/display/genre-romance.jpg'
import genreShort from '../assets/display/genre-short.jpg'
import genreTravel from '../assets/display/genre-travel.png'
import mediaEllipse from '../assets/display/media-ellipse.svg'
import movieArt from '../assets/display/movie-art.jpg'
import movieAvion from '../assets/display/movie-avion.png'
import movieJourney from '../assets/display/movie-journey.jpg'
import movieParis from '../assets/display/movie-paris.jpg'
import parisClip from '../assets/display/paris.mp4'
import movieRoadtrip from '../assets/display/movie-roadtrip.jpg'
import movieVacation from '../assets/display/movie-vacation.jpg'
import posterMidnight from '../assets/display/poster-midnight.jpg'
import posterRoman from '../assets/display/poster-roman.jpg'
import posterSunrise from '../assets/display/poster-sunrise.jpg'
import { softSpring, spring } from '../motion/transitions'
import Segmented from './Segmented'
import { usePrimaryCopy, useSharedMotionValue, useSharedState } from './shared'
import Tabs from './Tabs'
import './MediaPanel.css'

// 피그마 Section 8 "영화" (522:1467) — 가운데 474×538 카드, 양옆은 같은 카드를 줄여서 겹침
// 각 카드: 바탕 사진 + 색 덮개(tint) + (있으면) 포스터를 위에 한 겹 더 + 아래 정보 띠(bar)
type Movie = {
  title: string
  year: string
  time: string
  src: string
  img: CSSProperties
  tint: string
  poster?: { src: string; style: CSSProperties; shade?: string }
  bar: string
}

const TINT = 'linear-gradient(90deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.1) 100%), linear-gradient(180deg, rgba(255, 255, 255, 0.24) 0%, rgba(255, 255, 255, 0.032) 100%)'
const BAR = 'linear-gradient(180deg, rgba(255, 255, 255, 0.24) 0%, rgba(255, 255, 255, 0.032) 100%), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.1) 100%)'
const BAR_BRIGHT = 'linear-gradient(180deg, rgba(255, 255, 255, 0.24) 0%, rgba(255, 255, 255, 0.032) 100%), linear-gradient(90deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.4) 100%)'

// 포스터 크기·위치는 피그마의 작은 카드 값을 474px 카드 기준으로 되돌린 값
const MOVIES: Movie[] = [
  {
    title: 'Midnight In Paris',
    year: '2011',
    time: '1hr 36min',
    src: movieJourney,
    img: { width: '100%', height: '124.78%', left: 0, top: '-23.15%' },
    tint: TINT,
    poster: { src: posterMidnight, style: { left: -4.5, bottom: -5, width: 470, height: 671.4 } },
    bar: BAR,
  },
  {
    title: 'Roman Holiday',
    year: '1953',
    time: '1hr 36min',
    src: movieVacation,
    img: { width: '102.13%', height: '125.48%', left: '-1.15%', top: '-6.93%' },
    tint: 'linear-gradient(90deg, rgba(252, 252, 252, 0.2) 0%, rgba(252, 252, 252, 0.2) 100%), linear-gradient(90deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.1) 100%), linear-gradient(180deg, rgba(255, 255, 255, 0.24) 0%, rgba(255, 255, 255, 0.032) 100%)',
    poster: { src: posterRoman, style: { left: -3.8, bottom: -4.3, width: 378.6, height: 541 } },
    bar: BAR_BRIGHT,
  },
  {
    title: 'Before Sunrise',
    year: '1995',
    time: '1hr 36min',
    src: movieAvion,
    img: { width: '100%', height: '100%', left: 0, top: 0, objectFit: 'cover', objectPosition: 'bottom' },
    tint: 'linear-gradient(90deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.1) 100%), linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.4) 100%)',
    poster: {
      src: posterSunrise,
      style: { left: -3, top: -150, width: 474, height: 684 },
      shade: 'linear-gradient(180deg, rgba(255, 255, 255, 0.08) 77.047%, rgba(24, 23, 22, 0.8) 100%)',
    },
    bar: 'linear-gradient(180deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.04) 100%), linear-gradient(90deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.4) 100%)',
  },
  {
    title: 'The Road Trip',
    year: '2004',
    time: '2hr 10min',
    src: movieRoadtrip,
    img: { width: '100%', height: '132.39%', left: '0.11%', top: '-16.17%' },
    tint: TINT,
    bar: BAR,
  },
  {
    title: 'The Art of Travel',
    year: '2014',
    time: '1hr 56min',
    src: movieArt,
    img: { width: '100%', height: '145.62%', left: 0, top: '-15.69%' },
    tint: TINT,
    bar: BAR,
  },
]

// 가운데에서 몇 칸 떨어졌는지 → 위치·크기·투명도 (피그마 값)
const SLOT: Record<number, { x: number; scale: number; opacity: number; z: number }> = {
  0: { x: 0, scale: 1, opacity: 1, z: 3 },
  1: { x: 313.5, scale: 376 / 474, opacity: 0.9, z: 2 },
  2: { x: 547.5, scale: 314 / 474, opacity: 0.4, z: 1 },
}

const GENRES = [
  { name: 'Comedy', src: genreComedy, col: 0, row: 1, img: { width: 231, height: 130, left: 'calc(50% + 0.5px)', top: '50%', translate: '-50% -50%' } },
  { name: 'Drama', src: genreDrama, col: 0, row: 2, img: { width: 131, height: 197, left: 'calc(50% - 0.5px)', top: 'calc(50% + 0.5px)', translate: '-50% -50%' } },
  { name: 'Animation', src: genreAnimation, col: 0, row: 3, img: { width: 130, height: 192, left: '50%', top: -49, translate: '-50% 0' } },
  { name: 'Travel', src: genreTravel, col: 0, row: 4, img: { width: 177, height: 262, left: 'calc(50% - 0.5px)', top: -4, translate: '-50% 0' } },
  { name: 'Romance', src: genreRomance, col: 1, row: 1, dim: 0.4, img: { width: 130, height: 192, left: '50%', top: 'calc(50% - 5px)', translate: '-50% -50%' } },
  { name: 'Action', src: genreAction, col: 1, row: 2, dim: 0.4, img: { width: 144, height: 192, left: 'calc(50% - 1px)', top: 'calc(50% + 22px)', translate: '-50% -50%' } },
  { name: 'Family', src: genreFamily, col: 1, row: 3, dim: 0.3, img: { width: 130, height: 193.18, left: '50%', top: 'calc(50% + 12.59px)', translate: '-50% -50%' } },
  { name: 'Short Films', src: genreShort, col: 1, row: 4, img: { width: 130, height: 130, left: '50%', top: '50%', translate: '-50% -50%' } },
]

export default function MediaPanel() {
  const [active, setActive] = useSharedState('mp.active', 2)
  const [section, setSection] = useSharedState('mp.section', 'Movie')
  const [view, setView] = useSharedState('mp.view', 'Scroll')
  const [genre, setGenre] = useSharedState('mp.genre', 'Travel')
  const [, setPlaying] = useSharedState<string | null>('mp.playing', null)
  const n = MOVIES.length
  const dragX = useSharedMotionValue('mp.dragX')
  const go = (d: number) => setActive((a) => (a + d + n) % n)

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const swipe = info.offset.x + info.velocity.x * 0.2
    if (swipe < -80) go(1)
    else if (swipe > 80) go(-1)
  }

  return (
    <>
      <img className="mp-ellipse" src={mediaEllipse} alt="" />

      <Tabs id="media-tabs" className="mp-tabs" options={['Movie', 'Music', 'Berlin Guide']} value={section} onChange={setSection} dark />

      <motion.div className="mp-view" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...softSpring, delay: 0.2 }}>
        <Segmented id="media-view" className="mp-seg" options={['Scroll', 'Lists']} value={view} onChange={setView} width={320} />
      </motion.div>

      {/* 카드 넘기기 — 끌거나, 옆 카드를 누르면 가운데로 */}
      <motion.div className="mp-carousel" drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.12} _dragX={dragX} style={{ x: dragX }} onDragEnd={onDragEnd}>
        {MOVIES.map((m, i) => {
          let off = i - active
          if (off > n / 2) off -= n
          if (off < -n / 2) off += n
          const slot = SLOT[Math.abs(off)]
          return (
            <motion.button
              key={m.title}
              type="button"
              className="mp-card"
              style={{ zIndex: slot.z }}
              initial={{ opacity: 0, x: Math.sign(off) * slot.x * 0.6, scale: slot.scale * 0.9 }}
              animate={{ x: Math.sign(off) * slot.x, scale: slot.scale, opacity: slot.opacity }}
              transition={{ ...softSpring, delay: 0 }}
              // 옆 카드는 가운데로, 가운데 카드는 재생
              onClick={() => (off === 0 ? setPlaying(m.title) : setActive(i))}
              aria-label={m.title}
            >
              <span className="mp-card__media">
                <img src={m.src} alt="" style={m.img} />
                <span className="mp-card__tint" style={{ background: m.tint }} />
                {m.poster && (
                  <span className="mp-card__poster" style={m.poster.style}>
                    <img src={m.poster.src} alt="" />
                    {m.poster.shade && <span style={{ background: m.poster.shade }} />}
                  </span>
                )}
              </span>
              <span className="mp-card__info" style={{ background: m.bar }}>
                <span className="mp-card__titles">
                  <span className="mp-card__title">{m.title}</span>
                  <span className="mp-card__year">{m.year}</span>
                </span>
                <span className="mp-card__time">{m.time}</span>
              </span>
              <motion.span className="mp-card__glow" animate={{ opacity: off === 0 ? 1 : 0 }} />
            </motion.button>
          )
        })}
      </motion.div>

      {/* 장르 타일 */}
      {GENRES.map((g, i) => {
        const on = g.name === genre
        return (
          <motion.button
            key={g.name}
            type="button"
            className="mp-genre"
            style={{ left: 2036 + g.col * 160, top: 101 + (g.row - 1) * 160 }}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: on ? 1 : 0.5, scale: 1 }}
            whileHover={{ opacity: 1 }}
            whileTap={{ scale: 0.94 }}
            transition={{ ...spring, delay: 0.1 + i * 0.03 }}
            onClick={() => setGenre(g.name)}
            aria-pressed={on}
          >
            <span className="mp-genre__img" style={g.img}>
              <img src={g.src} alt="" />
              <span style={{ background: `rgba(0, 0, 0, ${g.dim ?? 0.2})` }} />
            </span>
            <span className={`mp-genre__name ${g.name === 'Short Films' ? 'mp-genre__name--two' : ''}`}>{g.name === 'Short Films' ? <>Short<br />Films</> : g.name}</span>
            <span className="mp-genre__ring" />
          </motion.button>
        )
      })}
    </>
  )
}

// 피그마 "영화 ㅋㅋ" — 가운데 카드를 누르면 화면 전체로 재생(paris.mp4), 누르면 돌아옴
// 휘어진 화면에선 조각이 16개라, 영상은 한 조각만 틀고 나머지는 그 화면을 그대로 베껴 그림
let playingVideo: HTMLVideoElement | null = null

export function MoviePlayer({ onClose }: { onClose: () => void }) {
  const primary = usePrimaryCopy()
  return (
    <motion.div
      className="db-player"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        className="db-player__frame"
        initial={{ scale: 0.92, opacity: 0, filter: 'blur(12px)' }}
        animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
        exit={{ scale: 0.96, opacity: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
        {primary ? <ClipVideo /> : <ClipMirror />}
      </motion.div>
      <motion.p className="db-player__hint" initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 1, 0] }} transition={{ duration: 3.5, times: [0, 0.15, 0.7, 1], delay: 0.8 }}>
        Tap to return
      </motion.p>
    </motion.div>
  )
}

function ClipVideo() {
  const ref = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    playingVideo = ref.current
    return () => {
      playingVideo = null
    }
  }, [])
  return <video ref={ref} src={parisClip} poster={movieParis} autoPlay muted playsInline loop preload="auto" />
}

// 1665×834 칸에 object-fit: cover 처럼 맞춰 그림
const FRAME_W = 1665
const FRAME_H = 834

function ClipMirror() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const ctx = ref.current!.getContext('2d')!
    let raf = 0
    const draw = () => {
      const v = playingVideo
      if (v && v.readyState >= 2) {
        const s = Math.max(FRAME_W / v.videoWidth, FRAME_H / v.videoHeight)
        const w = v.videoWidth * s
        const h = v.videoHeight * s
        ctx.drawImage(v, (FRAME_W - w) / 2, (FRAME_H - h) / 2, w, h)
      }
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [])
  return <canvas ref={ref} width={FRAME_W} height={FRAME_H} style={{ background: `url(${movieParis}) center / cover` }} />
}
