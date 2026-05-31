import { useEffect } from 'react'
import { X, ArrowRight, CheckCircle2, Truck } from 'lucide-react'

interface TransferSuggestionModalProps {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function TransferSuggestionModal({ open, onConfirm, onCancel }: TransferSuggestionModalProps) {
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
              <Truck className="w-4 h-4 text-[#DC2626]" />
            </div>
            <h3 className="text-sm font-bold text-[#111827]">Traslado sugerido</h3>
          </div>
          <button
            onClick={onCancel}
            className="w-7 h-7 rounded-md border border-[#E5E7EB] flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <X className="w-3.5 h-3.5 text-[#6B7280]" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          <div>
            <p className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider mb-2">Origen</p>
            <p className="text-sm font-bold text-[#111827]">Central</p>
          </div>

          <div className="flex justify-center">
            <ArrowRight className="w-5 h-5 text-[#DC2626]" />
          </div>

          <div>
            <p className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider mb-2">Destino</p>
            <p className="text-sm font-bold text-[#111827]">Achumani</p>
          </div>

          <hr className="border-[#E5E7EB]" />

          <div>
            <p className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider mb-2">Materiales a transferir</p>
            <div className="flex items-center justify-between py-1.5 border-b border-[#E5E7EB] last:border-b-0">
              <span className="text-xs text-[#111827]">Shelf Strip 600ml</span>
              <span className="text-xs font-bold text-[#111827]">200 Units</span>
            </div>
          </div>

          <hr className="border-[#E5E7EB]" />

          <div className="bg-[#F0FDF4] rounded-lg p-3 flex items-center gap-2 border border-[#BBF7D0]">
            <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
            <div>
              <p className="text-[10px] font-semibold text-[#16A34A]">Recuperación esperada</p>
              <p className="text-xs font-bold text-[#111827]">7 días adicionales</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2.5 px-5 py-3.5 border-t border-[#E5E7EB] bg-gray-50 rounded-b-xl">
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-lg border border-[#E5E7EB] bg-white text-xs font-semibold text-[#6B7280] hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 rounded-lg bg-[#DC2626] hover:bg-[#B91C1C] text-xs font-bold text-white transition-colors shadow-sm"
          >
            Confirmar traslado
          </button>
        </div>
      </div>
    </div>
  )
}
