import { FilesetResolver, ImageSegmenter } from '@mediapipe/tasks-vision'
import { drawBackdrop, type Backdrop } from './backgrounds'

// 카메라 → 사람만 오려내기(MediaPipe) → 고른 배경 위에 합성해서 캔버스에 그림
// 결과 캔버스는 세로 3:4. 사람 쪽은 거울처럼 좌우 반전, 배경 글자는 반전 안 함.

export const OUT_W = 960
export const OUT_H = 1280
const SEG_W = 288 // 사람 인식은 작은 크기로 (빠르게)
const SEG_H = 384

const WASM = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.2.3/wasm'
const MODEL = `${import.meta.env.BASE_URL}booth/selfie_segmenter.tflite`

let segmenterPromise: Promise<ImageSegmenter> | null = null
function loadSegmenter() {
  segmenterPromise ??= (async () => {
    const fileset = await FilesetResolver.forVisionTasks(WASM)
    const make = (delegate: 'GPU' | 'CPU') =>
      ImageSegmenter.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: MODEL, delegate },
        runningMode: 'VIDEO',
        outputCategoryMask: false,
        outputConfidenceMasks: true,
      })
    try {
      return await make('GPU')
    } catch {
      return await make('CPU')
    }
  })()
  segmenterPromise.catch(() => (segmenterPromise = null))
  return segmenterPromise
}

export class BoothCamera {
  backdrop: Backdrop
  /** 사람 오려내기를 쓸 수 있는지 (모델 로딩 실패 시 false → 배경 그대로만) */
  segReady = false
  segFailed = false

  private video = document.createElement('video')
  private stream: MediaStream | null = null
  private raf = 0
  private out: HTMLCanvasElement
  private outCtx: CanvasRenderingContext2D
  private seg = makeCanvas(SEG_W, SEG_H)
  private mask = makeCanvas(SEG_W, SEG_H)
  private person = makeCanvas(OUT_W, OUT_H)
  private maskData = new ImageData(SEG_W, SEG_H)
  private prev = new Float32Array(SEG_W * SEG_H)
  private segmenter: ImageSegmenter | null = null
  private lastTs = 0

  constructor(canvas: HTMLCanvasElement, backdrop: Backdrop) {
    this.out = canvas
    this.out.width = OUT_W
    this.out.height = OUT_H
    this.outCtx = canvas.getContext('2d')!
    this.backdrop = backdrop
    this.video.muted = true
    this.video.playsInline = true
    this.video.setAttribute('playsinline', '')
  }

  async start(onSegState?: () => void) {
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: { facingMode: 'user', width: { ideal: 1920 }, height: { ideal: 1440 } },
    })
    this.video.srcObject = this.stream
    await this.video.play()
    this.loop()
    loadSegmenter()
      .then((s) => {
        this.segmenter = s
        this.segReady = true
      })
      .catch((e) => {
        console.warn('사람 인식 모델을 불러오지 못했어요', e)
        this.segFailed = true
      })
      .finally(() => onSegState?.())
  }

  stop() {
    cancelAnimationFrame(this.raf)
    this.stream?.getTracks().forEach((t) => t.stop())
    this.stream = null
  }

  /** 지금 화면을 그대로 복사 */
  snapshot() {
    const c = makeCanvas(OUT_W, OUT_H)
    c.getContext('2d')!.drawImage(this.out, 0, 0)
    return c
  }

  private loop = () => {
    this.raf = requestAnimationFrame(this.loop)
    const v = this.video
    if (v.readyState < 2 || !v.videoWidth) return
    this.render(performance.now())
  }

  private render(now: number) {
    const v = this.video
    // 영상 가운데를 3:4 세로로 자르기
    const ratio = OUT_W / OUT_H
    let sw = v.videoWidth
    let sh = v.videoHeight
    if (sw / sh > ratio) sw = sh * ratio
    else sh = sw / ratio
    const sx = (v.videoWidth - sw) / 2
    const sy = (v.videoHeight - sh) / 2

    const ctx = this.outCtx
    const cutOut = this.backdrop.kind !== 'none' && this.segmenter

    if (!cutOut) {
      // 배경 바꾸기 없이 거울 모드 그대로 (모델 로딩 중이면 그 위에 배경을 살짝 비춤)
      ctx.save()
      ctx.translate(OUT_W, 0)
      ctx.scale(-1, 1)
      ctx.drawImage(v, sx, sy, sw, sh, 0, 0, OUT_W, OUT_H)
      ctx.restore()
      return
    }

    // 1) 작은 캔버스로 사람 인식
    const sctx = this.seg.getContext('2d')!
    sctx.drawImage(v, sx, sy, sw, sh, 0, 0, SEG_W, SEG_H)
    const ts = Math.max(now, this.lastTs + 1)
    this.lastTs = ts
    const result = this.segmenter!.segmentForVideo(this.seg, ts)
    const conf = result.confidenceMasks?.[0]
    if (conf) {
      const m = conf.getAsFloat32Array()
      const px = this.maskData.data
      const prev = this.prev
      for (let i = 0; i < m.length; i++) {
        // 앞 프레임과 섞어 가장자리 떨림을 줄이고, 경계를 살짝 또렷하게
        const s = prev[i] * 0.35 + m[i] * 0.65
        prev[i] = s
        const a = s <= 0.25 ? 0 : s >= 0.75 ? 1 : (s - 0.25) / 0.5
        px[i * 4 + 3] = a * a * (3 - 2 * a) * 255
      }
      this.mask.getContext('2d')!.putImageData(this.maskData, 0, 0)
    }
    result.close()

    // 2) 사람만 남기기
    const pctx = this.person.getContext('2d')!
    pctx.globalCompositeOperation = 'source-over'
    pctx.clearRect(0, 0, OUT_W, OUT_H)
    pctx.drawImage(v, sx, sy, sw, sh, 0, 0, OUT_W, OUT_H)
    pctx.globalCompositeOperation = 'destination-in'
    pctx.imageSmoothingQuality = 'high'
    pctx.drawImage(this.mask, 0, 0, OUT_W, OUT_H)
    pctx.globalCompositeOperation = 'source-over'

    // 3) 배경 + 사람(거울)
    drawBackdrop(ctx, this.backdrop, OUT_W, OUT_H, now)
    ctx.save()
    ctx.translate(OUT_W, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(this.person, 0, 0)
    ctx.restore()
  }
}

export function makeCanvas(w: number, h: number) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return c
}
