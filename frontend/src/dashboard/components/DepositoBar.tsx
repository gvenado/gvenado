import type { Deposito } from '@/dashboard/types'

interface DepositoBarProps {
  deposito: Deposito
}

export function DepositoBar({ deposito }: DepositoBarProps) {
  const percentage = Math.round((deposito.filled / deposito.capacity) * 100)
  const barColor = percentage > 90 ? '#DC2626' : percentage > 75 ? '#F59E0B' : '#16A34A'

  return (
    <div className="bg-white rounded-lg border border-[#E5E7EB] p-3">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-sm font-medium text-[#111827]">{deposito.name}</span>
        <span className="text-xs font-bold text-[#6B7280]">
          {deposito.filled}/{deposito.capacity}
        </span>
      </div>
      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${percentage}%`, backgroundColor: barColor }}
        />
      </div>
      <span className="text-xs text-[#6B7280] mt-1 block">{percentage}% filled</span>
    </div>
  )
}
