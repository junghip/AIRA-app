import { useEffect, useState } from 'react'

// 화면을 띄우기 전에 의자 디스플레이의 사진·아이콘·영상을 모두 받아 두고 그려 둠
// → 화면이 넘어갈 때 사진이 비어 있다가 뒤늦게 뜨는 일이 없게
const images = Object.values(
  import.meta.glob(['../assets/display/*.{png,jpg,jpeg,svg}', '../assets/display/posters/*.jpg'], { eager: true, query: '?url', import: 'default' }),
) as string[]
const videos = Object.values(import.meta.glob('../assets/display/*.mp4', { eager: true, query: '?url', import: 'default' })) as string[]

const loadImage = (src: string) =>
  new Promise<void>((resolve) => {
    const img = new Image()
    img.src = src
    // decode까지 끝내야 처음 그릴 때 끊기지 않음
    img.decode().then(() => resolve(), () => resolve())
  })

const loadVideo = (src: string) =>
  new Promise<void>((resolve) => {
    const v = document.createElement('video')
    v.muted = true
    v.setAttribute('muted', '')
    v.setAttribute('playsinline', '')
    v.preload = 'auto'
    v.oncanplaythrough = () => resolve()
    v.onerror = () => resolve()
    // Safari는 화면에 없는 영상을 끝까지 안 받기도 함 → 첫 장면만 준비되면 통과
    v.onloadeddata = () => resolve()
    v.src = src
    v.load()
  })

let ready: Promise<void> | null = null
let done = false

// 아무리 늦어도 12초 뒤엔 시작 (네트워크가 아주 느릴 때 화면이 영영 안 뜨지 않게)
export function preloadDisplay() {
  ready ??= Promise.race([
    Promise.all([...images.map(loadImage), ...videos.map(loadVideo)]).then(() => undefined),
    new Promise<void>((r) => setTimeout(r, 12000)),
  ]).then(() => {
    done = true
  })
  return ready
}

export function usePreloaded() {
  const [ok, setOk] = useState(done)
  useEffect(() => {
    if (ok) return
    let alive = true
    preloadDisplay().then(() => alive && setOk(true))
    return () => {
      alive = false
    }
  }, [ok])
  return ok
}
