import { LayoutGroup, motion } from 'motion/react'
import { useEffect, useMemo, useRef } from 'react'
import { DisplayScene, STAGE_H, STAGE_W, useFitScale } from './Display'
import { usePreloaded } from './preload'
import { tourEnabled } from './Tour'
import { SceneCopy } from './shared'
import './CurvedDisplay.css'

// 휘어진 의자 디스플레이 미리보기 (/display-curved)
// 화면을 세로 조각으로 잘라, 원통 안쪽에 붙은 것처럼 보이는 자리로 조각마다 옮기고 늘림.
// 조각마다 같은 화면이 하나씩 들어 있고, 상태는 shared.ts로 함께 씀.
// 3D 변형(rotateY)을 쓰면 모양은 정확하지만, 화면이 바뀔 때 브라우저가 조각을 다 그리기 전에 보여 줘서
// 조각 곳곳이 비어 보였음 → 원근 계산을 직접 해서 평면(2D) 변형만 씀.

const CURVE_DEG = 30 // 화면 반쪽이 휘는 각도 — 클수록 많이 휨
const SIDE_STRIPS = 12 // 한쪽 조각 수 (전체는 두 배) — 많을수록 이음새가 매끈하지만 무거워짐
const VIEW_DIST = STAGE_W * 1.2 // 보는 거리 — 가까울수록 가장자리가 더 커 보임
const OVERLAP = 3 // 이웃 조각과 겹치는 폭 (늘리고 줄인 뒤에도 틈이 안 보이게)
const FEATHER = `linear-gradient(90deg, transparent 0px, #000 ${OVERLAP * 2}px)`
const FLOOR = 220 // 화면 아래 바닥 빛 자리
const REVEAL_DELAY = 0.3 // 처음 켜질 때 왼쪽→오른쪽으로 쓸며 나타남 (초)
const REVEAL_TIME = 1.8

// 조각 i가 드러나는 시간 구간 — 전체로는 천천히 시작해 천천히 멈추는 곡선(사인)
const revealAt = (p: number) => REVEAL_DELAY + (REVEAL_TIME * Math.acos(1 - 2 * p)) / Math.PI

function useCylinder() {
  return useMemo(() => {
    const alpha = (CURVE_DEG * Math.PI) / 180
    const R = STAGE_W / 2 / alpha
    // 원통 위 각도 t가 보는 사람에게 얼마나 가까워 커 보이는지
    const near = (t: number) => VIEW_DIST / (VIEW_DIST - (R - R * Math.cos(t)))
    // 각도 t가 화면에 비치는 가로 위치
    const screenX = (t: number) => STAGE_W / 2 + R * Math.sin(t) * near(t)
    const grow = near(alpha)
    const boxW = R * Math.sin(alpha) * grow * 2 + 40
    const boxH = STAGE_H * grow + 40
    const py = 0.4 * (boxH + FLOOR) - (boxH - STAGE_H) / 2 // 보는 눈높이 (원통 기준)

    // 조각 경계: 이웃 조각끼리 커지는 정도가 똑같이 차이 나도록 나눔
    // → 많이 휘는 가장자리는 좁게, 거의 평평한 가운데는 넓게 (이음새의 어긋남이 어디서나 작음)
    const bounds: number[] = []
    for (let j = 0; j <= SIDE_STRIPS; j++) {
      const k = 1 + ((grow - 1) * j) / SIDE_STRIPS
      bounds.push(Math.acos(1 - (VIEW_DIST * (1 - 1 / k)) / R))
    }
    const thetas = [...bounds.slice(1).reverse().map((t) => -t), ...bounds]
    const toStage = (t: number) => STAGE_W / 2 + R * t // 각도 → 펼친 화면의 가로 위치

    const strips = thetas.slice(0, -1).map((ta, i) => {
      const tb = thetas[i + 1]
      const a = toStage(ta)
      const b = toStage(tb)
      const sx = (screenX(tb) - screenX(ta)) / (b - a)
      const k = near((ta + tb) / 2)
      const start = revealAt(a / STAGE_W)
      return {
        i,
        left: a - OVERLAP,
        width: b - a + OVERLAP * 2,
        // 조각 왼쪽 위 기준으로 가로로 옮기고, 눈높이 기준으로 세로로 늘림
        transform: `translate(${screenX(ta) - a - sx * OVERLAP + OVERLAP}px, 0px) scale(${sx}, ${k})`,
        origin: `0px ${py}px`,
        reveal: { delay: start, duration: revealAt(b / STAGE_W) - start, ease: 'linear' as const },
      }
    })
    return { boxW, boxH, strips, center: SIDE_STRIPS }
  }, [])
}

