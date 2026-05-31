import { useState, useEffect } from 'react'
import type { Visita } from '@/dashboard/types'
import { mockVisitas } from '@/dashboard/data/mockVisitas'

export function useRealtimeVisitas() {
  const [visitas, setVisitas] = useState<Visita[]>(mockVisitas)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => {
      setVisitas(mockVisitas)
      setLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  return { visitas, loading }
}
