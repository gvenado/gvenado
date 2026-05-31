import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { Check, Camera, AlertTriangle, ShoppingBag, Tags, Ticket, Layout, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useReponedor } from '@/context/ReponedorContext'
import { fetchMicrotasks, fetchRutaHoy, uploadVisitaFoto } from '@/services/api'
import type { PDV, Mochila } from '@/data/mockData'
import type { MicroTask, PhotoEvidence } from '@/types'
import { useTimer } from '@/hooks/useTimer'
import { LoadingScreen } from '@/components/LoadingScreen'
import { ErrorState } from '@/components/ErrorState'
import { BottomNav } from '@/components/BottomNav'

function MochilaChip({ icon: Icon, label, count, initial }: {
  icon: typeof Tags
  label: string
  count: number
  initial: number
}) {
  const percentage = initial > 0 ? (count / initial) * 100 : 0
  const color = percentage <= 0
    ? 'bg-[#DC2626] text-white border-[#DC2626]'
    : percentage < 30
      ? 'bg-amber-50 text-amber-700 border-amber-200'
      : 'bg-red-50 text-[#DC2626] border-[#E2E8F0]'

  return (
    <div className={cn('flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 border flex-1', color)}>
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span className="text-sm font-bold leading-none">{count}</span>
      <span className="text-[8px] leading-tight">{label}</span>
    </div>
  )
}

