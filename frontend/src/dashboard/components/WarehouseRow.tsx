import { cn } from '@/lib/utils'
import type { Warehouse } from '@/dashboard/types'

interface WarehouseRowProps {
  warehouse: Warehouse
  selected: boolean
  onSelect: () => void
}

const statusStyles: Record<string, { badgeBg: string; badgeText: string; barColor: string }> = {
  optimal: { badgeBg: 'bg-[#F0FDF4]', badgeText: 'text-[#16A34A]', barColor: '#16A34A' },
  stable: { badgeBg: 'bg-[#FFFBEB]', badgeText: 'text-[#F59E0B]', barColor: '#F59E0B' },
  alert: { badgeBg: 'bg-[#FFFBEB]', badgeText: 'text-[#F59E0B]', barColor: '#F59E0B' },
  critical: { badgeBg: 'bg-[#FEF2F2]', badgeText: 'text-[#DC2626]', barColor: '#DC2626' },
}

const statusLabels: Record<string, string> = {
  optimal: 'Optimal',
  stable: 'Stable',
  alert: 'Alert',
  critical: 'Critical',
}

export function WarehouseRow({ warehouse, selected, onSelect }: WarehouseRowProps) {
  const s = statusStyles[warehouse.status]

  return (
    <tr
      onClick={onSelect}
      className={cn(
        'cursor-pointer transition-colors border-b border-[#E5E7EB]',
        selected ? 'bg-[#FEF2F2]' : 'hover:bg-gray-50'
      )}
    >
      <td className="py-3 px-4">
        <span className={cn(
          'text-sm font-medium',
          selected ? 'text-[#DC2626]' : 'text-[#111827]'
        )}>
          {warehouse.name}
        </span>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${warehouse.capacity}%`, backgroundColor: s.barColor }}
            />
          </div>
          <span className="text-xs font-semibold text-[#6B7280]">{warehouse.capacity}%</span>
        </div>
      </td>
      <td className="py-3 px-4">
        <span className="text-sm text-[#6B7280]">{warehouse.daysRemaining}</span>
      </td>
      <td className="py-3 px-4">
        <span className={cn(
          'inline-block text-[10px] font-bold px-2 py-0.5 rounded-full',
          s.badgeBg, s.badgeText
        )}>
          {statusLabels[warehouse.status]}
        </span>
      </td>
    </tr>
  )
}
