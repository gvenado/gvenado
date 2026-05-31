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
        <h3 className="text-sm font-bold text-[#111827]">Estado de depósitos</h3>
        <p className="text-xs text-[#6B7280] mt-0.5">Selecciona un depósito en alerta para ver detalles.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E5E7EB] bg-gray-50">
              <th className="text-left text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider py-2.5 px-4">Depósito</th>
              <th className="text-left text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider py-2.5 px-4">Capacidad %</th>
              <th className="text-left text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider py-2.5 px-4">Días restantes</th>
              <th className="text-left text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider py-2.5 px-4">Estado</th>
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
        <span className="text-xs text-[#6B7280]">{warehouses.length} depósitos</span>
      </div>
    </div>
  )
}
