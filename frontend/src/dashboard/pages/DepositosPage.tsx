import { useState, useCallback } from 'react'
import { AlertTriangle, PackageOpen, Warehouse, History, Lightbulb } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DashboardLayout } from '@/dashboard/layouts/DashboardLayout'
import { KPICard } from '@/dashboard/components/KPICard'
import { WarehouseStatusTable } from '@/dashboard/components/WarehouseStatusTable'
import { AlertDetailPanel } from '@/dashboard/components/AlertDetailPanel'
import { TransferSuggestionModal } from '@/dashboard/components/TransferSuggestionModal'
import { Toast } from '@/dashboard/components/Toast'
import { useWarehouses } from '@/dashboard/hooks/useWarehouses'

export function DepositosPage() {
  const { warehouses, selectedWarehouse, selectedId, selectWarehouse, kpis } = useWarehouses()
  const [modalOpen, setModalOpen] = useState(false)
  const [detailTab, setDetailTab] = useState<'alerts' | 'history'>('alerts')
  const [toast, setToast] = useState<{ visible: boolean; type: 'success' | 'error' | 'info'; title: string; message?: string }>({
    visible: false, type: 'success', title: '',
  })

  const showToast = useCallback((type: 'success' | 'error' | 'info', title: string, message?: string) => {
    setToast({ visible: true, type, title, message })
  }, [])

  const closeToast = useCallback(() => {
    setToast(prev => ({ ...prev, visible: false }))
  }, [])

  const handleSuggestTransfer = useCallback(() => {
    setModalOpen(true)
  }, [])

  const handleConfirmTransfer = useCallback(() => {
    setModalOpen(false)
    showToast('success', 'Sugerencia de traslado generada correctamente')
  }, [showToast])

  const handleCancelTransfer = useCallback(() => {
    setModalOpen(false)
  }, [])

  return (
    <DashboardLayout currentPage="Depósitos POP">
      <div className="p-6 space-y-6">
        {/* ===== KPI ROW ===== */}
        <div className="grid grid-cols-3 gap-4">
          <KPICard
            label="Depósitos en alerta"
            value={String(kpis.warehousesInAlert)}
            icon={<AlertTriangle className="w-5 h-5" />}
            iconBgClass="bg-[#F59E0B]"
          />
          <KPICard
            label="Materiales críticos"
            value={String(kpis.criticalMaterials)}
            icon={<PackageOpen className="w-5 h-5" />}
            iconBgClass="bg-[#DC2626]"
          />
          <KPICard
            label="Stock POP total"
            value="12,480"
            trend="Unidades"
            icon={<Warehouse className="w-5 h-5" />}
            iconBgClass="bg-[#2563EB]"
          />
        </div>

        {/* ===== MAIN CONTENT ===== */}
        <div className="grid grid-cols-12 gap-4">
          {/* LEFT - Warehouse Status */}
          <div className="col-span-7">
            <WarehouseStatusTable
              warehouses={warehouses}
              selectedId={selectedId}
              onSelect={selectWarehouse}
            />
          </div>

          {/* RIGHT - Tabbed Detail Panel */}
          <div className="col-span-5">
            <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
              <div className="flex border-b border-[#E5E7EB]">
                <button
                  onClick={() => setDetailTab('alerts')}
                  className={cn(
                    'flex-1 px-3 py-2.5 text-[11px] font-semibold text-center transition-colors',
                    detailTab === 'alerts'
                      ? 'text-[#DC2626] border-b-2 border-[#DC2626] bg-white'
                      : 'text-[#6B7280] hover:text-[#111827] bg-gray-50/50'
                  )}
                >
                  Alertas y materiales
                </button>
                <button
                  onClick={() => setDetailTab('history')}
                  className={cn(
                    'flex-1 px-3 py-2.5 text-[11px] font-semibold text-center transition-colors',
                    detailTab === 'history'
                      ? 'text-[#DC2626] border-b-2 border-[#DC2626] bg-white'
                      : 'text-[#6B7280] hover:text-[#111827] bg-gray-50/50'
                  )}
                >
                  <History className="w-3 h-3 inline mr-1" />
                  Historial de consumo
                </button>
              </div>
              {detailTab === 'alerts' ? (
                <AlertDetailPanel
                  warehouse={selectedWarehouse}
                  onSuggestTransfer={handleSuggestTransfer}
                />
              ) : (
                <div className="p-5 text-center text-xs text-[#6B7280]">
                  <History className="w-8 h-8 mx-auto mb-2 text-[#E5E7EB]" />
                  <p>Gráfico de consumo histórico próximo a integrar.</p>
                  <p className="text-[10px] mt-1">Los datos estarán disponibles en la fase de integración backend.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ===== SYSTEM RECOMMENDATIONS ===== */}
        <div className="bg-[#FFFBEB] rounded-xl border border-[#FDE68A] shadow-sm px-5 py-4">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-[#F59E0B]" />
            <h3 className="text-sm font-bold text-[#111827]">Recomendaciones del sistema</h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-lg border border-[#E5E7EB] p-3">
              <p className="text-[11px] font-semibold text-[#111827]">Depósito Sur</p>
              <p className="text-[10px] text-[#6B7280] mt-0.5">Stock por debajo del 30% en SKUs de alta rotación. Considerar reabastecimiento urgente.</p>
            </div>
            <div className="bg-white rounded-lg border border-[#E5E7EB] p-3">
              <p className="text-[11px] font-semibold text-[#111827]">Depósito Norte</p>
              <p className="text-[10px] text-[#6B7280] mt-0.5">Excedente de 15% en material POP. Sugerir redistribución a depósitos con alerta.</p>
            </div>
            <div className="bg-white rounded-lg border border-[#E5E7EB] p-3">
              <p className="text-[11px] font-semibold text-[#111827]">Depósito Central</p>
              <p className="text-[10px] text-[#6B7280] mt-0.5">Rotación de inventario dentro del rango óptimo. Sin acciones requeridas.</p>
            </div>
          </div>
        </div>
      </div>

      <TransferSuggestionModal
        open={modalOpen}
        onConfirm={handleConfirmTransfer}
        onCancel={handleCancelTransfer}
      />
      <Toast visible={toast.visible} type={toast.type} title={toast.title} message={toast.message} onClose={closeToast} />
    </DashboardLayout>
  )
}
