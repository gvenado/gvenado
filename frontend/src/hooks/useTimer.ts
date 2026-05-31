import { useState, useEffect, useCallback, useRef } from 'react'

export function useTimer() {
  const [seconds, setSeconds] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const start = useCallback(() => {
    if (intervalRef.current) return
    intervalRef.current = setInterval(() => setSeconds(s => s + 1), 1000)
  }, [])

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const reset = useCallback(() => {
    stop()
    setSeconds(0)
  }, [stop])

  useEffect(() => {
    return () => stop()
  }, [stop])

  const format = () => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  return { seconds, format: format(), start, stop, reset }
}
