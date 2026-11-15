import { AnimatePresence, motion } from 'motion/react'
import { useEffect, type CSSProperties } from 'react'
import backArrow from '../assets/display/back-arrow.svg'
import btnBag from '../assets/display/btn-bag.svg'
import btnDot from '../assets/display/btn-dot.svg'
import btnPeople from '../assets/display/btn-people.svg'
import carTop from '../assets/display/car-top.png'
import checkWhite from '../assets/display/check-white.svg'
import foodAngel from '../assets/display/food-angel.jpg'
import foodCoffee from '../assets/display/food-coffee.jpg'
import foodDunkin from '../assets/display/food-dunkin.jpg'
import foodSandwich from '../assets/display/food-sandwich.png'
import foodStarbucks from '../assets/display/food-starbucks.jpg'
import foodTea from '../assets/display/food-tea.jpg'
import mapDashed from '../assets/display/map-dashed.svg'
import mapRoute from '../assets/display/map-route-v2.svg'
import mapUnion from '../assets/display/map-union-v2.svg'
import menuAmericano from '../assets/display/menu-americano.png'
import menuBoston from '../assets/display/menu-boston.png'
import menuGlazed from '../assets/display/menu-glazed.png'
import menuMunchkin from '../assets/display/menu-munchkin.png'
import { smoothEase, softSpring, spring } from '../motion/transitions'
import { usePrimaryCopy, useSharedState } from './shared'
import Tabs from './Tabs'
import './AirportPanel.css'

// 피그마 "공항 콘텐츠" 세 장 (534:6638 목록 → 534:6730 상세+경유 확인 → 534:6819 경유 제안 후)
type MenuItem = { name: string; src: string; thumb: CSSProperties }
type Place = {
  id: string
  name: string
  kind: string
  gate: string
  extra: string
  src: string
  // 목록 카드 사진(280×285)과 상세 사진(280×432) 안의 크롭
  crop: CSSProperties
  detailCrop: CSSProperties
  shade?: number
  menu: MenuItem[]
}

// 메뉴 사진이 없는 가게는 가게 사진을 작게 잘라 씀
const photoMenu = (src: string, names: string[]): MenuItem[] =>
  names.map((name) => ({ name, src, thumb: { width: 54, height: 54, borderRadius: 10, objectFit: 'cover' } }))

const PLACES: Place[] = [
  {
    id: 'coffee',
    name: 'Lounge Coffee',
    kind: 'Cafe',
    gate: 'Near Gate 28 · 3F',
    extra: '+5min',
    src: foodCoffee,
    crop: { width: 309.916, height: 387.5, left: 0, top: -81 },
    detailCrop: { width: 362, height: 452, left: -18, top: 0 },
    menu: photoMenu(foodCoffee, ['Signature Latte', 'Americano', 'Flat White', 'Croissant']),
  },
  {
    id: 'bread',
    name: 'Bread & Brew',
    kind: 'Bakery',
    gate: 'Near Gate 28 · 3F',
    extra: '+7min',
    src: foodSandwich,
    crop: { width: 280, height: 373, left: 0, top: -88 },
    detailCrop: { width: 328, height: 437, left: -24, top: 0 },
    shade: 0.02,
    menu: photoMenu(foodSandwich, ['Club Sandwich', 'Americano', 'Croissant', 'Bagel']),
  },
  {
    id: 'tea',
    name: 'Tea House',
    kind: 'Tea & Dessert',
    gate: 'Near Gate 28 · 3F',
    extra: '+9min',
    src: foodTea,
    crop: { width: 326, height: 435, left: -31, top: -128 },
    detailCrop: { width: 362, height: 483, left: -41, top: -24 },
    menu: photoMenu(foodTea, ['Green Tea', 'Earl Grey', 'Macaron', 'Scone']),
  },
  {
    id: 'starbucks',
    name: 'Starbucks',
    kind: 'Cafe',
    gate: 'Near Gate 28 · 3F',
    extra: '+9min',
    src: foodStarbucks,
    crop: { width: 280, height: 373, left: 0, top: -37 },
    detailCrop: { width: 324, height: 459, left: -22, top: -14 },
    menu: photoMenu(foodStarbucks, ['Caffè Latte', 'Cold Brew', 'Muffin', 'Brownie']),
  },
  {
    id: 'dunkin',
    name: 'Dunkin',
    kind: 'Donuts & coffee',
    gate: 'Near Gate 15 · 3F',
    extra: '+14min',
    src: foodDunkin,
    crop: { width: 304, height: 405, left: -12, top: -89 },
    detailCrop: { width: 336, height: 447, left: -34, top: -8 },
    menu: [
      { name: 'Original Glazed', src: menuGlazed, thumb: { width: 54, height: 67 } },
      { name: 'Boston Kreme', src: menuBoston, thumb: { width: 54, height: 68 } },
      { name: 'Munchkin', src: menuMunchkin, thumb: { width: 52, height: 65 } },
      { name: 'Americano', src: menuAmericano, thumb: { width: 60, height: 60, marginRight: -5 } },
    ],
  },
  {
    id: 'angel',
    name: 'Angel-in-us',
    kind: 'Cafe',
    gate: 'Near Gate 48 · 3F',
    extra: '+19min',
    src: foodAngel,
    crop: { width: 280, height: 373, left: 0, top: -15 },
    detailCrop: { width: 324, height: 648, left: -22, top: -100 },
    menu: photoMenu(foodAngel, ['Café Latte', 'Vanilla Latte', 'Cheesecake', 'Waffle']),
  },
]

