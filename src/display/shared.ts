import { motionValue, type MotionValue } from 'motion/react'
import { createContext, useCallback, useContext, useSyncExternalStore, type SetStateAction } from 'react'

// 화면 상태를 한 곳에 모아 둠.
// 휘어진 화면(/display-curved)은 같은 화면을 여러 조각으로 띄우는데, 조각마다 상태가 따로 놀면 안 되기 때문.
// 평면 화면(/display)에서는 그냥 useState처럼 동작함.

const values = new Map<string, unknown>()
const listeners = new Set<() => void>()
const subscribe = (fn: () => void) => {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
const emit = () => listeners.forEach((fn) => fn())

export function useSharedState<T>(key: string, initial: T): [T, (v: SetStateAction<T>) => void] {
  const value = useSyncExternalStore(subscribe, () => (values.has(key) ? (values.get(key) as T) : initial))
  const set = useCallback(
    (v: SetStateAction<T>) => {
      const prev = values.has(key) ? (values.get(key) as T) : initial
      const next = typeof v === 'function' ? (v as (p: T) => T)(prev) : v
      if (Object.is(prev, next)) return
      values.set(key, next)
      emit()
    },
    [key, initial],
  )
  return [value, set]
}

// 끌기(drag) 위치처럼 매 프레임 바뀌는 값 — 조각들이 같은 MotionValue를 같이 봄
const motionValues = new Map<string, MotionValue<number>>()
export function useSharedMotionValue(key: string, initial = 0) {
  if (!motionValues.has(key)) motionValues.set(key, motionValue(initial))
  return motionValues.get(key)!
}

// 처음부터 다시 — 화면 상태를 모두 비움 (keep에 적은 키는 남김)
export function resetShared(keep: string[] = []) {
  for (const k of [...values.keys()]) if (!keep.includes(k)) values.delete(k)
  for (const [k, mv] of motionValues) if (!keep.includes(k)) mv.jump(0)
  emit()
}

// 여러 조각 중 타이머·키보드를 맡는 한 조각만 primary
export const SceneCopy = createContext({ primary: true })
export const usePrimaryCopy = () => useContext(SceneCopy).primary
