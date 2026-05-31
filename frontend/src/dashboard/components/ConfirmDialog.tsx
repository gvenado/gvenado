import { useEffect } from 'react'
import { AlertTriangle, X } from 'lucide-react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-xl shadow-xl border border-[#E5E7EB] w-full max-w-sm mx-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#FEF2F2] flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-[#DC2626]" />
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
        <div className="flex justify-end gap-2.5 px-5 py-3.5 border-t border-[#E5E7EB] bg-gray-50 rounded-b-xl">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-[#E5E7EB] bg-white text-xs font-semibold text-[#6B7280] hover:bg-gray-50 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2 rounded-lg bg-[#DC2626] hover:bg-[#B91C1C] text-xs font-bold text-white transition-colors shadow-sm"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
