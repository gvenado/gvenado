import { useState, useMemo } from 'react'
import {
  Users,
  AlertTriangle,
  TrendingUp,
  Target,
  X,
  ChevronRight,
  ArrowUp,
  CheckCircle,
} from 'lucide-react'
import { DashboardLayout } from '@/dashboard/layouts/DashboardLayout'
import { useGaleria } from '@/dashboard/hooks/useGaleria'
import { EvidenceCard } from '@/dashboard/components/EvidenceCard'
import { ComplianceChart } from '@/dashboard/components/ComplianceChart'
import { ImprovementRanking } from '@/dashboard/components/ImprovementRanking'
import { GalleryFilters } from '@/dashboard/components/GalleryFilters'
import type { EvidenceCardData, ComplianceItem, ImprovementItem } from '@/dashboard/types'

const COMPLIANCE_DATA: ComplianceItem[] = [
  { label: 'Shelf Installed', percentage: 96, color: '#16A34A' },
  { label: 'Hanging Material OK', percentage: 93, color: '#2563EB' },
  { label: 'Visible Prices', percentage: 90, color: '#F59E0B' },
  { label: 'Order & Facing', percentage: 88, color: '#DC2626' },
  { label: 'Stock Availability', percentage: 83, color: '#6B7280' },
]

const RANKING_DATA: ImprovementItem[] = [
  { code: 'GV112', name: 'Súper Ahorro', facesGained: 9 },
  { code: 'GV078', name: 'Minimarket Central', facesGained: 7 },
  { code: 'GV045', name: 'Tienda Los Andes', facesGained: 6 },
]

export function GaleriaPage() {
  const { evidence, loading } = useGaleria()
  const [filterReplenisher, setFilterReplenisher] = useState('all')
  const [filterDate, setFilterDate] = useState('23/05/2025')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceCardData | null>(null)

  const filteredEvidence = useMemo(() => {
    return evidence.filter(ev => {
      if (filterReplenisher !== 'all' && ev.replenisher !== filterReplenisher) return false
      if (filterStatus === 'completed' && !ev.tags.some(t => t.type === 'success')) return false
      if (filterStatus === 'improved' && !ev.tags.some(t => t.label === 'Improved')) return false
      if (filterStatus === 'stock_break' && !ev.tags.some(t => t.type === 'error')) return false
      return true
    })
  }, [evidence, filterReplenisher, filterStatus])

  function clearFilters() {
    setFilterReplenisher('all')
    setFilterDate('23/05/2025')
    setFilterStatus('all')
  }

  return (
    <DashboardLayout currentPage="Galería IA">
      <div className="p-6 space-y-5">
        {/* KPI Row */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm p-4 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">Faces Gained Today</p>
                <p className="text-2xl font-bold text-[#111827] mt-0.5">128</p>
                <p className="text-xs text-[#16A34A] font-medium mt-0.5 flex items-center gap-0.5">
                  <ArrowUp className="w-3 h-3" />
                  vs yesterday +18%
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
                <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">% Visits With Evidence</p>
                <p className="text-2xl font-bold text-[#111827] mt-0.5">94%</p>
                <p className="text-xs text-[#16A34A] font-medium mt-0.5 flex items-center gap-0.5">
                  <ArrowUp className="w-3 h-3" />
                  vs yesterday +6 pp
                </p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-[#16A34A]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm p-4 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">Detected Stock Breaks</p>
                <p className="text-2xl font-bold text-[#111827] mt-0.5">5</p>
                <p className="text-xs text-[#16A34A] font-medium mt-0.5 flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3 rotate-180" />
                  vs yesterday -2
                </p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm p-4 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">Checklist Completed</p>
                <p className="text-2xl font-bold text-[#111827] mt-0.5">92%</p>
                <p className="text-xs text-[#16A34A] font-medium mt-0.5 flex items-center gap-0.5">
                  <ArrowUp className="w-3 h-3" />
                  vs yesterday +7 pp
                </p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-[#6B7280]" />
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
          {/* AI Gallery Evidence Grid */}
          <div className="col-span-12 lg:col-span-7">
            {loading ? (
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => (
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
              <div className="grid grid-cols-2 gap-4">
                {filteredEvidence.map(ev => (
                  <EvidenceCard
                    key={ev.id}
                    evidence={ev}
                    onClick={() => setSelectedEvidence(ev)}
                  />
                ))}
                {filteredEvidence.length === 0 && (
                  <div className="col-span-2 flex items-center justify-center h-48 text-sm text-[#6B7280] bg-white rounded-xl border border-[#E5E7EB]">
                    No evidence matches the current filters.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Analytics Panel */}
          <div className="col-span-12 lg:col-span-5 space-y-4">
            <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-5">
              <h3 className="text-sm font-bold text-[#111827] mb-3">Compliance By Microtask</h3>
              <ComplianceChart
                data={COMPLIANCE_DATA}
                centerValue="90%"
                centerLabel="Average"
              />
            </div>

            <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-5">
              <h3 className="text-sm font-bold text-[#111827] mb-0.5">Top Improvements</h3>
              <ImprovementRanking
                items={RANKING_DATA}
                onViewAll={() => {}}
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
                <p><span className="font-medium text-[#111827]">Replenisher:</span> {selectedEvidence.replenisher}</p>
                <p><span className="font-medium text-[#111827]">Time:</span> {selectedEvidence.time}</p>
                <p><span className="font-medium text-[#111827]">Faces Gained:</span> <span className="font-bold text-[#16A34A]">+{selectedEvidence.facesGained}</span></p>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
