import { useEffect } from 'react'
import { CheckCircle2, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SuccessDialogProps {
  open: boolean
  title: string
  message?: string
  buttonLabel?: string
  onClose: () => void
  autoClose?: number
}

export function SuccessDialog({
  open,
  title,
  message,
  buttonLabel = 'Continuar',
  onClose,
  autoClose,
}: SuccessDialogProps) {
  useEffect(() => {
    if (!open || !autoClose) return
    const timer = setTimeout(onClose, autoClose)
    return () => clearTimeout(timer)
  }, [open, autoClose, onClose])

  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl border border-[#E5E7EB] w-full max-w-sm overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex flex-col items-center py-8 px-6 text-center">
          <div className="w-16 h-16 rounded-full bg-[#F0FDF4] flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8 text-[#16A34A]" />
          </div>
          <h3 className="text-lg font-bold text-[#111827]">{title}</h3>
          {message && (
            <p className="text-sm text-[#6B7280] mt-1.5 leading-relaxed max-w-[280px]">{message}</p>
          )}
          <button
            onClick={onClose}
            className={cn(
              'mt-6 px-8 py-2.5 rounded-xl text-sm font-bold text-white transition-colors shadow-sm',
              'bg-[#DC2626] hover:bg-[#B91C1C]',
            )}
          >
            {buttonLabel}
          </button>
        </div>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-7 h-7 rounded-md border border-[#E5E7EB] flex items-center justify-center hover:bg-gray-50 transition-colors bg-white"
        >
          <X className="w-3.5 h-3.5 text-[#6B7280]" />
        </button>
      </div>
    </div>
  )
}
