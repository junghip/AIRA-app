import airaLogo from '../assets/common/aira-logo.svg'
import { drawSky } from './backgrounds'

// 4컷을 한 장(1200×1800, 4×6 인화 비율)으로 합치기
export const SHOTS = 4
const W = 1200
const H = 1800
const M = 56 // 바깥 여백
const GAP = 28
const TOP = 176 // 위 머리글 아래부터 사진
const CELL_W = (W - M * 2 - GAP) / 2
const CELL_H = Math.round((CELL_W * 4) / 3)

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

export async function composeStrip(shots: HTMLCanvasElement[], date = new Date()): Promise<Blob> {
  await Promise.all([document.fonts.load('600 34px Pretendard'), document.fonts.load('500 26px Pretendard')]).catch(() => {})
  const logo = await loadImage(airaLogo).catch(() => null)

  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const ctx = c.getContext('2d')!

  drawSky(ctx, W, H, 0)

  // 머리글
  ctx.fillStyle = '#ffffff'
  ctx.textBaseline = 'middle'
  ctx.font = '600 34px Pretendard, sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('AIRA 포토부스', M + 4, 104)
  ctx.font = '500 28px Pretendard, sans-serif'
  ctx.textAlign = 'right'
  ctx.globalAlpha = 0.9
  ctx.fillText(formatDate(date), W - M - 4, 104)
  ctx.globalAlpha = 1

  // 2×2 사진
  shots.slice(0, SHOTS).forEach((shot, i) => {
    const x = M + (i % 2) * (CELL_W + GAP)
    const y = TOP + Math.floor(i / 2) * (CELL_H + GAP)
    ctx.save()
    ctx.shadowColor = 'rgba(40, 60, 90, 0.22)'
    ctx.shadowBlur = 24
    ctx.shadowOffsetY = 6
    roundRect(ctx, x, y, CELL_W, CELL_H, 22)
    ctx.fillStyle = '#fff'
    ctx.fill()
    ctx.restore()
    ctx.save()
    roundRect(ctx, x, y, CELL_W, CELL_H, 22)
    ctx.clip()
    ctx.drawImage(shot, x, y, CELL_W, CELL_H)
    ctx.restore()
  })

  // 바닥글: 로고 + 문구
  const footerTop = TOP + CELL_H * 2 + GAP
  const logoW = 220
  const logoH = (logoW * 22) / 120.206
  if (logo) ctx.drawImage(logo, (W - logoW) / 2, footerTop + 44, logoW, logoH)
  ctx.fillStyle = '#ffffff'
  ctx.globalAlpha = 0.85
  ctx.font = '500 26px Pretendard, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('공항 가는 길, AIRA와 함께', W / 2, footerTop + 44 + logoH + 44)
  ctx.globalAlpha = 1

  return new Promise((resolve, reject) => c.toBlob((b) => (b ? resolve(b) : reject(new Error('사진 만들기 실패'))), 'image/jpeg', 0.9))
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function formatDate(d: Date) {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())}  ${p(d.getHours())}:${p(d.getMinutes())}`
}
