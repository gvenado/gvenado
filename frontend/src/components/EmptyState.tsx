import { type ReactNode } from 'react'
import { PackageOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: ReactNode
  title?: string
  message?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({
  icon,
  title = 'Sin datos',
  message = 'No hay información disponible para mostrar.',
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 px-6 py-12',
        className,
      )}
    >
      <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center">
        {icon || <PackageOpen className="w-7 h-7 text-[#9CA3AF]" />}
      </div>
      <div className="text-center max-w-[280px]">
        <p className="text-[#111827] text-sm font-semibold">{title}</p>
        <p className="text-[#6B7280] text-xs mt-1 leading-relaxed">{message}</p>
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  )
}
