import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface KPICardProps {
  label: string
  value: string
  icon: ReactNode
  trend?: string
  trendDirection?: 'up' | 'down'
  iconBgClass?: string
}

export function KPICard({ label, value, icon, trend, trendDirection, iconBgClass }: KPICardProps) {
  return (
    <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm p-5 flex items-start gap-4 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
      <div className={cn('w-11 h-11 rounded-lg flex items-center justify-center shrink-0', iconBgClass ?? 'bg-gray-100')}>
        <div className="text-white [&_svg]:w-5 [&_svg]:h-5">
          {icon}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-[#111827] mt-0.5">{value}</p>
        {trend && (
          <p className={cn(
            'text-xs font-medium mt-1',
            trendDirection === 'up' ? 'text-[#16A34A]' : 'text-[#DC2626]'
          )}>
            {trendDirection === 'up' ? '↑' : '↓'} {trend}
          </p>
        )}
      </div>
    </div>
  )
}
