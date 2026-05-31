import { useRef, useState } from 'react'
import { Upload, Loader2, AlertCircle, X, ShieldCheck, Eye, Tag } from 'lucide-react'
import { api } from '@/api/client'
import type { VisionAnalysisResult } from '@/api/client'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE_MB = 10

interface VisionUploadPanelProps {
  onAnalyzed?: (result: VisionAnalysisResult, localUrl: string) => void
}

export function VisionUploadPanel({ onAnalyzed }: VisionUploadPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<VisionAnalysisResult | null>(null)
  const [localUrl, setLocalUrl] = useState<string | null>(null)

  function triggerPick() {
    inputRef.current?.click()
  }

  function handleFile(file: File) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Formato no válido. Usa JPG, PNG o WebP.')
      setStatus('error')
      return
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`El archivo supera los ${MAX_SIZE_MB} MB.`)
      setStatus('error')
      return
    }

    if (localUrl) URL.revokeObjectURL(localUrl)
    const preview = URL.createObjectURL(file)
    setLocalUrl(preview)
    setStatus('loading')
    setError(null)
    setResult(null)

    api.analyzeImage(file)
      .then(res => {
        setResult(res)
        setStatus('idle')
        onAnalyzed?.(res, preview)
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err)
        if (msg.toLowerCase().includes('failed to fetch') || msg.toLowerCase().includes('networkerror')) {
          setError('Backend no disponible. Verifica que el servidor esté corriendo.')
        } else if (msg.includes('413')) {
          setError('Imagen demasiado grande para el servidor.')
        } else {
          setError(`Error al analizar: ${msg}`)
        }
        setStatus('error')
      })
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  function reset() {
    setStatus('idle')
    setError(null)
    setResult(null)
    if (localUrl) { URL.revokeObjectURL(localUrl); setLocalUrl(null) }
  }

  const a = result?.analysis

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-4 space-y-3">
      {/* Single always-mounted input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleInputChange}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
            <Eye className="w-4 h-4 text-[#2563EB]" />
          </div>
          <span className="text-sm font-bold text-[#111827]">Análisis IA — Imagen real</span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-[#2563EB]">LIVE</span>
        </div>
        {(result || status === 'error') && (
          <button
            onClick={reset}
            className="w-6 h-6 rounded-md border border-[#E5E7EB] flex items-center justify-center text-[#6B7280] hover:bg-gray-50 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Upload zone — only when no result */}
      {!result && (
        <div
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => status === 'idle' && triggerPick()}
          className={[
            'border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 py-6 transition-colors',
            status === 'loading' ? 'border-blue-200 bg-blue-50/50 cursor-default' :
            status === 'error'   ? 'border-red-200 bg-red-50/30 cursor-pointer' :
                                   'border-[#E5E7EB] hover:border-[#2563EB] hover:bg-blue-50/20 cursor-pointer',
          ].join(' ')}
        >
          {status === 'loading' && (
            <>
              <Loader2 className="w-6 h-6 text-[#2563EB] animate-spin" />
              {localUrl && (
                <img src={localUrl} alt="preview" className="w-24 h-16 object-cover rounded-md border border-[#E5E7EB]" />
              )}
              <p className="text-xs text-[#6B7280]">Analizando imagen…</p>
            </>
          )}

          {status === 'error' && (
            <>
              <AlertCircle className="w-6 h-6 text-[#DC2626]" />
              <p className="text-xs text-[#DC2626] font-medium text-center px-4">{error}</p>
              <button
                onClick={e => { e.stopPropagation(); reset() }}
                className="text-[10px] text-[#6B7280] hover:text-[#111827] underline"
              >
                Intentar de nuevo
              </button>
            </>
          )}

          {status === 'idle' && (
            <>
              <Upload className="w-5 h-5 text-[#6B7280]" />
              <p className="text-xs text-[#111827] font-medium">Arrastrar o seleccionar imagen</p>
              <p className="text-[10px] text-[#6B7280]">JPG, PNG, WebP · máx {MAX_SIZE_MB} MB</p>
            </>
          )}
        </div>
      )}

      {/* Result card */}
      {result && localUrl && (
        <div className="flex gap-3">
          <img
            src={localUrl}
            alt="Imagen analizada"
            className="w-28 h-20 object-cover rounded-lg border border-[#E5E7EB] shrink-0"
          />
          <div className="flex-1 min-w-0 space-y-1.5">
            {a?.descripcion && (
              <p className="text-xs text-[#111827] font-medium leading-snug">{a.descripcion}</p>
            )}

            <div className="flex flex-wrap gap-1.5">
              {a?.faces_detectadas !== undefined && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-[#2563EB]">
                  <Eye className="w-3 h-3" />{a.faces_detectadas} caras
                </span>
              )}
              {a?.faces_ganadas !== undefined && a.faces_ganadas > 0 && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-green-50 text-[#16A34A]">
                  +{a.faces_ganadas} ganadas
                </span>
              )}
              {a?.estado_orden && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-gray-50 text-[#6B7280]">
                  <Tag className="w-3 h-3" />{a.estado_orden}
                </span>
              )}
            </div>

            {(a?.marca_precios_instalados !== undefined ||
              a?.colgantes_instalados !== undefined ||
              a?.cenefas_instaladas !== undefined) && (
              <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                {a?.marca_precios_instalados !== undefined && (
                  <span className="text-[10px] text-[#6B7280]">
                    Marca precios: <span className="font-semibold text-[#111827]">{a.marca_precios_instalados}</span>
                  </span>
                )}
                {a?.colgantes_instalados !== undefined && (
                  <span className="text-[10px] text-[#6B7280]">
                    Colgantes: <span className="font-semibold text-[#111827]">{a.colgantes_instalados}</span>
                  </span>
                )}
                {a?.cenefas_instaladas !== undefined && (
                  <span className="text-[10px] text-[#6B7280]">
                    Cenefas: <span className="font-semibold text-[#111827]">{a.cenefas_instaladas}</span>
                  </span>
                )}
              </div>
            )}

            <div className="flex items-center gap-1 pt-0.5">
              <ShieldCheck className="w-3 h-3 text-[#6B7280] shrink-0" />
              <span className="text-[9px] text-[#9CA3AF] font-mono truncate" title={result.hash_sha256}>
                SHA256: {result.hash_sha256.slice(0, 16)}…
              </span>
              <span className="text-[9px] text-[#9CA3AF] ml-auto shrink-0">
                {new Date(result.timestamp).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>
      )}

      {result && (
        <button
          onClick={triggerPick}
          className="w-full text-[11px] text-[#2563EB] hover:text-[#1D4ED8] font-medium text-center py-1.5 border border-dashed border-blue-200 rounded-lg hover:bg-blue-50/30 transition-colors"
        >
          Analizar otra imagen
        </button>
      )}
    </div>
  )
}
