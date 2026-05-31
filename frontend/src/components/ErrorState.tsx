import { AlertTriangle, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  className?: string
  fullScreen?: boolean
}

export function ErrorState({
  title = 'Algo salió mal',
  message = 'Ocurrió un error inesperado. Intenta de nuevo.',
  onRetry,
  className,
  fullScreen,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 px-6',
        fullScreen ? 'fixed inset-0 z-50 bg-white' : 'py-12',
        className,
      )}
    >
      <div className="w-14 h-14 rounded-full bg-[#FEF2F2] flex items-center justify-center">
        <AlertTriangle className="w-7 h-7 text-[#DC2626]" />
      </div>
      <div className="text-center max-w-[280px]">
        <p className="text-[#111827] text-sm font-semibold">{title}</p>
        <p className="text-[#6B7280] text-xs mt-1 leading-relaxed">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-1 px-5 py-2.5 rounded-xl bg-[#DC2626] text-white text-sm font-semibold hover:bg-[#B91C1C] transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Reintentar
        </button>
      )}
    </div>
  )
}
