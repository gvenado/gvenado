import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Store, Clock, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BottomNav } from '@/components/BottomNav'

const MOCK_HISTORIAL = [
  { date: '30 may 2026', pdv: 'Supermercado Ketal', tasks: 5, duration: '15 min' },
  { date: '29 may 2026', pdv: 'Hipermaxi Sopocachi', tasks: 5, duration: '20 min' },
  { date: '29 may 2026', pdv: 'IC Norte', tasks: 4, duration: '25 min' },
  { date: '28 may 2026', pdv: 'Fidalga San Miguel', tasks: 5, duration: '10 min' },
  { date: '28 may 2026', pdv: 'SLS MegaCenter', tasks: 3, duration: '30 min' },
  { date: '27 may 2026', pdv: 'Supermercado Ketal', tasks: 5, duration: '15 min' },
  { date: '27 may 2026', pdv: 'Hipermaxi Sopocachi', tasks: 5, duration: '20 min' },
]

export function HistorialPage() {
  const navigate = useNavigate()

  const grouped = MOCK_HISTORIAL.reduce<Record<string, typeof MOCK_HISTORIAL>>((acc, item) => {
    if (!acc[item.date]) acc[item.date] = []
    acc[item.date].push(item)
    return acc
  }, {})

  return (
    <div className="min-h-dvh bg-[#0F172A] flex justify-center">
      <div className="w-full max-w-[375px] min-h-dvh bg-[#F8FAFC] flex flex-col">
        <header className="shrink-0 bg-[#DC2626] px-4 pt-3 pb-3 shadow-sm">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => navigate('/app/perfil')}>
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-white text-base font-bold">Historial de visitas</h1>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-3 pt-3 pb-2">
          {Object.entries(grouped).map(([date, visits]) => (
            <section key={date} className="mb-4">
              <p className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
                {date}
              </p>
              <div className="space-y-1.5">
                {visits.map((visit, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl bg-white border border-[#E2E8F0] p-3 shadow-sm"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                        <Store className="w-4 h-4 text-[#DC2626]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-semibold text-[#0F172A]">{visit.pdv}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[9px] text-[#64748B] flex items-center gap-0.5">
                            <Check className="w-2.5 h-2.5 text-[#22C55E]" />
                            {visit.tasks}/5 tareas
                          </span>
                          <span className="text-[9px] text-[#64748B] flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            {visit.duration}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </main>

        <BottomNav />
      </div>
    </div>
  )
}
