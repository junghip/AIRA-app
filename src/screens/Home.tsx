import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import type { PointerEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import airaLogo from '../assets/common/aira-logo.svg'
import carGlow from '../assets/home/car-glow.svg'
import carShadow from '../assets/home/car-shadow.svg'
import carSide from '../assets/home/car-side.png'
import arrowRight from '../assets/icons/arrow-right.svg'
import chevron from '../assets/icons/chevron.svg'
import bellIcon from '../assets/icons/notification-fill.svg'
import searchIcon from '../assets/icons/search-line.svg'
import ticketIcon from '../assets/icons/ticket-fill.svg'
import AmbientGradient from '../components/AmbientGradient'
import Icon from '../components/Icon'
import TabBar from '../components/TabBar'
import { riseIn, softSpring, spring, stagger } from '../motion/transitions'
import './Home.css'

const headline = [['Share', 'your', 'flight,'], ['AIRA', 'takes', 'you', 'there.']]

export default function Home() {
  const navigate = useNavigate()

  // 손가락/커서 위치에 따라 차가 살짝 따라 움직이는 패럴랙스
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const carX = useSpring(useTransform(px, [-1, 1], [-14, 14]), softSpring)
  const carY = useSpring(useTransform(py, [-1, 1], [-8, 8]), softSpring)
  const carTilt = useSpring(useTransform(px, [-1, 1], [-3, 3]), softSpring)

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    px.set(((e.clientX - rect.left) / rect.width) * 2 - 1)
    py.set(((e.clientY - rect.top) / rect.height) * 2 - 1)
  }

  const resetPointer = () => {
    px.set(0)
    py.set(0)
  }

  return (
    <motion.div
      className="home"
      variants={stagger()}
      initial="hidden"
      animate="show"
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPointer}
    >
      <AmbientGradient />
      <motion.header className="home__top" variants={riseIn}>
        <img src={airaLogo} width={120.206} height={22} alt="AIRA" />
        <div className="home__top-actions">
          <motion.button className="chip" whileTap={{ scale: 0.94 }} transition={spring}>
            Terminal 1
            <img src={chevron} width={18} height={18} alt="" className="chip__chevron" />
          </motion.button>
          <motion.button
            className="chip chip--icon"
            aria-label="Notifications"
            whileTap={{ scale: 0.9 }}
            transition={spring}
          >
            {/* 들어온 뒤 한 번 딸랑 */}
            <motion.span
              style={{ display: 'block', originY: 0.1 }}
              animate={{ rotate: [0, -16, 14, -10, 6, 0] }}
              transition={{ delay: 1.4, duration: 0.7, ease: 'easeInOut' }}
            >
              <Icon src={bellIcon} width={18} color="#fff" />
            </motion.span>
          </motion.button>
        </div>
      </motion.header>

      <motion.div className="home__headline" variants={stagger(0.06, 0)}>
        <motion.p className="home__greeting" variants={riseIn}>
          Hello, HAHA
        </motion.p>
        <h1 className="home__title">
          {headline.map((line, l) => (
            <span key={l} className="home__line">
              {line.map((word) => (
                <motion.span key={word} className="home__word" variants={riseIn}>
                  {word}{' '}
                </motion.span>
              ))}
            </span>
          ))}
        </h1>
      </motion.div>

      {/* 차 뒤 하얀 빛과 바닥 그림자 */}
      <motion.img
        className="home__car-glow"
        src={carGlow}
        alt=""
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: [1, 1.06, 1] }}
        transition={{ opacity: { duration: 1, delay: 0.3 }, scale: { duration: 5, repeat: Infinity, ease: 'easeInOut' } }}
      />
      <motion.img
        className="home__car-shadow"
        src={carShadow}
        alt=""
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.7 }}
      />
      <motion.div
        className="home__car"
        initial={{ x: 160, opacity: 0, filter: 'blur(8px)' }}
        animate={{ x: 0, opacity: 1, filter: 'blur(0px)' }}
        transition={{ ...softSpring, delay: 0.35 }}
      >
        <motion.div style={{ x: carX, y: carY, rotate: carTilt }}>
          {/* 둥실 떠 있는 idle 모션 + 탭하면 통통 */}
          <motion.img
            src={carSide}
            alt="AIRA vehicle"
            width={275}
            height={159}
            draggable={false}
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
            whileTap={{ scale: 0.94, rotate: -2 }}
          />
        </motion.div>
      </motion.div>

      <motion.form className="search" variants={riseIn} onSubmit={(e) => e.preventDefault()}>
        <Icon src={searchIcon} width={20} color="var(--color-sub)" />
        <span className="search__divider" />
        <input className="search__input" type="text" placeholder="Where are you flying to?" aria-label="Where are you flying to?" />
        <motion.button className="search__go" type="submit" aria-label="Search" whileTap={{ scale: 0.9 }} transition={spring}>
          <img src={arrowRight} width={16} height={13.414} alt="" />
        </motion.button>
      </motion.form>

      <motion.div className="home__actions" variants={riseIn}>
        <motion.button
          className="action-card"
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.95 }}
          transition={spring}
          onClick={() => navigate('/pass')}
          aria-label="Add my pass"
        >
          <Icon src={ticketIcon} width={20.19} height={20} color="var(--color-ink)" />
          <span className="action-card__label">
            Add
            <br />
            my pass
          </span>
        </motion.button>
        <motion.button className="action-card" whileHover={{ y: -3 }} whileTap={{ scale: 0.95 }} transition={spring}>
          <Icon src={searchIcon} width={20} color="var(--color-ink)" />
          <span className="action-card__label">
            Flight
            <br />
            number
          </span>
        </motion.button>
      </motion.div>

      <motion.div
        className="home__tab"
        initial={{ y: 120 }}
        animate={{ y: 0 }}
        transition={{ ...softSpring, delay: 0.55 }}
      >
        <TabBar />
      </motion.div>
    </motion.div>
  )
}
