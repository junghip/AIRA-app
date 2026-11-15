import { AnimatePresence, motion } from 'motion/react'
import berlin from '../assets/window/berlin.png'
import bgCrowd from '../assets/window/bg-crowd.png'
import bgLounge from '../assets/window/bg-lounge.png'
import bgTerminal from '../assets/window/bg-terminal.png'
import { smoothEase } from '../motion/transitions'
import type { MenuState, Scene } from './scenes'

// 창밖 풍경. 같은 터미널 사진을 쓰는 장면끼리는 사진은 그대로 두고 흐림·덮개만 바꿔서 끊김 없이 이어지게
type Place = 'terminal' | 'crowd' | 'lounge' | 'dark'

const placeOf = (s: Scene): Place => {
  if (s === 'gate') return 'crowd'
  if (s === 'arrivedCoffee') return 'lounge'
  if (s === 'bye') return 'dark'
  return 'terminal'
}

// 터미널 사진의 모습 — intro: 탑승 안내(살짝 흐림 + 하늘빛 안개), car: 대시보드(흐린 회색 유리), clear: 경로 패널을 열어 창밖이 또렷해짐
type Look = 'intro' | 'car' | 'clear'
const lookOf = (s: Scene, menu: MenuState): Look => {
  if (s === 'dashboard' || s === 'suggest' || s === 'route' || s === 'routeCoffee' || s === 'route47' || s === 'flight') {
    // 경로 패널을 열면 창밖 초점이 다시 맞음
    return menu === 'route' || menu === 'flight' ? 'clear' : 'car'
  }
  return 'intro'
}

const fade = { duration: 1.1, ease: smoothEase }

export default function Backdrop({ scene, menu }: { scene: Scene; menu: MenuState }) {
  const place = placeOf(scene)
  const look = lookOf(scene, menu)

  return (
    <div className="wn-layer wn-backdrop">
      <AnimatePresence initial={false}>
        {place === 'terminal' && (
          <motion.div key="terminal" className="wn-layer wn-bg-base" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={fade}>
            {/* 차에 타면 바깥이 더 깊게 흐려지며 UI에 초점이 맞춰짐 */}
            <motion.img
              className="wn-bg-terminal"
              src={bgTerminal}
              alt=""
              initial={false}
              animate={{ filter: look === 'car' ? 'blur(18px)' : look === 'clear' ? 'blur(0px)' : 'blur(10.45px)', scale: look === 'car' ? 1.04 : 1 }}
              transition={{ duration: 1.4, ease: smoothEase }}
            />
            <motion.div className="wn-layer wn-tint-intro" initial={false} animate={{ opacity: look === 'intro' ? 1 : 0 }} transition={fade} />
            <motion.div className="wn-layer wn-scrim" initial={false} animate={{ opacity: look === 'intro' ? 1 : 0 }} transition={fade} />
            <motion.div className="wn-layer wn-tint-car" initial={false} animate={{ opacity: look === 'intro' ? 0 : 1 }} transition={fade} />
          </motion.div>
        )}

        {place === 'crowd' && (
          // 게이트가 바뀌는 순간 — 사람 많은 홀이 살짝 다가오며 나타남
          <motion.div key="crowd" className="wn-layer" initial={{ opacity: 0, scale: 1.06 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.4, ease: smoothEase }}>
            <img className="wn-bg-crowd" src={bgCrowd} alt="" />
            <div className="wn-layer wn-tint-crowd" />
          </motion.div>
        )}

        {place === 'lounge' && (
          // 도착 — 카페 앞에 천천히 멈춰 서는 느낌
          <motion.div key="lounge" className="wn-layer" initial={{ opacity: 0, scale: 1.12 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 2.2, ease: smoothEase }}>
            <img className="wn-bg-lounge" src={bgLounge} alt="" />
            <div className="wn-layer wn-tint-lounge" />
          </motion.div>
        )}

        {place === 'dark' && <motion.div key="dark" className="wn-layer wn-bg-dark" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={fade} />}
      </AnimatePresence>

      {/* OUR FLIGHT 탭 — 창밖이 눈 내리는 베를린 거리로 바뀜 */}
      <AnimatePresence>
        {menu === 'flight' && (
          <motion.div key="berlin" className="wn-layer wn-berlin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.9, ease: smoothEase }}>
            <motion.img className="wn-berlin-img" src={berlin} alt="" initial={{ scale: 1.08 }} animate={{ scale: 1 }} transition={{ duration: 2.4, ease: smoothEase }} />
            <div className="wn-layer wn-tint-dim" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
