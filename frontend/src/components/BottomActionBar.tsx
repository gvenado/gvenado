import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface BottomActionBarProps {
  children: ReactNode
  className?: string
}

export function BottomActionBar({ children, className }: BottomActionBarProps) {
  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E7EB] px-4 py-3 shadow-[0_-2px_12px_rgba(0,0,0,0.06)] z-40',
        className,
      )}
    >
      {children}
    </div>
  )
}

interface BottomActionButtonProps {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  icon?: ReactNode
  className?: string
  type?: 'button' | 'submit'
}

export function BottomActionButton({
  children,
  onClick,
  disabled,
  loading,
  icon,
  className,
  type = 'button',
}: BottomActionButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        'w-full h-14 rounded-2xl flex items-center justify-center gap-2.5 text-white text-base font-semibold transition-all',
        disabled || loading
          ? 'bg-[#DC2626]/70 cursor-not-allowed'
          : 'bg-[#DC2626] hover:bg-[#B91C1C] active:scale-[0.98]',
        className,
      )}
    >
      {loading ? (
        <svg
          className="w-5 h-5 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      ) : icon ? (
        icon
      ) : null}
      {loading ? 'Cargando...' : children}
    </button>
  )
}
