import { ChevronRight } from 'lucide-react'
import type { ImprovementItem } from '@/dashboard/types'

interface ImprovementRankingProps {
  items: ImprovementItem[]
  onViewAll?: () => void
}

export function ImprovementRanking({ items, onViewAll }: ImprovementRankingProps) {
  return (
    <div>
      <p className="text-xs font-medium text-[#6B7280] mb-3">Caras ganadas</p>
      <div className="space-y-2.5">
        {items.map((item, i) => (
          <div key={item.code} className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
              <span className="text-[10px] font-bold text-[#6B7280]">{i + 1}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#111827] truncate">
                {item.code} - {item.name}
              </p>
            </div>
            <span className="text-xs font-bold text-[#16A34A]">+{item.facesGained}</span>
          </div>
        ))}
      </div>
      {onViewAll && (
        <button
          onClick={onViewAll}
          className="w-full mt-3.5 text-xs font-semibold text-[#DC2626] hover:text-[#B91C1C] transition-colors flex items-center justify-center gap-1"
        >
          Ver ranking completo
          <ChevronRight className="w-3 h-3" />
        </button>
      )}
    </div>
  )
}
