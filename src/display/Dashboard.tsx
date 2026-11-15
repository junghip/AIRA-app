import { AnimatePresence, motion } from 'motion/react'
import airNavHome from '../assets/display/air-nav-home.svg'
import airNavFlight from '../assets/display/air-nav-flight.svg'
import clockSep from '../assets/display/clock-sep.svg'
import clockSepHome from '../assets/display/clock-sep-v2.svg'
import mediaNavFlight from '../assets/display/media-nav-flight.svg'
import mediaNavHome from '../assets/display/media-nav-home.svg'
import mediaNavPlay from '../assets/display/media-nav-play.svg'
import navFlight from '../assets/display/nav-flight.svg'
import navHome from '../assets/display/nav-home.svg'
import navPlay from '../assets/display/nav-play.svg'
import navFlightHome from '../assets/display/nav-flight-v2.svg'
import navPlayHome from '../assets/display/nav-play-v2.svg'
import { smoothEase, spring } from '../motion/transitions'
import BoardingPass, { PASS_H, PASS_W } from '../screens/pass/BoardingPass'
import AirportPanel from './AirportPanel'
import HomePanel from './HomePanel'
import MediaPanel, { MoviePlayer } from './MediaPanel'
import { useSharedState } from './shared'
import './Dashboard.css'

export type Tab = 'home' | 'media' | 'airport'

// 아이콘마다 [선택됨(남색), 홈에서 꺼짐, 공항에서 꺼짐, 미디어(어두운 배경)에서 꺼짐] — 피그마 화면의 아이콘 그대로
const NAV: { id: Tab; label: string; on: string; offHome: string; offLight: string; offDark: string }[] = [
  { id: 'home', label: 'Home', on: navHome, offHome: navHome, offLight: airNavHome, offDark: mediaNavHome },
  { id: 'media', label: 'Media', on: mediaNavPlay, offHome: navPlayHome, offLight: navPlay, offDark: navPlay },
  { id: 'airport', label: 'Airport', on: airNavFlight, offHome: navFlightHome, offLight: navFlight, offDark: mediaNavFlight },
]

export default function Dashboard({ onRestart }: { onRestart: () => void }) {
  const [tab, setTab] = useSharedState<Tab>('db.tab', 'home')
  const [passOpen, setPassOpen] = useSharedState('db.pass', false)
  const [resting, setResting] = useSharedState('db.rest', false)
  const [playing, setPlaying] = useSharedState<string | null>('mp.playing', null)
  const dark = tab === 'media'
  const home = tab === 'home'

  return (
    <div className="db">
      {/* 배경: 미디어는 어둡게, 공항 콘텐츠는 흰빛 20% 한 겹 */}
      <motion.div className="db-bg db-bg--dark" animate={{ opacity: dark ? 1 : 0 }} transition={{ duration: 0.7, ease: smoothEase }} />
      <motion.div className="db-bg db-bg--haze" animate={{ opacity: tab === 'airport' ? 1 : 0 }} transition={{ duration: 0.7 }} />

      <AnimatePresence mode="popLayout">
        <motion.div
          key={tab}
          className="ds-layer"
          initial={{ opacity: 0, x: 40, filter: 'blur(8px)' }}
          animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, x: -40, filter: 'blur(8px)' }}
          transition={{ duration: 0.55, ease: smoothEase }}
        >
          {tab === 'home' && <HomePanel onShowPass={() => setPassOpen(true)} onRest={() => setResting(true)} />}
          {tab === 'media' && <MediaPanel />}
          {tab === 'airport' && <AirportPanel />}
        </motion.div>
      </AnimatePresence>

      {/* 왼쪽 레일 */}
      <motion.nav
        className={`db-rail ${dark ? 'db-rail--dark' : ''} ${home ? 'db-rail--home' : ''}`}
        initial={{ x: -180, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ ...spring, delay: 0.15 }}
      >
        {NAV.map((n) => {
          const active = n.id === tab
          return (
            <motion.button
              key={n.id}
              type="button"
              className="db-rail__btn"
              aria-label={n.label}
              aria-pressed={active}
              onClick={() => setTab(n.id)}
              whileTap={{ scale: 0.94 }}
            >
              {active && <motion.span layoutId="rail-thumb" className="db-rail__thumb" transition={spring} />}
              <span className="db-rail__icon">
                <motion.img src={n.on} alt="" animate={{ opacity: active ? 1 : 0 }} />
                <motion.img src={n.offHome} alt="" animate={{ opacity: !active && home ? 1 : 0 }} />
                <motion.img src={n.offLight} alt="" animate={{ opacity: !active && tab === 'airport' ? 1 : 0 }} />
                <motion.img src={n.offDark} alt="" animate={{ opacity: !active && dark ? 1 : 0 }} />
              </span>
            </motion.button>
          )
        })}
      </motion.nav>

      {/* 아래 시계 (미디어 화면엔 없음) */}
      <AnimatePresence>
        {!dark && (
          <motion.div
            className={`db-clock ${home ? 'db-clock--home' : ''}`}
            onDoubleClick={onRestart}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ ...spring, delay: 0.25 }}
          >
            <span className="db-clock__date">Thu, Dec 24 </span>
            <img className="db-clock__sep" src={home ? clockSepHome : clockSep} alt="" />
            <span className="db-clock__time">
              12<motion.span animate={{ opacity: [1, 0.25, 1] }} transition={{ duration: 2, repeat: Infinity }}>:</motion.span>40
            </span>
            <img className="db-clock__sep" src={home ? clockSepHome : clockSep} alt="" />
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={tab}
                className="db-clock__extra"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {tab === 'airport' ? (
                  'Boarding in 48min'
                ) : (
                  <>
                    <span>4°</span>
                    <span>Rainy</span>
                  </>
                )}
              </motion.span>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 영화 재생 — 레일까지 덮는 전체 화면 */}
      <AnimatePresence>{playing && <MoviePlayer onClose={() => setPlaying(null)} />}</AnimatePresence>

      {/* View boarding pass — 탑승권이 아래에서 떠오름 */}
      <AnimatePresence>
        {passOpen && (
          <motion.div
            className="db-overlay"
            onClick={() => setPassOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <motion.div
              className="db-overlay__pass"
              style={{ width: PASS_W, height: PASS_H }}
              initial={{ y: 500, scale: 1.6, rotate: -6 }}
              animate={{ y: 0, scale: 2.1, rotate: 0 }}
              exit={{ y: 500, scale: 1.6, rotate: 6 }}
              transition={{ type: 'spring', stiffness: 160, damping: 20 }}
            >
              <BoardingPass />
            </motion.div>
            <p className="db-overlay__hint">Tap anywhere to close</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 휴식 모드 — 화면이 천천히 어두워지고, 누르면 다시 켜짐 */}
      <AnimatePresence>
        {resting && (
          <motion.div
            className="db-rest"
            onClick={() => setResting(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: smoothEase }}
          >
            <motion.p animate={{ opacity: [0.35, 0.8, 0.35] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
              Rest mode · We’ll wake you before boarding
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
