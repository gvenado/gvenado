import { AlertTriangle, AlertCircle, Info } from 'lucide-react'
import type { Alerta } from '@/dashboard/types'
import { cn } from '@/lib/utils'

interface AlertaCardProps {
  alerta: Alerta
}

export function AlertaCard({ alerta }: AlertaCardProps) {
  const Icon = alerta.severity === 'error' ? AlertCircle
    : alerta.severity === 'warning' ? AlertTriangle
    : Info

  const severityBg = alerta.severity === 'error' ? 'bg-[#FEF2F2]'
    : alerta.severity === 'warning' ? 'bg-[#FFFBEB]'
    : 'bg-[#EFF6FF]'

  const severityIconColor = alerta.severity === 'error' ? 'text-[#DC2626]'
    : alerta.severity === 'warning' ? 'text-[#F59E0B]'
    : 'text-[#2563EB]'

  return (
    <div className={cn('flex items-start gap-3 p-3 rounded-lg border border-[#E5E7EB]', severityBg)}>
      <Icon className={cn('w-5 h-5 mt-0.5 shrink-0', severityIconColor)} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#111827]">{alerta.message}</p>
        <p className="text-xs text-[#6B7280] mt-0.5">
          {new Date(alerta.timestamp).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  )
}
