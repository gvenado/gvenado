import { cn } from '@/lib/utils'
import type { Warehouse } from '@/dashboard/types'
import { MaterialAlertRow } from '@/dashboard/components/MaterialAlertRow'

interface AlertDetailPanelProps {
  warehouse: Warehouse | null
  onSuggestTransfer: () => void
}

const statusBadgeStyles: Record<string, { bg: string; text: string }> = {
  optimal: { bg: 'bg-[#F0FDF4]', text: 'text-[#16A34A]' },
  stable: { bg: 'bg-[#FFFBEB]', text: 'text-[#F59E0B]' },
  alert: { bg: 'bg-[#FFFBEB]', text: 'text-[#F59E0B]' },
  critical: { bg: 'bg-[#FEF2F2]', text: 'text-[#DC2626]' },
}

const statusLabels: Record<string, string> = {
  optimal: 'Óptimo',
  stable: 'Estable',
  alert: 'Alerta',
  critical: 'Crítico',
}

export function AlertDetailPanel({ warehouse, onSuggestTransfer }: AlertDetailPanelProps) {
  if (!warehouse) {
    return (
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-5 flex items-center justify-center min-h-[300px]">
        <p className="text-sm text-[#6B7280]">Selecciona un depósito para ver detalles</p>
      </div>
    )
  }

  const badge = statusBadgeStyles[warehouse.status]
  const criticalCount = warehouse.materials.length

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-[#E5E7EB]">
        <h3 className="text-sm font-bold text-[#111827]">Detalle de alerta</h3>
      </div>

      <div className="px-5 py-4 border-b border-[#E5E7EB]">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-base font-bold text-[#111827]">{warehouse.name}</h4>
          <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', badge.bg, badge.text)}>
            {statusLabels[warehouse.status]}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-lg font-black text-[#111827]">{warehouse.capacity}%</p>
            <p className="text-[10px] text-[#6B7280] mt-0.5">Capacidad %</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-lg font-black text-[#111827]">{warehouse.daysRemaining}</p>
            <p className="text-[10px] text-[#6B7280] mt-0.5">Días restantes</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-lg font-black text-[#111827]">{criticalCount}</p>
            <p className="text-[10px] text-[#6B7280] mt-0.5">Materiales críticos</p>
          </div>
        </div>
      </div>

      {warehouse.materials.length > 0 && (
        <div>
          <div className="px-5 py-3 border-b border-[#E5E7EB]">
            <h4 className="text-xs font-bold text-[#111827]">Material POP en alerta</h4>
          </div>
          <div>
            {warehouse.materials.map(m => (
              <MaterialAlertRow key={m.id} material={m} />
            ))}
          </div>
        </div>
      )}

      <div className="p-4">
        <button
          onClick={onSuggestTransfer}
          className="w-full py-2.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
        >
          Sugerir traslado
        </button>
      </div>
    </div>
  )
}
