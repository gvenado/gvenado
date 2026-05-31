import { useState, useCallback } from 'react'
import { AlertTriangle, PackageOpen, Warehouse } from 'lucide-react'
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
    showToast('success', 'Transfer Suggestion Generated Successfully')
  }, [showToast])

  const handleCancelTransfer = useCallback(() => {
    setModalOpen(false)
  }, [])

  return (
    <DashboardLayout currentPage="POP Warehouses">
      <div className="p-6 space-y-6">
        {/* ===== KPI ROW ===== */}
        <div className="grid grid-cols-3 gap-4">
          <KPICard
            label="Warehouses in Alert"
            value={String(kpis.warehousesInAlert)}
            icon={<AlertTriangle className="w-5 h-5" />}
            iconBgClass="bg-[#F59E0B]"
          />
          <KPICard
            label="Critical Materials"
            value={String(kpis.criticalMaterials)}
            icon={<PackageOpen className="w-5 h-5" />}
            iconBgClass="bg-[#DC2626]"
          />
          <KPICard
            label="Total POP Stock"
            value="12,480"
            trend="Units"
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

          {/* RIGHT - Alert Detail */}
          <div className="col-span-5">
            <AlertDetailPanel
              warehouse={selectedWarehouse}
              onSuggestTransfer={handleSuggestTransfer}
            />
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