export default function CurvedDisplay() {
  const { boxW, boxH, strips, center } = useCylinder()
  const scale = useFitScale(boxW * 1.03, boxH + FLOOR)
  // 사진·영상을 다 받아 둔 뒤에 켜짐 (켜지는 쓸림 효과도 그때부터)
  const ready = usePreloaded()
  // 사진은 바로 그려지게 (브라우저가 큰 사진을 나중에 따로 풀어서 넣으면, 화면이 바뀔 때 사진 자리가 잠깐 비어 보임)
  const cylinder = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const root = cylinder.current
    if (!root) return
    const sync = () => root.querySelectorAll('img').forEach((img) => img.decoding !== 'sync' && (img.decoding = 'sync'))
    sync()
    const mo = new MutationObserver(sync)
    mo.observe(root, { childList: true, subtree: true })
    return () => mo.disconnect()
  }, [ready])
  if (!ready) return <div className="cv-viewport" />

  return (
    <div className={`cv-viewport ${tourEnabled() ? 'ds-no-cursor' : ''}`}>
      <div className="cv-room" style={{ width: boxW, height: boxH + FLOOR, transform: `translate(-50%, -50%) scale(${scale})` }}>
        {/* 바닥에 번지는 화면 빛 */}
        <motion.div
          className="cv-floor"
          style={{ top: boxH - 60, originX: 0 }}
          initial={{ opacity: 0, scaleX: 0.2 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: REVEAL_DELAY, duration: REVEAL_TIME + 0.4, ease: 'easeInOut' }}
        />

        <div ref={cylinder} className="cv-cylinder" style={{ left: (boxW - STAGE_W) / 2, top: (boxH - STAGE_H) / 2, width: STAGE_W, height: STAGE_H }}>
          {strips.map((s) => (
            // 이웃 조각과 조금씩 겹쳐서 이음새가 안 보이게
            <div
              key={s.i}
              className="cv-strip"
              style={{
                left: s.left,
                width: s.width,
                transform: s.transform,
                transformOrigin: s.origin,
                // 왼쪽 겹치는 부분은 서서히 나타나게 → 밑의 조각과 섞여서 이음새 선이 안 생김 (맨 왼쪽 조각은 그대로)
                ...(s.i > 0 && { maskImage: FEATHER, WebkitMaskImage: FEATHER }),
              }}
            >
              {/* 처음 켜질 때 조각마다 차례로 왼쪽부터 드러남 → 화면 전체가 한 번에 쓸리듯 나타남 */}
              <motion.div
                className="cv-reveal"
                initial={{ clipPath: 'inset(0 100% 0 0)', opacity: 0 }}
                animate={{ clipPath: 'inset(0 0% 0 0)', opacity: 1 }}
                // 차례가 오기 전엔 잘린 가장자리 1px도 안 보이게 완전히 투명
                transition={{ ...s.reveal, opacity: { delay: s.reveal.delay, duration: 0.05 } }}
              >
                <div className="ds-stage cv-screen" style={{ left: -s.left, top: 0, width: STAGE_W, height: STAGE_H }}>
                  <SceneCopy.Provider value={{ primary: s.i === center }}>
                    {/* layoutId 애니메이션이 조각끼리 섞이지 않게 조각마다 따로 묶음 */}
                    <LayoutGroup id={`strip-${s.i}`}>
                      <DisplayScene onboardingAutoplay />
                    </LayoutGroup>
                  </SceneCopy.Provider>
                  {/* 휜 면의 빛 — 가장자리는 살짝 밝고 가운데는 깊게 */}
                  <div className="cv-shade" />
                </div>
              </motion.div>
              {/* 쓸고 지나가는 빛의 앞머리 */}
              <motion.span
                className="cv-edge"
                initial={{ left: '0%', opacity: 0 }}
                animate={{ left: ['0%', '100%'], opacity: [0, 1, 1, 0] }}
                transition={{ ...s.reveal, opacity: { ...s.reveal, times: [0, 0.01, 0.8, 1] } }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
