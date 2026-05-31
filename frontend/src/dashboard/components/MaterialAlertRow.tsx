import { AlertTriangle, ChevronRight } from 'lucide-react'
import type { WarehouseMaterial } from '@/dashboard/types'

interface MaterialAlertRowProps {
  material: WarehouseMaterial
}

export function MaterialAlertRow({ material }: MaterialAlertRowProps) {
  return (
    <div className="flex items-center gap-3 py-2.5 px-4 border-b border-[#E5E7EB] last:border-b-0 hover:bg-gray-50 transition-colors">
      <div className="w-7 h-7 rounded-full bg-[#FEF2F2] flex items-center justify-center shrink-0">
        <AlertTriangle className="w-3.5 h-3.5 text-[#DC2626]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-[#111827] truncate">{material.name}</p>
        <div className="flex items-center gap-2 mt-1">
          <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: `${material.availability}%`, backgroundColor: '#DC2626' }}
            />
          </div>
          <span className="text-[10px] font-bold text-[#DC2626]">{material.availability}%</span>
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-[#9CA3AF] shrink-0" />
    </div>
  )
}
