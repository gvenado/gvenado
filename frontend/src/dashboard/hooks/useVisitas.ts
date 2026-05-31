import { useState, useEffect, useRef } from 'react'
import { fetchVisitasHoy, type LiveEvent } from '@/dashboard/services/visitasService'

export function useVisitas(pollInterval = 3000) {
  const [events, setEvents] = useState<LiveEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    let timeoutId: ReturnType<typeof setTimeout>

    async function poll() {
      try {
        const data = await fetchVisitasHoy()
        if (cancelled) return
        setEvents(data.events)
        setLoading(false)
        setError(null)
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Failed to load live events')
        setLoading(false)
      }

      if (!cancelled) {
        timeoutId = setTimeout(poll, pollInterval)
      }
    }

    poll()

    return () => {
      cancelled = true
      clearTimeout(timeoutId)
    }
  }, [pollInterval])

  return { events, loading, error }
}
