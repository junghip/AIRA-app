import { LayoutGroup } from 'motion/react'
import { useMemo } from 'react'
import { DisplayScene, STAGE_H, STAGE_W, useFitScale } from './Display'
import { SceneCopy } from './shared'
import './CurvedDisplay.css'

// 휘어진 의자 디스플레이 미리보기 (/display-curved)
// 화면을 세로 조각으로 잘라 원통 안쪽에 3D로 붙임 → GPU가 그려서 부드럽고, 클릭 위치도 브라우저가 정확히 맞춰 줌.
// 조각마다 같은 화면이 하나씩 들어 있고, 상태는 shared.ts로 함께 씀.

const CURVE_DEG = 30 // 화면 반쪽이 휘는 각도 — 클수록 많이 휨
const STRIPS = 16 // 조각 수 — 많을수록 매끈하지만 무거워짐
const VIEW_DIST = STAGE_W * 1.2 // 보는 거리 — 가까울수록 가장자리가 더 커 보임
const FLOOR = 220 // 화면 아래 바닥 빛 자리

function useCylinder() {
  return useMemo(() => {
    const alpha = (CURVE_DEG * Math.PI) / 180
    const R = STAGE_W / 2 / alpha
    const step = (alpha * 2) / STRIPS
    const w = STAGE_W / STRIPS
    // 가장자리가 가까워져 커 보이는 만큼 전체 크기를 넉넉히
    const z = R - R * Math.cos(alpha)
    const grow = VIEW_DIST / (VIEW_DIST - z)
    const boxW = R * Math.sin(alpha) * grow * 2 + 40
    const boxH = STAGE_H * grow + 40
    const strips = Array.from({ length: STRIPS }, (_, i) => {
      const theta = (i + 0.5 - STRIPS / 2) * step
      return { i, transform: `translateZ(${R}px) rotateY(${-theta}rad) translateZ(${-R}px)` }
    })
    return { w, boxW, boxH, strips }
  }, [])
}

export default function CurvedDisplay() {
  const { w, boxW, boxH, strips } = useCylinder()
  const scale = useFitScale(boxW * 1.03, boxH + FLOOR)

  return (
    <div className="cv-viewport">
      <div className="cv-room" style={{ width: boxW, height: boxH + FLOOR, perspective: VIEW_DIST, transform: `translate(-50%, -50%) scale(${scale})` }}>
        {/* 바닥에 번지는 화면 빛 */}
        <div className="cv-floor" style={{ top: boxH - 60 }} />

        <div className="cv-cylinder" style={{ left: (boxW - STAGE_W) / 2, top: (boxH - STAGE_H) / 2, width: STAGE_W, height: STAGE_H }}>
          {strips.map((s) => (
            // 이웃 조각과 1px씩 겹쳐서 이음새가 안 보이게
            <div key={s.i} className="cv-strip" style={{ left: STAGE_W / 2 - w / 2 - 1, width: w + 2, transform: s.transform }}>
              <div className="ds-stage cv-screen" style={{ left: -s.i * w + 1, top: 0, width: STAGE_W, height: STAGE_H }}>
                <SceneCopy.Provider value={{ primary: s.i === STRIPS / 2 }}>
                  {/* layoutId 애니메이션이 조각끼리 섞이지 않게 조각마다 따로 묶음 */}
                  <LayoutGroup id={`strip-${s.i}`}>
                    <DisplayScene onboardingAutoplay />
                  </LayoutGroup>
                </SceneCopy.Provider>
                {/* 휜 면의 빛 — 가장자리는 살짝 밝고 가운데는 깊게 */}
                <div className="cv-shade" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
