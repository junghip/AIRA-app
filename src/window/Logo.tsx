import { AnimatePresence, motion } from 'motion/react'
import logo from '../assets/window/logo-big.svg'
import { smoothEase } from '../motion/transitions'
import type { Scene } from './scenes'

// AIRA 로고 하나가 장면 사이를 옮겨다님 — 웰컴의 큰 로고가 그대로 줄어들어 위쪽 작은 로고가 됨
const HERO = { left: 591.9, top: 411, width: 732.6, height: 134.1 }
const TOP = { left: 861, top: 133, width: 197.1, height: 36.4 }

const placeOf = (s: Scene) => {
  if (s === 'welcome' || s === 'bye') return 'hero'
  if (s === 'seat' || s === 'waiting' || s === 'starting' || s === 'gate' || s === 'arrivedCoffee' || s === 'arrivedGate') return 'top'
  return 'hidden'
}

const CAPTION: Partial<Record<Scene, string>> = {
  welcome: 'Welcome aboard AIRA',
  bye: 'See you on the way back',
}

export default function Logo({ scene, run }: { scene: Scene; run: number }) {
  const place = placeOf(scene)
  const box = place === 'hero' ? HERO : TOP
  const caption = CAPTION[scene]

  return (
    <>
      <motion.img
        key={`logo-${run}`}
        className="wn-logo"
        src={logo}
        alt="AIRA"
        // 처음엔 왼쪽부터 빛이 번지듯 그려짐
        initial={{ ...HERO, opacity: 0, clipPath: 'inset(0% 100% 0% 0%)', filter: 'blur(12px)' }}
        animate={{
          ...box,
          opacity: place === 'hidden' ? 0 : 1,
          clipPath: 'inset(0% 0% 0% 0%)',
          filter: place === 'hidden' ? 'blur(8px)' : 'blur(0px)',
        }}
        transition={{
          default: { duration: 1.3, ease: smoothEase },
          clipPath: { duration: 1.6, ease: smoothEase, delay: 0.2 },
          opacity: { duration: place === 'hidden' ? 0.5 : 0.9, ease: smoothEase, delay: place === 'hidden' ? 0 : 0.15 },
        }}
      />
      <AnimatePresence mode="wait">
        {caption && (
          <motion.p
            key={`${caption}-${run}`}
            className="wn-hero-caption"
            initial={{ opacity: 0, y: 24, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -12, filter: 'blur(10px)', transition: { duration: 0.45, ease: smoothEase } }}
            transition={{ duration: 1, ease: smoothEase, delay: scene === 'welcome' ? 0.9 : 0.6 }}
          >
            {caption}
          </motion.p>
        )}
      </AnimatePresence>
    </>
  )
}