export function ChecklistPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { reponedor, rutaHoy, setRutaHoy } = useReponedor()
  const timer = useTimer()

  const pdvId = id ? parseInt(id, 10) : null
  // visitaId is passed as route state from PDVActualPage.handleStartVisit
  const visitaId = (location.state as { visitaId?: number } | null)?.visitaId ?? null

  const [pdv, setPdv] = useState<PDV | null>(null)
  const [tasks, setTasks] = useState<MicroTask[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [currentTaskIndex, setCurrentTaskIndex] = useState(0)
  const [completedTasks, setCompletedTasks] = useState<Set<number>>(new Set())
  const [numericValues, setNumericValues] = useState<Record<number, number>>({})

  const [initialMochila, setInitialMochila] = useState<Pick<Mochila, 'marcaPrecios' | 'colgantes' | 'cenefas'>>({
    marcaPrecios: 0, colgantes: 0, cenefas: 0,
  })
  const [mochilaRestante, setMochilaRestante] = useState({ marcaPrecios: 0, colgantes: 0, cenefas: 0 })
  const [mochilaUsados, setMochilaUsados] = useState({ marcaPrecios: 0, colgantes: 0, cenefas: 0 })

  const [photoEvidence, setPhotoEvidence] = useState<PhotoEvidence>({
    before: null,
    after: null,
    beforeResult: null,
    afterResult: null,
    uploading: null,
    analyzing: false,
    analysisResult: null,
    analysisComplete: false,
  })

  // Single ref for the hidden file input — reused for both before/after slots
  const photoInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (pdvId == null || !reponedor) return
    let cancelled = false
    setIsLoading(true)
    setError(null)

    async function load() {
      let ruta = rutaHoy
      if (!ruta) {
        ruta = await fetchRutaHoy(reponedor!.id)
        if (!cancelled) setRutaHoy(ruta)
      }
      const foundPdv = ruta.pdvs.find(p => p.id === pdvId) ?? null
      const taskData = await fetchMicrotasks()
      if (!cancelled) {
        setPdv(foundPdv)
        setTasks(taskData)
        const m = ruta.mochila
        setInitialMochila({ marcaPrecios: m.marcaPrecios, colgantes: m.colgantes, cenefas: m.cenefas })
        setMochilaRestante({ marcaPrecios: m.marcaPrecios, colgantes: m.colgantes, cenefas: m.cenefas })
        setIsLoading(false)
      }
    }

    load().catch(() => {
      if (!cancelled) {
        setError('No se pudo cargar la información.')
        setIsLoading(false)
      }
    })

    return () => { cancelled = true }
  }, [pdvId, reponedor?.id])

  useEffect(() => {
    if (!isLoading && pdv) timer.start()
  }, [isLoading, pdv])

  const currentTask = tasks[currentTaskIndex]
  const isLastTask = currentTaskIndex >= tasks.length - 1

  // Gate: all tasks with required !== false must be completed to close the visit
  const allRequiredCompleted = tasks.length > 0 &&
    tasks.filter(t => t.required !== false).every(t => completedTasks.has(t.id))

  const handleCompleteTask = useCallback(() => {
    const task = currentTask
    if (!task) return

    setCompletedTasks(prev => {
      const next = new Set(prev)
      next.add(task.id)
      return next
    })

    const consumo = task.consumeMochila
    if (consumo.marcaPrecios || consumo.colgantes || consumo.cenefas) {
      setMochilaRestante(prev => ({
        marcaPrecios: Math.max(0, prev.marcaPrecios - (consumo.marcaPrecios ?? 0)),
        colgantes: Math.max(0, prev.colgantes - (consumo.colgantes ?? 0)),
        cenefas: Math.max(0, prev.cenefas - (consumo.cenefas ?? 0)),
      }))
      setMochilaUsados(prev => ({
        marcaPrecios: prev.marcaPrecios + (consumo.marcaPrecios ?? 0),
        colgantes: prev.colgantes + (consumo.colgantes ?? 0),
        cenefas: prev.cenefas + (consumo.cenefas ?? 0),
      }))
    }

    if (!isLastTask) setCurrentTaskIndex(i => i + 1)
  }, [currentTask, isLastTask])

  // Real photo upload — calls POST /api/visitas/{visitaId}/foto
  const handlePhotoSelect = useCallback(async (
    slot: 'before' | 'after',
    file: File,
    taskId: number,
  ) => {
    const localUrl = URL.createObjectURL(file)
    setPhotoEvidence(prev => ({ ...prev, [slot]: localUrl, uploading: slot }))

    // No visitaId means the visit wasn't registered on the backend — do not fake success
    if (!visitaId) {
      setPhotoEvidence(prev => ({ ...prev, uploading: null }))
      return
    }

    try {
      const result = await uploadVisitaFoto(visitaId, file)
      setPhotoEvidence(prev => ({
        ...prev,
        uploading: null,
        [`${slot}Result`]: result,
      }))
      setCompletedTasks(prev => {
        const next = new Set(prev)
        next.add(taskId)
        return next
      })
      setCurrentTaskIndex(prev => Math.min(prev + 1, tasks.length - 1))
    } catch {
      // Upload failed — keep local preview so user can retry; clear uploading state
      setPhotoEvidence(prev => ({ ...prev, uploading: null }))
    }
  }, [visitaId, tasks.length])

  const handleNumericChange = useCallback((value: number) => {
    setNumericValues(prev => ({ ...prev, [currentTask.id]: value }))
  }, [currentTask?.id])

  const handleCloseVisit = () => {
    timer.stop()
    navigate('/app/cierre-dia')
  }

  if (!reponedor) return <LoadingScreen message="Verificando sesión..." />

  if (error) {
    return (
      <div className="min-h-dvh bg-[#0F172A] flex justify-center">
        <div className="w-full max-w-[375px] min-h-dvh bg-[#F8FAFC] flex flex-col">
          <header className="shrink-0 bg-[#DC2626] px-4 pt-3 pb-3 shadow-sm">
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => navigate(`/app/pdv/${id}`)}>
                <span className="text-white text-sm">←</span>
              </button>
              <p className="text-white text-sm font-bold">Error</p>
            </div>
          </header>
          <ErrorState title="Error" message={error} onRetry={() => window.location.reload()} fullScreen={false} />
        </div>
      </div>
    )
  }

  const progressPercent = tasks.length > 0 ? Math.round((completedTasks.size / tasks.length) * 100) : 0

  // Derive current photo slot state for rendering
  const currentPhotoSlot = currentTask?.tipo === 'photo' ? currentTask.photoSlot : null
  const currentPhotoPreview = currentPhotoSlot === 'before' ? photoEvidence.before : currentPhotoSlot === 'after' ? photoEvidence.after : null
  const currentPhotoResult = currentPhotoSlot === 'before' ? photoEvidence.beforeResult : currentPhotoSlot === 'after' ? photoEvidence.afterResult : null
  const isCurrentSlotUploading = currentPhotoSlot != null && photoEvidence.uploading === currentPhotoSlot

  return (
    <div className="min-h-dvh bg-[#0F172A] flex justify-center">
      <div className="w-full max-w-[375px] min-h-dvh bg-[#F8FAFC] flex flex-col">
        <header className="shrink-0 bg-[#DC2626] px-4 pt-3 pb-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-white text-sm font-bold truncate">{pdv?.name ?? 'Cargando...'}</p>
              <p className="text-white/60 text-[10px] mt-0.5">
                {currentTask ? `Tarea ${currentTaskIndex + 1} de ${tasks.length}` : ''}
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <Clock className="w-3.5 h-3.5 text-white/70" />
              <span className="text-white text-[11px] font-mono font-bold">{timer.format}</span>
            </div>
          </div>
        </header>

        {/* Hidden file input — triggered programmatically for photo tasks */}
        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          onChange={e => {
            const file = e.target.files?.[0]
            if (file && currentTask?.tipo === 'photo' && currentTask.photoSlot) {
              handlePhotoSelect(currentTask.photoSlot, file, currentTask.id)
            }
            // Reset so the same file can be re-selected on retry
            e.target.value = ''
          }}
        />

        <main className="flex-1 overflow-y-auto px-3 pt-3 pb-2">
          {isLoading ? (
            <div className="space-y-3">
              <div className="rounded-xl bg-white border border-[#E2E8F0] p-3">
                <div className="flex gap-1.5">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex-1 h-8 bg-gray-100 rounded-lg animate-pulse" />
                  ))}
                </div>
              </div>
              <div className="rounded-xl bg-white border border-[#E2E8F0] p-3">
                <div className="h-4 w-3/4 bg-gray-100 rounded animate-pulse mb-2" />
                <div className="h-3 w-full bg-gray-100 rounded animate-pulse mb-1" />
                <div className="h-3 w-2/3 bg-gray-100 rounded animate-pulse mb-3" />
                <div className="h-10 w-full bg-gray-100 rounded-lg animate-pulse" />
              </div>
            </div>
          ) : pdv ? (
            <>
              {/* Mochila summary */}
              <section className="rounded-xl bg-white border border-[#E2E8F0] p-3.5 shadow-sm">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-1.5">
                    <ShoppingBag className="w-4 h-4 text-[#DC2626]" />
                    <h2 className="text-xs font-bold text-[#0F172A]">Material restante</h2>
                  </div>
                  <span className="text-[8px] text-[#64748B]">
                    +{mochilaUsados.marcaPrecios + mochilaUsados.colgantes + mochilaUsados.cenefas} usados
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MochilaChip icon={Tags} label="MP" count={mochilaRestante.marcaPrecios} initial={initialMochila.marcaPrecios} />
                  <MochilaChip icon={Ticket} label="Colg" count={mochilaRestante.colgantes} initial={initialMochila.colgantes} />
                  <MochilaChip icon={Layout} label="Cen" count={mochilaRestante.cenefas} initial={initialMochila.cenefas} />
                </div>
              </section>

              {/* Current task */}
              {currentTask && (
                <section className="rounded-xl bg-white border border-[#E2E8F0] p-3.5 shadow-sm mt-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-[#DC2626] flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold text-white">{currentTaskIndex + 1}</span>
                    </div>
                    <h3 className="text-sm font-bold text-[#0F172A]">{currentTask.nombre}</h3>
                    {currentTask.required === false && (
                      <span className="text-[8px] text-[#64748B] bg-gray-100 px-1.5 py-0.5 rounded shrink-0">Opcional</span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#64748B] leading-relaxed">{currentTask.descripcion}</p>

                  {/* Numeric input */}
                  {currentTask.tipo === 'numeric' && (
                    <div className="mt-3">
                      <label className="text-[10px] font-semibold text-[#0F172A] block mb-1.5">
                        Precios tomados:
                      </label>
                      <div className="flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleNumericChange(Math.max(0, (numericValues[currentTask.id] ?? 0) - 1))}
                          className="w-11 h-11 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-lg font-bold text-[#0F172A] active:bg-gray-100 transition-colors"
                        >-</button>
                        <span className="w-16 text-center text-2xl font-bold text-[#0F172A]">
                          {numericValues[currentTask.id] ?? 0}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleNumericChange((numericValues[currentTask.id] ?? 0) + 1)}
                          className="w-11 h-11 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-lg font-bold text-[#0F172A] active:bg-gray-100 transition-colors"
                        >+</button>
                      </div>
                    </div>
                  )}

                  {/* Photo task — real file capture + upload */}
                  {currentTask.tipo === 'photo' && (
                    <div className="mt-3 space-y-2.5">
                      {/* Missing visitaId warning — cannot upload without backend visit ID */}
                      {!visitaId && (
                        <div className="flex items-start gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[10px] text-amber-700 font-semibold">Sin ID de visita</p>
                            <p className="text-[9px] text-amber-600 mt-0.5 leading-relaxed">
                              La foto no puede subirse al servidor. Volvé al PDV e iniciá la visita correctamente.
                            </p>
                          </div>
                        </div>
                      )}

                      <div>
                        <p className="text-[10px] font-semibold text-[#0F172A] mb-1.5">
                          {currentTask.photoSlot === 'before' ? 'Foto Antes' : 'Foto Después'}
                        </p>

                        {completedTasks.has(currentTask.id) ? (
                          /* Task already completed — show uploaded preview */
                          <div className="w-full h-[80px] rounded-lg border-2 border-[#22C55E] bg-green-50 flex items-center justify-center gap-2">
                            {currentPhotoPreview ? (
                              <img src={currentPhotoPreview} alt="foto subida" className="h-full w-full object-cover rounded-lg" />
                            ) : (
                              <>
                                <Check className="w-5 h-5 text-[#22C55E]" />
                                <span className="text-[10px] text-[#22C55E] font-semibold">Foto subida</span>
                              </>
                            )}
                          </div>
                        ) : isCurrentSlotUploading ? (
                          /* Uploading indicator */
                          <div className="w-full h-[80px] rounded-lg border-2 border-[#DC2626]/30 bg-red-50 flex flex-col items-center justify-center gap-1.5">
                            {currentPhotoPreview && (
                              <img src={currentPhotoPreview} alt="preview" className="absolute inset-0 w-full h-full object-cover rounded-lg opacity-40" />
                            )}
                            <div className="w-5 h-5 rounded-full border-2 border-[#DC2626] border-t-transparent animate-spin" />
                            <span className="text-[9px] text-[#DC2626] font-medium">Subiendo...</span>
                          </div>
                        ) : currentPhotoPreview && !visitaId ? (
                          /* Local preview only (no visitaId, upload was skipped) */
                          <div className="w-full h-[80px] rounded-lg border-2 border-amber-300 overflow-hidden">
                            <img src={currentPhotoPreview} alt="preview local" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          /* Camera button */
                          <button
                            type="button"
                            onClick={() => photoInputRef.current?.click()}
                            disabled={!visitaId || photoEvidence.uploading !== null}
                            className={cn(
                              'w-full h-[80px] rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1.5 transition-all',
                              !visitaId || photoEvidence.uploading !== null
                                ? 'border-[#CBD5E1] bg-gray-50 opacity-50 cursor-not-allowed'
                                : 'border-[#CBD5E1] bg-[#F8FAFC] active:bg-gray-100',
                            )}
                          >
                            <Camera className="w-5 h-5 text-[#94A3B8]" />
                            <span className="text-[9px] text-[#94A3B8]">Tap para tomar foto</span>
                          </button>
                        )}
                      </div>

                      {/* Upload result metadata */}
                      {currentPhotoResult && (
                        <div className="flex items-start gap-2 py-2 px-2.5 rounded-lg bg-green-50 border border-green-100">
                          <Check className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
                          <div className="space-y-0.5 min-w-0">
                            <p className="text-[10px] text-[#0F172A] font-semibold">Foto guardada en servidor</p>
                            <p className="text-[9px] text-[#64748B] font-mono truncate">{currentPhotoResult.foto_url}</p>
                            {currentPhotoResult.hash_sha256 && (
                              <p className="text-[9px] text-[#64748B] font-mono truncate">
                                SHA: {currentPhotoResult.hash_sha256.slice(0, 24)}…
                              </p>
                            )}
                            {currentPhotoResult.faces_detectadas !== undefined && (
                              <p className="text-[9px] text-[#0F172A] font-medium">
                                {currentPhotoResult.faces_detectadas} caras detectadas
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Toggle/numeric complete button (not shown for photo tasks) */}
                  {currentTask.tipo !== 'photo' && (
                    <button
                      type="button"
                      onClick={handleCompleteTask}
                      disabled={completedTasks.has(currentTask.id)}
                      className={cn(
                        'w-full h-11 rounded-xl flex items-center justify-center gap-1.5 text-white text-xs font-bold mt-3 transition-all',
                        completedTasks.has(currentTask.id)
                          ? 'bg-[#22C55E] cursor-default'
                          : 'bg-[#DC2626] active:bg-[#B91C1C] shadow-sm shadow-red-200',
                      )}
                    >
                      {completedTasks.has(currentTask.id) ? (
                        <><Check className="w-3.5 h-3.5" /> Completada</>
                      ) : 'Completar tarea'}
                    </button>
                  )}
                </section>
              )}

              {/* Progress bar */}
              <section className="mt-3 px-1">
                <div className="flex items-center gap-1.5">
                  {tasks.map((task, idx) => (
                    <div
                      key={task.id}
                      className={cn(
                        'h-1.5 flex-1 rounded-full transition-all duration-300',
                        completedTasks.has(task.id)
                          ? 'bg-[#DC2626]'
                          : idx === currentTaskIndex
                            ? 'bg-[#DC2626]/50'
                            : 'bg-[#E2E8F0]',
                      )}
                    />
                  ))}
                </div>
                <p className="text-[9px] text-[#64748B] text-center mt-1">
                  {completedTasks.size} de {tasks.length} · {progressPercent}%
                </p>
              </section>

              {/* All tasks overview */}
              <section className="rounded-xl bg-white border border-[#E2E8F0] p-3.5 shadow-sm mt-3">
                <h3 className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider mb-2">
                  Todas las tareas
                </h3>
                <div className="space-y-1">
                  {tasks.map((task, idx) => (
                    <div
                      key={task.id}
                      className={cn(
                        'flex items-center gap-2.5 py-1.5 px-2 rounded-lg',
                        completedTasks.has(task.id) && 'bg-green-50',
                        idx === currentTaskIndex && !completedTasks.has(task.id) && 'bg-red-50',
                      )}
                    >
                      <div className={cn(
                        'w-5 h-5 rounded-full flex items-center justify-center shrink-0',
                        completedTasks.has(task.id) ? 'bg-[#22C55E]' : 'bg-gray-100',
                      )}>
                        {completedTasks.has(task.id) ? (
                          <Check className="w-3 h-3 text-white" />
                        ) : (
                          <span className="text-[8px] font-bold text-[#64748B]">{idx + 1}</span>
                        )}
                      </div>
                      <span className={cn(
                        'text-[11px] flex-1 leading-tight',
                        completedTasks.has(task.id)
                          ? 'text-[#22C55E] line-through'
                          : idx === currentTaskIndex
                            ? 'text-[#DC2626] font-semibold'
                            : 'text-[#0F172A]',
                      )}>
                        {task.nombre}
                      </span>
                      {task.required === false && (
                        <span className="text-[7px] text-[#94A3B8]">opcional</span>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </>
          ) : (
            <ErrorState title="PDV no encontrado" message="No se encontró el punto de venta." fullScreen={false} />
          )}
        </main>

        <BottomNav />

        <div className="shrink-0 bg-white border-t border-[#E2E8F0] px-4 pt-2.5 pb-[max(8px,env(safe-area-inset-bottom))]">
          {allRequiredCompleted ? (
            <button
              type="button"
              onClick={handleCloseVisit}
              className="w-full h-12 rounded-xl bg-[#DC2626] active:bg-[#B91C1C] flex items-center justify-center gap-2 text-white text-sm font-bold shadow-sm shadow-red-200 transition-all"
            >
              <Check className="w-4 h-4" />
              Cerrar visita
            </button>
          ) : (
            <div className="flex flex-col items-center justify-center h-12 rounded-xl bg-[#DC2626]/30 gap-0.5">
              <span className="text-[#DC2626]/80 text-xs font-bold">Completá las tareas requeridas</span>
              <span className="text-[#DC2626]/60 text-[9px]">
                {tasks.filter(t => t.required !== false && !completedTasks.has(t.id)).length} pendientes
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
