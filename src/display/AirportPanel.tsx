import { AnimatePresence, motion } from 'motion/react'
import { type CSSProperties } from 'react'
import backArrow from '../assets/display/back-arrow.svg'
import carMap from '../assets/display/car-map.png'
import foodCoffee from '../assets/display/food-coffee.jpg'
import foodSandwich from '../assets/display/food-sandwich.png'
import foodTea from '../assets/display/food-tea.jpg'
import mapDashed from '../assets/display/map-dashed.svg'
import mapRouteBlue from '../assets/display/map-route-blue.svg'
import mapUnion from '../assets/display/map-union.svg'
import { smoothEase, softSpring, spring } from '../motion/transitions'
import { useSharedMotionValue, useSharedState } from './shared'
import Tabs from './Tabs'
import './AirportPanel.css'

// 피그마 "공항 콘텐츠" 두 장 — 가게 목록 → 가게를 누르면 메뉴 + 경로 지도
type Place = {
  id: string
  name: string
  kind: string
  line: string
  extra: string
  src: string
  // 목록 카드(280×285)와 상세(280×436) 안에서의 이미지 크롭
  crop: CSSProperties
  detailCrop: CSSProperties
  shade?: number
  menu: string[]
}

const TEA = {
  name: 'Tea House',
  kind: 'Tea & dessert',
  line: 'Americano · Croissant',
  extra: '+9min',
  src: foodTea,
  crop: { width: 326, height: 435, left: -31, top: -128 },
  detailCrop: { width: 362, height: 483, left: -41, top: -24 },
  menu: ['Green Tea', 'Earl Grey', 'Macaron', 'Scone'],
}

const PLACES: Place[] = [
  {
    id: 'coffee',
    name: 'Lounge Coffee',
    kind: 'Cafe',
    line: 'Signature Latte',
    extra: '+5min',
    src: foodCoffee,
    crop: { width: 309.916, height: 387.5, left: 0, top: -81 },
    detailCrop: { width: 362, height: 452, left: -18, top: 0 },
    menu: ['Signature Latte', 'Americano', 'Croissant', 'Croissant'],
  },
  {
    id: 'bread',
    name: 'Bread & Brew',
    kind: 'Bakery',
    line: 'Americano · Croissant',
    extra: '+7min',
    src: foodSandwich,
    crop: { width: 280, height: 373, left: 0, top: -88 },
    detailCrop: { width: 328, height: 437, left: -24, top: 0 },
    shade: 0.02,
    menu: ['Americano', 'Croissant', 'Club Sandwich', 'Bagel'],
  },
  ...[1, 2, 3, 4, 5].map((n) => ({ ...TEA, id: `tea-${n}` })),
]

const CARD_STEP = 354 // 카드 324 + 간격 30
const LIST_W = PLACES.length * CARD_STEP - 30
const LIST_VISIBLE = 2388 - 232 - 50

const TAB_OPTIONS = ['Cafe & Dessert', 'Dining', 'Shopping', 'Services', 'Experiences']

export default function AirportPanel() {
  const [tab, setTab] = useSharedState('ap.tab', TAB_OPTIONS[0])
  const [openId, setOpenId] = useSharedState<string | null>('ap.open', null)
  const place = PLACES.find((p) => p.id === openId)

  return (
    <>
      {/* 목록 / 상세 */}
      <AnimatePresence mode="popLayout" initial={false}>
        {place ? <Detail key="detail" place={place} /> : <List key="list" onOpen={setOpenId} />}
      </AnimatePresence>

      {/* 레일 옆으로 밀려 들어간 카드를 가리는 띠 */}
      <motion.div className="ap-mask" animate={{ width: place ? 202 : 221 }} />

      <AnimatePresence>
        {place && (
          <motion.button
            key="back"
            type="button"
            className="ap-back"
            aria-label="Back"
            onClick={() => setOpenId(null)}
            initial={{ opacity: 0, scale: 0.6, x: -20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.6, x: -20 }}
            whileTap={{ scale: 0.9 }}
            transition={spring}
          >
            <img src={backArrow} alt="" />
          </motion.button>
        )}
      </AnimatePresence>

      <motion.div className="ap-tabs" animate={{ x: place ? 89 : 0 }} transition={spring}>
        <Tabs id="air-tabs" options={TAB_OPTIONS} value={tab} onChange={setTab} />
      </motion.div>
    </>
  )
}

