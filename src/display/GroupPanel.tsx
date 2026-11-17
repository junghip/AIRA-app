import { AnimatePresence, motion } from 'motion/react'
import checkBlue from '../assets/display/check-blue.svg'
import groupCoffee from '../assets/display/group-coffee.jpg'
import sendArrow from '../assets/display/send-arrow.svg'
import { softSpring, spring } from '../motion/transitions'
import { useSharedState } from './shared'
import './GroupPanel.css'

// 피그마 Section 8 "공항 콘텐츠"(602:4317) — 일행 보기 (공항 목록의 사람 버튼)
// 이 좌석의 주인은 Halle (웰컴: "Welcome, Halle.")

type Person = { name: string; full: string; seat: string; color: string; where: string; deciding?: boolean }

const PEOPLE: Person[] = [
  { name: 'Min', full: 'Min Cole', seat: 'Seat A1', color: '#b3c2d8', where: 'T1 Lounge · seated', deciding: true },
  { name: 'Halle', full: 'Halle Kim', seat: 'Seat A2', color: '#ccb1ae', where: 'T1 Lounge · seated', deciding: true },
  { name: 'Noel', full: 'Noel Gray', seat: 'Seat B1', color: '#95a6be', where: 'T1 Lounge' },
  { name: 'Eden', full: 'Eden Hall', seat: 'Seat B2', color: '#7b93b4', where: 'Duty free · 2 min away' },
]
const COLOR = Object.fromEntries(PEOPLE.map((p) => [p.name, p.color]))

type Msg = { from: string; time: string; text: string; wide?: boolean }
const THREAD: Msg[] = [
  { from: 'Noel', time: '12:40', text: 'Coffee before the long flight? It’s right on our way.', wide: true },
  { from: 'Eden', time: '12:40', text: 'Yes please, I’m in!' },
  { from: 'Halle', time: '12:41', text: 'I’ll stay in AIRA and rest. Bring me an americano?' },
]
const QUICK = ['On my way!', 'Get me a latte too, please', 'Meet you at Gate 16']

type Choice = 'join' | 'stay' | null

export default function GroupPanel() {
  const [choice, setChoice] = useSharedState<Choice>('gp.choice', null)
  const [sent, setSent] = useSharedState<string[]>('gp.sent', [])
  const thread: Msg[] = [...THREAD, ...sent.map((text) => ({ from: 'Halle', time: '12:42', text }))]
  // 이야기가 길어지면 오래된 것부터 위로 밀려 사라짐
  const shown = thread.slice(-4)

  const pill = (p: Person) => {
    if (p.name === 'Halle' && choice) return choice === 'join' ? 'Joining' : 'Staying'
    return p.deciding ? 'Deciding…' : null
  }

  return (
    <motion.div className="ds-layer gp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
      {/* 경유 제안 */}
      <motion.div className="gp-stop" initial={{ opacity: 0, y: -24 }} animate={{ opacity: 1, y: 0 }} transition={{ ...softSpring, delay: 0.05 }}>
        <img className="gp-stop__photo" src={groupCoffee} alt="" />
        <div className="gp-stop__text">
          <p className="gp-stop__meta">Noel  SUGGESTED A STOP · 12:40</p>
          <p className="gp-stop__title">
            <span>Lounge Coffee</span>
            <span>· Near Gate 14 · +5 min · Gate 16 at 14:05</span>
          </p>
        </div>
        <span className="gp-stop__spacer" />
        {(['join', 'stay'] as const).map((c) => (
          <motion.button
            key={c}
            type="button"
            className={`gp-opt ${choice === c ? 'gp-opt--on' : ''}`}
            aria-pressed={choice === c}
            onClick={() => setChoice(choice === c ? null : c)}
            whileTap={{ scale: 0.94 }}
          >
            {c === 'join' ? 'Join the stop' : 'Stay in AIRA'}
          </motion.button>
        ))}
      </motion.div>

      {/* 일행 4명 */}
      <div className="gp-people">
        {PEOPLE.map((p, i) => {
          const tag = pill(p)
          return (
            <motion.div
              key={p.name}
              className="gp-person"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...softSpring, delay: 0.12 + i * 0.06 }}
            >
              <span className="gp-avatar gp-avatar--lg" style={{ background: p.color }}>
                {p.name}
              </span>
              <div className="gp-person__info">
                <div className="gp-person__head">
                  <p className="gp-person__name">{p.full}</p>
                  <span className="gp-pill">{p.seat}</span>
                  <AnimatePresence mode="popLayout" initial={false}>
                    {tag && (
                      <motion.span
                        key={tag}
                        className={`gp-pill ${tag === 'Joining' || tag === 'Staying' ? 'gp-pill--me' : ''}`}
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.7 }}
                        transition={spring}
                      >
                        {tag}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                <p className="gp-person__where">{p.where}</p>
                <p className="gp-person__check">
                  <img src={checkBlue} alt="" />
                  Checked in
                </p>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* 일행 채팅 */}
      <motion.div className="gp-chat" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ ...softSpring, delay: 0.1 }}>
        <p className="gp-chat__title">GROUP CHAT</p>
        <div className="gp-thread">
          <AnimatePresence initial={false} mode="popLayout">
            {shown.map((m, i) => (
              <motion.div
                key={`${thread.length - shown.length + i}`}
                layout
                className="gp-msg"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={spring}
              >
                <span className="gp-avatar gp-avatar--sm" style={{ background: COLOR[m.from] }}>
                  {m.from}
                </span>
                <div className="gp-msg__body">
                  <p className="gp-msg__meta">
                    {m.from} · {m.time}
                  </p>
                  <p className={`gp-bubble ${m.wide ? 'gp-bubble--wide' : ''}`}>{m.text}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <div className="gp-quick">
          {QUICK.map((q) => (
            <motion.button key={q} type="button" className="gp-chip" onClick={() => setSent((s) => [...s, q])} whileTap={{ scale: 0.92 }}>
              {q}
            </motion.button>
          ))}
        </div>
        <div className="gp-composer">
          <p className="gp-input">Message the group…</p>
          <motion.button type="button" className="gp-send" aria-label="Send" whileTap={{ scale: 0.9 }}>
            <img src={sendArrow} alt="" />
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}
