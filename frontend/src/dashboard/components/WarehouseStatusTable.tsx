import type { Warehouse } from '@/dashboard/types'
import { WarehouseRow } from '@/dashboard/components/WarehouseRow'

interface WarehouseStatusTableProps {
  warehouses: Warehouse[]
  selectedId: string
  onSelect: (id: string) => void
}

export function WarehouseStatusTable({ warehouses, selectedId, onSelect }: WarehouseStatusTableProps) {
  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-[#E5E7EB]">
        <h3 className="text-sm font-bold text-[#111827]">Warehouse Status</h3>
        <p className="text-xs text-[#6B7280] mt-0.5">Select a warehouse in alert to view details.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E5E7EB] bg-gray-50">
              <th className="text-left text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider py-2.5 px-4">Warehouse</th>
              <th className="text-left text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider py-2.5 px-4">Capacity %</th>
              <th className="text-left text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider py-2.5 px-4">Days Remaining</th>
              <th className="text-left text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider py-2.5 px-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {warehouses.map(w => (
              <WarehouseRow
                key={w.id}
                warehouse={w}
                selected={w.id === selectedId}
                onSelect={() => onSelect(w.id)}
              />
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-5 py-2.5 border-t border-[#E5E7EB]">
        <span className="text-xs text-[#6B7280]">{warehouses.length} warehouses</span>
      </div>
    </div>
  )
}
