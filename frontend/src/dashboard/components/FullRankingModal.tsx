import { useState, useEffect, useRef, useMemo } from 'react'
import { X, Search, ChevronUp, ChevronDown } from 'lucide-react'
import type { ImprovementItem } from '@/dashboard/types'

interface FullRankingModalProps {
  open: boolean
  items: ImprovementItem[]
  onClose: () => void
}

const PAGE_SIZE = 10

export function FullRankingModal({ open, items, onClose }: FullRankingModalProps) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [sortAsc, setSortAsc] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  useEffect(() => {
    setPage(1)
    setSearch('')
  }, [open])

  if (!open) return null

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    const f = items.filter(item =>
      item.code.toLowerCase().includes(q) ||
      item.name.toLowerCase().includes(q) ||
      item.replenisher.toLowerCase().includes(q)
    )
    f.sort((a, b) => sortAsc ? a.facesGained - b.facesGained : b.facesGained - a.facesGained)
    return f
  }, [items, search, sortAsc])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * PAGE_SIZE
  const pageItems = filtered.slice(start, start + PAGE_SIZE)

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={e => { if (e.target === overlayRef.current) onClose() }}
    >
      <div className="bg-white rounded-xl shadow-xl border border-[#E5E7EB] w-full max-w-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E5E7EB] shrink-0">
          <h3 className="text-sm font-bold text-[#111827]">Ranking completo de mejoras</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md border border-[#E5E7EB] flex items-center justify-center text-[#6B7280] hover:bg-gray-50 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 pt-3 pb-2 shrink-0">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6B7280]" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por PDV, código o reponedor..."
              className="w-full text-xs border border-[#E5E7EB] rounded-md pl-8 pr-3 py-2 text-[#111827] bg-white outline-none focus:border-[#DC2626]"
            />
          </div>
        </div>

        {/* Column headers */}
        <div className="px-5 py-1.5 grid grid-cols-12 gap-2 text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider shrink-0">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-4">PDV</div>
          <div className="col-span-2 text-right">
            <button
              onClick={() => setSortAsc(!sortAsc)}
              className="inline-flex items-center gap-0.5 hover:text-[#111827] transition-colors"
            >
              Caras
              {sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
          <div className="col-span-2 text-right">Reponedor</div>
          <div className="col-span-3 text-right">Fecha</div>
        </div>

        {/* Rows */}
        <div className="flex-1 overflow-y-auto px-5">
          {pageItems.length === 0 ? (
            <div className="flex items-center justify-center h-24 text-xs text-[#6B7280]">
              No se encontraron resultados.
            </div>
          ) : (
            <div className="divide-y divide-[#E5E7EB]">
              {pageItems.map((item, i) => {
                const pos = start + i + 1
                return (
                  <div key={item.code} className="grid grid-cols-12 gap-2 py-2.5 text-xs items-center">
                    <div className="col-span-1 text-center">
                      <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
                        <span className="text-[10px] font-bold text-[#6B7280]">{pos}</span>
                      </div>
                    </div>
                    <div className="col-span-4">
                      <span className="font-semibold text-[#111827]">{item.code}</span>
                      <span className="text-[#6B7280]"> - {item.name}</span>
                    </div>
                    <div className="col-span-2 text-right font-bold text-[#16A34A]">+{item.facesGained}</div>
                    <div className="col-span-2 text-right text-[#6B7280]">{item.replenisher}</div>
                    <div className="col-span-3 text-right text-[#6B7280]">{item.date}</div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-[#E5E7EB] shrink-0">
          <p className="text-[10px] text-[#6B7280]">
            {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage(safePage - 1)}
              disabled={safePage <= 1}
              className="px-2.5 py-1 text-[10px] font-semibold rounded-md border border-[#E5E7EB] text-[#6B7280] hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>
            <span className="text-[10px] text-[#6B7280] px-2">
              {safePage} / {totalPages}
            </span>
            <button
              onClick={() => setPage(safePage + 1)}
              disabled={safePage >= totalPages}
              className="px-2.5 py-1 text-[10px] font-semibold rounded-md border border-[#E5E7EB] text-[#6B7280] hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
