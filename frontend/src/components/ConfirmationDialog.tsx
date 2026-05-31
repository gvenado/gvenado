import { useEffect } from 'react'
import { AlertTriangle, X, CheckCircle2, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

type DialogVariant = 'danger' | 'success' | 'info'

interface ConfirmationDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: DialogVariant
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

const variantConfig: Record<DialogVariant, { icon: typeof AlertTriangle; bg: string; iconBg: string; btnBg: string; btnHover: string }> = {
  danger: {
    icon: AlertTriangle,
    bg: 'bg-[#FEF2F2]',
    iconBg: 'bg-[#FEF2F2]',
    btnBg: 'bg-[#DC2626]',
    btnHover: 'hover:bg-[#B91C1C]',
  },
  success: {
    icon: CheckCircle2,
    bg: 'bg-[#F0FDF4]',
    iconBg: 'bg-[#F0FDF4]',
    btnBg: 'bg-[#16A34A]',
    btnHover: 'hover:bg-[#15803D]',
  },
  info: {
    icon: Info,
    bg: 'bg-[#EFF6FF]',
    iconBg: 'bg-[#EFF6FF]',
    btnBg: 'bg-[#DC2626]',
    btnHover: 'hover:bg-[#B91C1C]',
  },
}

export function ConfirmationDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  onConfirm,
  onCancel,
  loading,
}: ConfirmationDialogProps) {
  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onCancel])

  if (!open) return null

  const config = variantConfig[variant]
  const Icon = config.icon

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-xl border border-[#E5E7EB] w-full max-w-sm overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-2.5">
            <div className={cn('w-8 h-8 rounded-full flex items-center justify-center', config.iconBg)}>
              <Icon className="w-4 h-4 text-[#DC2626]" />
            </div>
            <h3 className="text-sm font-bold text-[#111827]">{title}</h3>
          </div>
          <button
            onClick={onCancel}
            className="w-7 h-7 rounded-md border border-[#E5E7EB] flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <X className="w-3.5 h-3.5 text-[#6B7280]" />
          </button>
        </div>
        <div className="px-5 py-4">
          <p className="text-sm text-[#6B7280] leading-relaxed">{message}</p>
        </div>
        <div className={cn(
          'flex gap-2.5 px-5 py-3.5 border-t border-[#E5E7EB] bg-gray-50 rounded-b-2xl',
          cancelLabel ? 'justify-end' : 'justify-center',
        )}>
          {cancelLabel && (
            <button
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-2.5 rounded-lg border border-[#E5E7EB] bg-white text-xs font-semibold text-[#6B7280] hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {cancelLabel}
            </button>
          )}
          <button
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              'px-5 py-2.5 rounded-lg text-xs font-bold text-white transition-colors shadow-sm disabled:opacity-70 flex items-center gap-1.5',
              config.btnBg,
              config.btnHover,
              cancelLabel ? '' : 'flex-1 justify-center',
            )}
          >
            {loading && (
              <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
            )}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
