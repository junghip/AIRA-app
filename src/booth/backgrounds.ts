import endingScene from '../assets/aira/ending-scene.jpg'
import terminal from '../assets/window/bg-terminal.png'

// 촬영 배경 목록 — 새 배경을 넣으려면 이미지 import 후 한 줄 추가
// focusX / focusY: 사진을 세로(3:4)로 자를 때 어느 쪽을 중심으로 남길지 (0~1)
export type Backdrop =
  | { id: string; label: string; kind: 'sky' }
  | { id: string; label: string; kind: 'image'; src: string; focusX: number; focusY: number }
  | { id: string; label: string; kind: 'none' }

export const backdrops: Backdrop[] = [
  { id: 'sky', label: '기본', kind: 'sky' },
  { id: 'airport', label: '공항', kind: 'image', src: terminal, focusX: 0.36, focusY: 0.5 },
  { id: 'aira', label: 'AIRA 차량', kind: 'image', src: endingScene, focusX: 0.5, focusY: 0.42 },
  { id: 'none', label: '배경 그대로', kind: 'none' },
]

const images = new Map<string, HTMLImageElement>()

export function loadBackdropImages() {
  return Promise.all(
    backdrops.map(
      (b) =>
        new Promise<void>((resolve) => {
          if (b.kind !== 'image' || images.has(b.id)) return resolve()
          const img = new Image()
          img.onload = () => resolve()
          img.onerror = () => resolve()
          img.src = b.src
          images.set(b.id, img)
        }),
    ),
  )
}

// 캔버스 전체에 배경을 깔기
export function drawBackdrop(ctx: CanvasRenderingContext2D, b: Backdrop, w: number, h: number, t: number) {
  if (b.kind === 'sky') return drawSky(ctx, w, h, t)
  if (b.kind !== 'image') return
  const img = images.get(b.id)
  if (!img?.complete || !img.naturalWidth) return drawSky(ctx, w, h, t)
  // object-fit: cover + 초점 위치
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight)
  const dw = img.naturalWidth * scale
  const dh = img.naturalHeight * scale
  ctx.drawImage(img, (w - dw) * b.focusX, (h - dh) * b.focusY, dw, dh)
}

// AIRA 앱의 하늘색 그라데이션 + 천천히 떠다니는 빛
export function drawSky(ctx: CanvasRenderingContext2D, w: number, h: number, t = 0) {
  const g = ctx.createLinearGradient(0, 0, 0, h)
  g.addColorStop(0, '#8ca2c0')
  g.addColorStop(0.3, '#a9bbd4')
  g.addColorStop(0.58, '#c3ccda')
  g.addColorStop(1, '#e3dad8')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)

  const s = t / 1000
  const blob = (cx: number, cy: number, r: number, color: string) => {
    const rg = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
    rg.addColorStop(0, color)
    rg.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = rg
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2)
  }
  blob(w * (0.25 + 0.12 * Math.sin(s * 0.5)), h * (0.18 + 0.05 * Math.cos(s * 0.4)), w * 0.55, 'rgba(255,255,255,0.75)')
  blob(w * (0.85 + 0.1 * Math.cos(s * 0.35)), h * (0.45 + 0.06 * Math.sin(s * 0.45)), w * 0.5, 'rgba(140,162,192,0.7)')
  blob(w * (0.2 + 0.1 * Math.cos(s * 0.55)), h * (0.88 + 0.04 * Math.sin(s * 0.3)), w * 0.55, 'rgba(227,218,216,0.9)')
}
