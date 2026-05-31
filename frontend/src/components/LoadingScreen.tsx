import { cn } from '@/lib/utils'

interface LoadingScreenProps {
  message?: string
  fullScreen?: boolean
  className?: string
}

export function LoadingScreen({ message = 'Cargando...', fullScreen = true, className }: LoadingScreenProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3',
        fullScreen ? 'fixed inset-0 z-50 bg-white' : 'py-12',
        className,
      )}
    >
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-2 border-[#E5E7EB]" />
        <div className="absolute inset-0 rounded-full border-2 border-[#DC2626] border-t-transparent animate-spin" />
      </div>
      <p className="text-sm text-[#6B7280]">{message}</p>
    </div>
  )
}

interface InlineLoadingProps {
  className?: string
}

export function InlineSpinner({ className }: InlineLoadingProps) {
  return (
    <div className={cn('w-5 h-5 rounded-full border-2 border-[#DC2626] border-t-transparent animate-spin', className)} />
  )
}