const CARD_STEP = 354 // 카드 324 + 간격 30
const TAB_OPTIONS = ['Cafe & Dessert', 'Dining', 'Shopping', 'Services', 'Experiences']
const STOP_OPTIONS = ['5 min', '8 min', '10 min']

export default function AirportPanel() {
  const [tab, setTab] = useSharedState('ap.tab', TAB_OPTIONS[0])
  const [openId, setOpenId] = useSharedState<string | null>('ap.open', null)
  const [, setSent] = useSharedState('ap.sent', false)
  const [, setPicked] = useSharedState<string[]>('ap.picked', [])
  const place = PLACES.find((p) => p.id === openId)
  const [, setToast] = useSharedState('ap.toast', false)
  const open = (id: string | null) => {
    setSent(false)
    setToast(false)
    // 가게마다 첫 메뉴 하나만 담긴 채로 시작
    const next = PLACES.find((p) => p.id === id)
    if (next) setPicked([next.menu[0].name])
    setOpenId(id)
  }

  return (
    <>
      <AnimatePresence mode="popLayout" initial={false}>
        {place ? <Detail key="detail" place={place} onClose={() => open(null)} /> : <List key="list" onOpen={open} />}
      </AnimatePresence>

      {/* 위쪽: 목록에선 카테고리 탭, 상세에선 뒤로 + 영업 안내 */}
      <AnimatePresence mode="popLayout" initial={false}>
        {place ? (
          <motion.div key="head-detail" className="ap-head" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.button
              type="button"
              className="ap-back"
              aria-label="Back"
              onClick={() => open(null)}
              initial={{ scale: 0.6, x: -20 }}
              animate={{ scale: 1, x: 0 }}
              whileTap={{ scale: 0.9 }}
              transition={spring}
            >
              <img src={backArrow} alt="" />
            </motion.button>
            <motion.p className="ap-open" initial={{ x: -30 }} animate={{ x: 0 }} transition={{ ...softSpring, delay: 0.05 }}>
              Open now · about 2 min wait
            </motion.p>
          </motion.div>
        ) : (
          <motion.div key="head-list" className="ap-head" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Tabs id="air-tabs" options={TAB_OPTIONS} value={tab} onChange={setTab} />
            <p className="ap-sort">Sorted by detour time from your route to Gate 16</p>
          </motion.div>
        )}
      </AnimatePresence>

      <StopToast />
    </>
  )
}