function List({ onOpen }: { onOpen: (id: string) => void }) {
  // 끄는 위치를 모든 조각이 같이 씀
  const trackX = useSharedMotionValue('ap.trackX')
  return (
    <motion.div className="ap-list" exit={{ opacity: 0, filter: 'blur(8px)' }} transition={{ duration: 0.4 }}>
      <motion.div className="ap-track" drag="x" dragConstraints={{ left: -(LIST_W - LIST_VISIBLE), right: 0 }} dragElastic={0.1} _dragX={trackX} style={{ width: LIST_W, x: trackX }}>
        {PLACES.map((p, i) => (
          <motion.div
            key={p.id}
            className="ap-card"
            role="button"
            tabIndex={0}
            aria-label={p.name}
            style={{ left: i * CARD_STEP }}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...softSpring, delay: 0.08 + i * 0.06 }}
            whileHover={{ y: -6 }}
            whileTap={{ scale: 0.97 }}
            onTap={() => onOpen(p.id)}
          >
            <motion.div className="ap-card__img" layoutId={`ap-img-${p.id}`} transition={spring}>
              <img src={p.src} alt="" style={p.crop} />
              {p.shade && <span style={{ background: `rgba(0, 0, 0, ${p.shade})` }} />}
            </motion.div>
            <div className="ap-card__name">
              <p>{p.name}</p>
              <p>{p.kind}</p>
            </div>
            <p className="ap-card__line">{p.line}</p>
            <p className="ap-card__line">Near Gate 28 · 3F</p>
            <div className="ap-card__eta">On route {p.extra}</div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
}

function Detail({ place }: { place: Place }) {
  const [sent, setSent] = useSharedState('ap.sent', false)

  return (
    <motion.div className="ds-layer ap-detail" exit={{ opacity: 0, filter: 'blur(8px)' }} transition={{ duration: 0.4 }}>
      {/* 가게 카드 */}
      <motion.section className="ap-shop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
        <motion.div className="ap-shop__img" layoutId={`ap-img-${place.id}`} transition={spring}>
          <img src={place.src} alt="" style={place.detailCrop} />
        </motion.div>
        <div className="ap-shop__body">
          <motion.div className="ap-shop__info" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ ...softSpring, delay: 0.15 }}>
            <div className="ap-shop__name">
              <p>{place.name}</p>
              <p>{place.kind}</p>
            </div>
            <p>Near Gate 28 · 3F</p>
            <p>~3min wait</p>
          </motion.div>
          <div className="ap-menu">
            {place.menu.map((m, i) => (
              <motion.div
                key={i}
                className="ap-menu__row"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...softSpring, delay: 0.25 + i * 0.07 }}
              >
                <div className="ap-menu__thumb">
                  <img src={place.src} alt="" />
                </div>
                <p>{m}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* 경로 지도 */}
      <motion.section
        className="ap-map"
        initial={{ opacity: 0, x: 80 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ ...softSpring, delay: 0.1 }}
      >
        <div className="ap-map__union">
          <img src={mapUnion} alt="" />
        </div>
        <div className="ap-map__dashed">
          <img src={mapDashed} alt="" />
        </div>

        <div className="ap-map__stats">
          <div>
            <p>{place.extra}</p>
            <p>Added time</p>
          </div>
          <div>
            <p>14:00</p>
            <p>Arrive at Gate 24</p>
          </div>
        </div>

        {/* 파란 경로가 차에서부터 가게 쪽으로 그려짐 */}
        <motion.div
          className="ap-map__route"
          initial={{ clipPath: 'inset(0 100% 0 0)' }}
          animate={{ clipPath: 'inset(0 0% 0 0)' }}
          transition={{ duration: 1.6, delay: 0.4, ease: smoothEase }}
        >
          <img src={mapRouteBlue} alt="" />
        </motion.div>

        <div className="ap-map__car">
          <motion.img
            src={carMap}
            alt=""
            initial={{ x: -60, y: 30, opacity: 0 }}
            animate={{ x: 0, y: [0, -3, 0], opacity: 1 }}
            transition={{ x: { ...softSpring, delay: 0.3 }, opacity: { delay: 0.3 }, y: { duration: 2.8, repeat: Infinity, ease: 'easeInOut' } }}
          />
        </div>

        <motion.div className="ap-chip" style={{ left: 60, top: 253 }} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ ...spring, delay: 0.5 }}>
          NOW
        </motion.div>
        <motion.div className="ap-chip" style={{ left: 560, top: 45 }} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ ...spring, delay: 1.5 }}>
          <motion.span
            className="ap-chip__pulse"
            animate={{ scale: [1, 1.35], opacity: [0.6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut', delay: 1.8 }}
          />
          {place.name}
        </motion.div>

        <motion.button
          type="button"
          className="ds-pill-on ap-suggest"
          onClick={() => setSent((v) => !v)}
          whileTap={{ scale: 0.96 }}
          animate={sent ? { boxShadow: '0 0 36px rgba(103, 200, 245, 0.9)' } : { boxShadow: '0 0 20px rgba(130, 153, 185, 0.8)' }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span key={String(sent)} className="ap-suggest__text" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
              <span>{sent ? 'Stop suggested ✓' : 'Suggest a stop'}</span>
              <span>{sent ? 'Shared to share screens' : 'Send to share screens'}</span>
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </motion.section>
    </motion.div>
  )
}
