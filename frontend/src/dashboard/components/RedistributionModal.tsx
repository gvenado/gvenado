import { useEffect } from 'react'
import { X, RefreshCw, ArrowRight, AlertTriangle, Store, TrendingUp, CheckCircle2, PersonStanding } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RepData {
  id: string
  name: string
  pdvs: number
  completed: number
  deviation: number
  efficiency: number
  status: string
  color: string
  mobility: string
}

interface RedistributionModalProps {
  open: boolean
  rep: RepData | null
  onCancel: () => void
  onSimulate: (repId: string) => void
}

export function RedistributionModal({ open, rep, onCancel, onSimulate }: RedistributionModalProps) {
  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onCancel])

  if (!open || !rep) return null

  const recommendation = rep.deviation > 10
    ? `Mover 2 PDVs desde ${rep.name} hacia Reponedor 5 para equilibrar la carga y reducir la desviación de ruta.`
    : rep.deviation > 5
      ? `Reasignar 1 PDV de ${rep.name} a un reponedor con menor carga para optimizar el recorrido.`
      : `${rep.name} se encuentra dentro de los parámetros operativos. No se requieren redistribuciones urgentes.`

  const overloaded = rep.deviation > 10

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-xl shadow-xl border border-[#E5E7EB] w-full max-w-md mx-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-2.5">
            <div className={cn('w-8 h-8 rounded-full flex items-center justify-center', overloaded ? 'bg-[#FEF2F2]' : 'bg-[#F0FDF4]')}>
              <RefreshCw className={cn('w-4 h-4', overloaded ? 'text-[#DC2626]' : 'text-[#16A34A]')} />
            </div>
            <h3 className="text-sm font-bold text-[#111827]">Redistribuir carga de trabajo</h3>
          </div>
          <button
            onClick={onCancel}
            className="w-7 h-7 rounded-md border border-[#E5E7EB] flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <X className="w-3.5 h-3.5 text-[#6B7280]" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-[#E5E7EB]">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{ backgroundColor: rep.color }}
            >
              {rep.name.charAt(rep.name.length - 1)}
            </div>
            <div>
              <p className="text-sm font-bold text-[#111827]">{rep.name}</p>
              <p className="text-[10px] text-[#6B7280]">ID: {rep.id.toUpperCase()} · {rep.mobility}</p>
            </div>
            <span className={cn(
              'ml-auto text-[10px] font-bold px-2.5 py-0.5 rounded-full border',
              rep.status === 'overloaded' ? 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]'
                : rep.status === 'en_riesgo' ? 'bg-[#FFFBEB] text-[#F59E0B] border-[#FDE68A]'
                : 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]'
            )}>
              {rep.status === 'overloaded' ? 'Sobrecargado' : rep.status === 'en_riesgo' ? 'En riesgo' : 'En tiempo'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <Store className="w-4 h-4 text-[#6B7280] mx-auto mb-1" />
              <p className="text-lg font-bold text-[#111827]">{rep.pdvs}</p>
              <p className="text-[10px] text-[#6B7280]">PDVs asignados</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <CheckCircle2 className="w-4 h-4 text-[#16A34A] mx-auto mb-1" />
              <p className="text-lg font-bold text-[#111827]">{rep.completed} / {rep.pdvs}</p>
              <p className="text-[10px] text-[#6B7280]">PDVs visitados</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <TrendingUp className={cn('w-4 h-4 mx-auto mb-1', overloaded ? 'text-[#DC2626]' : 'text-[#16A34A]')} />
              <p className={cn('text-lg font-bold', overloaded ? 'text-[#DC2626]' : 'text-[#16A34A]')}>
                {rep.deviation > 0 ? '+' : ''}{rep.deviation}%
              </p>
              <p className="text-[10px] text-[#6B7280]">Desviación actual</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <PersonStanding className="w-4 h-4 text-[#2563EB] mx-auto mb-1" />
              <p className="text-lg font-bold text-[#2563EB]">{rep.efficiency}%</p>
              <p className="text-[10px] text-[#6B7280]">Eficiencia POP</p>
            </div>
          </div>

          <div className={cn(
            'rounded-lg p-3 border',
            overloaded ? 'bg-[#FEF2F2] border-[#FECACA]' : 'bg-[#F0FDF4] border-[#BBF7D0]'
          )}>
            <div className="flex items-start gap-2">
              <AlertTriangle className={cn('w-4 h-4 mt-0.5 shrink-0', overloaded ? 'text-[#DC2626]' : 'text-[#16A34A]')} />
              <div>
                <p className={cn('text-[11px] font-semibold', overloaded ? 'text-[#DC2626]' : 'text-[#16A34A]')}>
                  Recomendación
                </p>
                <p className="text-[11px] text-[#111827] mt-0.5 leading-snug">{recommendation}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2.5 px-5 py-3.5 border-t border-[#E5E7EB] bg-gray-50 rounded-b-xl">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-[#E5E7EB] bg-white text-xs font-semibold text-[#6B7280] hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => onSimulate(rep.id)}
            className="px-5 py-2 rounded-lg bg-[#DC2626] hover:bg-[#B91C1C] text-xs font-bold text-white transition-colors shadow-sm flex items-center gap-1.5"
          >
            Simular redistribución
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  )
}
