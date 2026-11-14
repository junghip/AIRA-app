import { motion, type PanInfo } from 'motion/react'
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
import movieRoadtrip from '../assets/display/movie-roadtrip.jpg'
import movieVacation from '../assets/display/movie-vacation.jpg'
import { softSpring, spring } from '../motion/transitions'
import Segmented from './Segmented'
import { useSharedMotionValue, useSharedState } from './shared'
import Tabs from './Tabs'
import './MediaPanel.css'

// 피그마 "홈 - 기본 메뉴"(미디어) — 가운데 474×538 카드, 양옆은 같은 카드를 줄여서 겹침
type Movie = { title: string; year: string; time: string; src: string; img: React.CSSProperties }

const MOVIES: Movie[] = [
  { title: 'The Journey', year: '2014', time: '1hr 36min', src: movieJourney, img: { width: '100%', height: '124.78%', left: 0, top: '-23.15%' } },
  { title: 'Tanya & Tom’s Vacation', year: '2004', time: '1hr 36min', src: movieVacation, img: { width: '102.13%', height: '125.48%', left: '-1.15%', top: '-6.93%' } },
  { title: 'EN MODE AVION', year: '2020', time: '1hr 36min', src: movieAvion, img: { width: '100%', height: '100%', left: 0, top: 0, objectFit: 'cover', objectPosition: 'bottom' } },
  { title: 'The Road Trip', year: '2004', time: '2hr 10min', src: movieRoadtrip, img: { width: '100%', height: '132.39%', left: '0.11%', top: '-16.17%' } },
  { title: 'The Art of Travel', year: '2014', time: '1hr 56min', src: movieArt, img: { width: '100%', height: '145.62%', left: 0, top: '-15.69%' } },
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
              onClick={() => off !== 0 && setActive(i)}
              aria-label={m.title}
            >
              <span className="mp-card__media">
                <img src={m.src} alt="" style={m.img} />
                <span className="mp-card__tint" />
              </span>
              <span className="mp-card__info">
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
