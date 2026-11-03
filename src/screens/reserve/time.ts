// 도착 시간 관련 값과 문구
export const BOARDING = 13 * 60 + 50
export const SUGGESTED = 11 * 60 + 50 // 탑승 2시간 전
export const TIME_MIN = 9 * 60
export const TIME_MAX = 13 * 60
export const TIME_STEP = 10

export const timeOptions = Array.from({ length: (TIME_MAX - TIME_MIN) / TIME_STEP + 1 }, (_, i) => TIME_MIN + i * TIME_STEP)

export const formatTime = (m: number) => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`

// 도착부터 탑승까지 AIRA와 보낼 수 있는 시간
export const timeWithAira = (m: number) => {
  const diff = BOARDING - m
  const h = Math.floor(diff / 60)
  const min = diff % 60
  const hours = h ? `${h}${h === 1 ? 'hr' : 'hrs'}` : ''
  return `You have ${[hours, min ? `${min}min` : ''].filter(Boolean).join(' ')} with AIRA`
}