// 경유 제안을 보내면 위에서 내려오는 알림 — 4초 뒤 사라짐
function StopToast() {
  const [toast, setToast] = useSharedState('ap.toast', false)
  const [openId] = useSharedState<string | null>('ap.open', null)
  const [picked] = useSharedState<string[]>('ap.picked', [])
  const primary = usePrimaryCopy()
  const place = PLACES.find((p) => p.id === openId)

  useEffect(() => {
    if (!toast || !primary) return
    const t = setTimeout(() => setToast(false), 4000)
    return () => clearTimeout(t)
  }, [toast, primary, setToast])

  const items = `${picked.length} item${picked.length === 1 ? '' : 's'}`
  return (
    <AnimatePresence>
      {toast && place && (
        <motion.div
          key="toast"
          className="ap-toast"
          initial={{ y: -120, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -120, opacity: 0, scale: 0.95 }}
          transition={spring}
        >
          <motion.span className="ap-toast__icon" initial={{ scale: 0 }} animate={{ scale: [0, 1.25, 1] }} transition={{ delay: 0.25, duration: 0.5 }}>
            <img src={checkWhite} alt="" />
          </motion.span>
          <span className="ap-toast__text">
            <span>Stop Suggested</span>
            <span>Your order of {items} was sent · Gate 16 at 14:07</span>
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function List({ onOpen }: { onOpen: (id: string) => void }) {
  const [together, setTogether] = useSharedState('ap.together', false)
  return (
    <motion.div className="ds-layer ap-list" exit={{ opacity: 0, filter: 'blur(8px)' }} transition={{ duration: 0.4 }}>
      {PLACES.map((p, i) => (
        <motion.div
          key={p.id}
          className="ap-card"
          role="button"
          tabIndex={0}
          aria-label={p.name}
          style={{ left: 232 + i * CARD_STEP }}
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
          <p className="ap-card__name">{p.name}</p>
          <p className="ap-card__sub ap-card__sub--kind">{p.kind}</p>
          <p className="ap-card__sub ap-card__sub--gate">{p.gate}</p>
          <div className="ap-card__eta">On route {p.extra}</div>
        </motion.div>
      ))}

      {/* 저장한 가게 · 일행과 함께 보기 */}
      <motion.button type="button" className="ap-round ap-round--on" style={{ left: 232 }} aria-label="Saved places" whileTap={{ scale: 0.9 }} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ ...softSpring, delay: 0.45 }}>
        <img src={btnBag} alt="" />
      </motion.button>
      <motion.button
        type="button"
        className={`ap-round ${together ? 'ap-round--on' : ''}`}
        style={{ left: 342 }}
        aria-label="Share with passengers"
        aria-pressed={together}
        onClick={() => setTogether((v) => !v)}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...softSpring, delay: 0.51 }}
      >
        <img src={btnPeople} alt="" />
      </motion.button>
      <motion.img className="ap-round__dot" src={btnDot} alt="" initial={{ scale: 0 }} animate={{ scale: [0, 1.3, 1] }} transition={{ delay: 0.9, duration: 0.5 }} />
    </motion.div>
  )
}

