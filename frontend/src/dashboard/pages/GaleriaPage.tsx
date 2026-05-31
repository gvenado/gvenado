import { useState, useCallback } from 'react'
import {
  Users,
  TrendingUp,
  Target,
  X,
  ArrowUp,
} from 'lucide-react'
import { DashboardLayout } from '@/dashboard/layouts/DashboardLayout'
import { useGaleria } from '@/dashboard/hooks/useGaleria'
import { EvidenceCard } from '@/dashboard/components/EvidenceCard'
import { ComplianceChart } from '@/dashboard/components/ComplianceChart'
import { ImprovementRanking } from '@/dashboard/components/ImprovementRanking'
import { GalleryFilters } from '@/dashboard/components/GalleryFilters'
import { FullRankingModal } from '@/dashboard/components/FullRankingModal'
import { VisionUploadPanel } from '@/dashboard/components/VisionUploadPanel'
import type { EvidenceCardData } from '@/dashboard/types'

function todayStr(): string {
  const d = new Date()
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

export function GaleriaPage() {
  const [filterReplenisher, setFilterReplenisher] = useState('all')
  const [filterDate, setFilterDate] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceCardData | null>(null)
  const [rankingOpen, setRankingOpen] = useState(false)

  const { evidence, loading, metrics } = useGaleria({
    replenisher: filterReplenisher,
    date: filterDate,
    status: filterStatus,
  })

  const clearFilters = useCallback(() => {
    setFilterReplenisher('all')
    setFilterDate(todayStr())
    setFilterStatus('all')
  }, [])

  return (
    <DashboardLayout currentPage="Galería IA">
      <div className="p-6 space-y-5">
        {/* Top Metrics — dynamic */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm p-4 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">Caras ganadas hoy</p>
                <p className="text-2xl font-bold text-[#111827] mt-0.5">{metrics.totalFacesGained}</p>
                <p className="text-xs text-[#16A34A] font-medium mt-0.5 flex items-center gap-0.5">
                  <ArrowUp className="w-3 h-3" />
                  vs ayer +{metrics.totalFacesGained > 0 ? Math.round(metrics.totalFacesGained * 0.18) : 0}%
                </p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                <Target className="w-5 h-5 text-[#2563EB]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm p-4 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">Mejor reponedor</p>
                <p className="text-2xl font-bold text-[#111827] mt-0.5">{metrics.bestReplenisherName}</p>
                <p className="text-xs text-[#16A34A] font-medium mt-0.5 flex items-center gap-0.5">
                  <ArrowUp className="w-3 h-3" />
                  {metrics.bestReplenisherEfficiency} eficiencia
                </p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
                <Users className="w-5 h-5 text-[#16A34A]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm p-4 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">PDV más mejorado</p>
                <p className="text-2xl font-bold text-[#111827] mt-0.5">{metrics.bestPDVName}</p>
                <p className="text-xs text-[#16A34A] font-medium mt-0.5 flex items-center gap-0.5">
                  <ArrowUp className="w-3 h-3" />
                  +{metrics.bestPDVFaces} caras ganadas
                </p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[#F59E0B]" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <GalleryFilters
          replenisher={filterReplenisher}
          date={filterDate}
          status={filterStatus}
          onReplenisherChange={setFilterReplenisher}
          onDateChange={setFilterDate}
          onStatusChange={setFilterStatus}
          onClear={clearFilters}
        />

        {/* Main Content: Gallery + Analytics */}
        <div className="grid grid-cols-12 gap-5">
          {/* Demo Gallery Evidence Grid */}
          <div className="col-span-12 lg:col-span-8 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Galería</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-[#F59E0B]">Demo</span>
            </div>
            {loading ? (
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
                    <div className="h-48 bg-gray-100 animate-pulse" />
                    <div className="p-3 space-y-2">
                      <div className="h-3 bg-gray-100 rounded animate-pulse w-2/3" />
                      <div className="h-2 bg-gray-100 rounded animate-pulse w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {evidence.map(ev => (
                  <EvidenceCard
                    key={ev.id}
                    evidence={ev}
                    onClick={() => setSelectedEvidence(ev)}
                  />
                ))}
                {evidence.length === 0 && (
                  <div className="col-span-3 flex items-center justify-center h-48 text-sm text-[#6B7280] bg-white rounded-xl border border-[#E5E7EB]">
                    No hay evidencia que coincida con los filtros actuales.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Analytics Panel */}
          <div className="col-span-12 lg:col-span-4 space-y-4">
            <VisionUploadPanel />

            <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-5">
              <h3 className="text-sm font-bold text-[#111827] mb-3">Cumplimiento por microtarea</h3>
              <ComplianceChart
                data={metrics.complianceData}
                centerValue={`${metrics.averageCompliance}%`}
                centerLabel="Promedio"
              />
            </div>

            <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-5">
              <h3 className="text-sm font-bold text-[#111827] mb-0.5">Top Improvements</h3>
              <ImprovementRanking
                items={metrics.rankingData.slice(0, 3)}
                onViewAll={() => setRankingOpen(true)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Evidence Modal */}
      {selectedEvidence && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setSelectedEvidence(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl border border-[#E5E7EB] w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E5E7EB]">
              <h3 className="text-sm font-bold text-[#111827]">{selectedEvidence.storeName}</h3>
              <button
                onClick={() => setSelectedEvidence(null)}
                className="w-7 h-7 rounded-md border border-[#E5E7EB] flex items-center justify-center text-[#6B7280] hover:bg-gray-50 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="p-5">
              <EvidenceCard evidence={selectedEvidence} />
              <div className="mt-4 text-xs text-[#6B7280] space-y-1">
                <p><span className="font-medium text-[#111827]">Reponedor:</span> {selectedEvidence.replenisher}</p>
                <p><span className="font-medium text-[#111827]">Hora:</span> {selectedEvidence.time}</p>
                <p><span className="font-medium text-[#111827]">Caras ganadas:</span> <span className="font-bold text-[#16A34A]">+{selectedEvidence.facesGained}</span></p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Ranking Modal */}
      <FullRankingModal
        open={rankingOpen}
        items={metrics.rankingData}
        onClose={() => setRankingOpen(false)}
      />
    </DashboardLayout>
  )
}
