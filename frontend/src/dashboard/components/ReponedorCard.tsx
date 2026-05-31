import type { Reponedor } from '@/dashboard/types'
import { cn } from '@/lib/utils'

interface ReponedorCardProps {
  reponedor: Reponedor
  compact?: boolean
}

const statusLabels: Record<string, string> = {
  idle: 'Idle',
  in_route: 'In Route',
  at_pdv: 'At PDV',
  overloaded: 'Overloaded',
}

export function ReponedorCard({ reponedor, compact }: ReponedorCardProps) {
  const statusColor = reponedor.status === 'overloaded' ? '#DC2626'
    : reponedor.status === 'in_route' ? '#F59E0B'
    : reponedor.status === 'at_pdv' ? '#2563EB'
    : '#16A34A'

  return (
    <div className="bg-white rounded-lg border border-[#E5E7EB] p-4 transition-all duration-200 hover:shadow-md">
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
          style={{ backgroundColor: reponedor.color }}
        >
          {reponedor.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#111827] truncate">{reponedor.name}</p>
          {!compact && <p className="text-xs text-[#6B7280]">{reponedor.assignedPdvs} PDVs assigned</p>}
        </div>
        <span
          className="text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
          style={{ backgroundColor: `${statusColor}18`, color: statusColor }}
        >
          {statusLabels[reponedor.status]}
        </span>
      </div>

      {!compact && (
        <div className="mt-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-[#6B7280]">Workload</span>
            <span className="font-semibold text-[#111827]">{reponedor.workload}%</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${reponedor.workload}%`,
                backgroundColor: reponedor.workload > 85 ? '#DC2626' : reponedor.workload > 70 ? '#F59E0B' : '#16A34A',
              }}
            />
          </div>
        </div>
      )}

      {compact && (
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${reponedor.workload}%`,
                backgroundColor: reponedor.workload > 85 ? '#DC2626' : '#16A34A',
              }}
            />
          </div>
          <span className={cn(
            'text-xs font-bold',
            reponedor.workload > 85 ? 'text-[#DC2626]' : 'text-[#16A34A]'
          )}>
            {reponedor.workload}%
          </span>
        </div>
      )}
    </div>
  )
}
