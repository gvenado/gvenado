import { useState, useEffect } from 'react'
import type { Deposito } from '@/dashboard/types'
import { mockDepositos } from '@/dashboard/data/mockDepositos'

export function useDeposits(pdvId?: string) {
  const [depositos, setDepositos] = useState<Deposito[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => {
      const filtered = pdvId
        ? mockDepositos.filter(d => d.pdvId === pdvId)
        : mockDepositos
      setDepositos(filtered)
      setLoading(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [pdvId])

  return { depositos, loading }
}
