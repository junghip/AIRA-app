import { AnimatePresence, motion } from 'motion/react'
import bgCrowd from '../assets/window/bg-crowd.png'
import bgLounge from '../assets/window/bg-lounge.png'
import bgTerminal from '../assets/window/bg-terminal.png'
import berlinSnow from '../assets/window/berlin-snow.mp4'
import { smoothEase } from '../motion/transitions'
import type { MenuTab, Scene } from './scenes'

// 창밖 풍경. 같은 사진을 쓰는 장면끼리는 사진은 그대로 두고 위에 덮인 색만 바꿔서 끊김 없이 이어지게
type Place = 'terminal' | 'crowd' | 'lounge' | 'dark'

const placeOf = (s: Scene): Place => {
  if (s === 'gate' || s === 'route47') return 'crowd'
  if (s === 'arrivedCoffee' || s === 'arrivedGate') return 'lounge'
  if (s === 'bye') return 'dark'
  return 'terminal'
}

// 터미널 사진 위 덮개 — 웰컴류: 하늘색 그라데이션 80% / 대시보드: 흰 40% / 메뉴·추천: 검정 30%
type Tint = 'haze' | 'light' | 'dim'
const tintOf = (s: Scene, menu: MenuTab | null): Tint => {
  if (s === 'dashboard') return menu ? 'dim' : 'light'
  if (s === 'suggest' || s === 'route') return 'dim'
  return 'haze'
}

const fade = { duration: 1.1, ease: smoothEase }

export default function Backdrop({ scene, menu }: { scene: Scene; menu: MenuTab | null }) {
  const place = placeOf(scene)
  const tint = tintOf(scene, menu)

  return (
    <div className="wn-layer wn-backdrop">
      <AnimatePresence initial={false}>
        {place === 'terminal' && (
          <motion.div key="terminal" className="wn-layer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={fade}>
            <img className="wn-bg-terminal" src={bgTerminal} alt="" />
            <motion.div className="wn-layer wn-tint-haze" animate={{ opacity: tint === 'haze' ? 1 : 0 }} transition={fade} />
            <motion.div className="wn-layer wn-tint-light" animate={{ opacity: tint === 'light' ? 1 : 0 }} transition={fade} />
            <motion.div className="wn-layer wn-tint-dim" animate={{ opacity: tint === 'dim' ? 1 : 0 }} transition={fade} />
          </motion.div>
        )}

        {place === 'crowd' && (
          // 게이트가 바뀌는 순간 — 사람 많은 홀이 살짝 다가오며 나타남
          <motion.div
            key="crowd"
            className="wn-layer"
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4, ease: smoothEase }}
          >
            <img className="wn-bg-crowd" src={bgCrowd} alt="" />
            <div className="wn-layer wn-tint-dim" />
          </motion.div>
        )}

        {place === 'lounge' && (
          // 도착 — 카페 앞에 천천히 멈춰 서는 느낌
          <motion.div
            key="lounge"
            className="wn-layer"
            initial={{ opacity: 0, scale: 1.12 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.2, ease: smoothEase }}
          >
            <img className="wn-bg-lounge" src={bgLounge} alt="" />
            <div className="wn-layer wn-tint-arrive" />
          </motion.div>
        )}

        {place === 'dark' && (
          <motion.div key="dark" className="wn-layer wn-bg-dark" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={fade} />
        )}
      </AnimatePresence>

      {/* OUR FLIGHT 탭 — 창밖이 눈 내리는 베를린으로 바뀜 (피그마 영상 채우기) */}
      <AnimatePresence>
        {menu === 'flight' && (
          <motion.div key="berlin" className="wn-layer wn-berlin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.9, ease: smoothEase }}>
            <div className="wn-layer wn-tint-dim" />
            <motion.video
              className="wn-berlin-video"
              src={berlinSnow}
              autoPlay
              muted
              loop
              playsInline
              initial={{ scale: 1.08 }}
              animate={{ scale: 1 }}
              transition={{ duration: 2.4, ease: smoothEase }}
            />
            <div className="wn-layer wn-berlin-shade" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