function Detail({ place, onClose }: { place: Place; onClose: () => void }) {
  const [sent, setSent] = useSharedState('ap.sent', false)
  const [, setToast] = useSharedState('ap.toast', false)
  const [picked, setPicked] = useSharedState<string[]>('ap.picked', [])
  const [stop, setStop] = useSharedState('ap.stop', STOP_OPTIONS[0])
  const count = picked.length
  const toggle = (name: string) => setPicked((p) => (p.includes(name) ? p.filter((n) => n !== name) : [...p, name]))

  return (
    <motion.div className="ds-layer ap-detail" exit={{ opacity: 0, filter: 'blur(8px)' }} transition={{ duration: 0.4 }}>
      {/* 가게 + 미리 주문 */}
      <motion.section className="ap-shop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
        <motion.div className="ap-shop__img" layoutId={`ap-img-${place.id}`} transition={spring}>
          <img src={place.src} alt="" style={place.detailCrop} />
        </motion.div>
        <div className="ap-shop__body">
          <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ ...softSpring, delay: 0.15 }}>
            <div className="ap-shop__name">
              <p>{place.name}</p>
              <p>{place.kind}</p>
            </div>
            <p className="ap-shop__where">{place.gate} · 120m off your route</p>
          </motion.div>
          <div className="ap-order">
            <p>Order ahead</p>
            <AnimatePresence mode="wait" initial={false}>
              <motion.p key={count} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
                {count === 0 ? 'Tap to add items' : `${count} item${count > 1 ? 's' : ''} · ready when you arrive`}
              </motion.p>
            </AnimatePresence>
          </div>
          <div className="ap-menu">
            {place.menu.map((m, i) => {
              const on = picked.includes(m.name)
              return (
                <motion.button
                  key={m.name}
                  type="button"
                  className={`ap-menu__row ${on ? 'ap-menu__row--on' : ''}`}
                  aria-pressed={on}
                  onClick={() => toggle(m.name)}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ ...softSpring, delay: 0.25 + i * 0.07 }}
                >
                  <img className="ap-menu__thumb" src={m.src} alt="" style={m.thumb} />
                  <p>{m.name}</p>
                  <span className="ap-check">
                    <AnimatePresence>
                      {on && (
                        <motion.span key="on" className="ap-check__on" initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.4, opacity: 0 }} transition={spring}>
                          <img src={checkWhite} alt="" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </span>
                </motion.button>
              )
            })}
          </div>
        </div>
      </motion.section>

      {/* 경로 지도 */}
      <motion.section className="ap-map" initial={{ opacity: 0, x: 80 }} animate={{ opacity: 1, x: 0 }} transition={{ ...softSpring, delay: 0.1 }}>
        <div className="ap-map__union">
          <img src={mapUnion} alt="" />
        </div>
        <div className="ap-map__dashed">
          <img src={mapDashed} alt="" />
        </div>
        {/* 파란 경로가 차에서부터 가게 쪽으로 그려짐 */}
        <motion.div
          className="ap-map__route"
          initial={{ clipPath: 'inset(0 100% 0 0)' }}
          animate={{ clipPath: 'inset(0 0% 0 0)' }}
          transition={{ duration: 1.6, delay: 0.4, ease: smoothEase }}
        >
          <img src={mapRoute} alt="" />
        </motion.div>

        <div className="ap-map__car">
          <motion.div initial={{ x: -60, y: 30, opacity: 0 }} animate={{ x: 0, y: 0, opacity: 1 }} transition={{ ...softSpring, delay: 0.3 }}>
            <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}>
              <img src={carTop} alt="" />
            </motion.div>
          </motion.div>
        </div>

        <div className="ap-map__stats">
          {[
            [place.extra, 'Added time'],
            ['14:00', 'Arrive at Gate 24'],
            ['13min', 'Before boaring'],
          ].map(([v, k], i) => (
            <motion.div key={k} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...softSpring, delay: 0.3 + i * 0.07 }}>
              <p>{v}</p>
              <p>{k}</p>
            </motion.div>
          ))}
        </div>

        <motion.p className="ap-safe" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...spring, delay: 0.6 }}>
          Safe for Boarding
        </motion.p>

        <motion.div className="ap-chip" style={{ left: 196, top: 196 }} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ ...spring, delay: 0.5 }}>
          NOW
        </motion.div>
        <motion.div className="ap-chip" style={{ left: 689, top: 51 }} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ ...spring, delay: 1.5 }}>
          <motion.span
            className="ap-chip__pulse"
            animate={{ scale: [1, 1.35], opacity: [0.6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut', delay: 1.8 }}
          />
          {place.name}
        </motion.div>

        {/* 경유 확인 — 제안하면 내려가고 지도만 남음 */}
        <AnimatePresence>
          {!sent && (
            <motion.div
              key="confirm"
              className="ap-confirm"
              initial={{ y: 160, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 160, opacity: 0 }}
              transition={{ ...softSpring, delay: 0.2 }}
            >
              <div className="ap-confirm__text">
                <p>Stop at {place.name} on the way?</p>
                <div className="ap-confirm__len">
                  <span>Stop for</span>
                  {STOP_OPTIONS.map((o) => (
                    <button key={o} type="button" className="ap-len" aria-pressed={o === stop} onClick={() => setStop(o)}>
                      {o === stop && <motion.span layoutId="ap-len-thumb" className="ap-len__thumb" transition={spring} />}
                      <span className="ap-len__text">{o}</span>
                    </button>
                  ))}
                </div>
              </div>
              <motion.button type="button" className="ap-btn ap-btn--ghost" onClick={onClose} whileTap={{ scale: 0.95 }}>
                Cancel
              </motion.button>
              <motion.button type="button" className="ap-btn ap-btn--main" onClick={() => {
                  setSent(true)
                  setToast(true)
                }} whileTap={{ scale: 0.95 }}>
                Suggest a Stop
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>
    </motion.div>
  )
}
