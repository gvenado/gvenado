import { RotateCcw } from 'lucide-react'

interface GalleryFiltersProps {
  replenisher: string
  date: string
  status: string
  onReplenisherChange: (v: string) => void
  onDateChange: (v: string) => void
  onStatusChange: (v: string) => void
  onClear: () => void
}

export function GalleryFilters({
  replenisher, date, status,
  onReplenisherChange, onDateChange, onStatusChange, onClear,
}: GalleryFiltersProps) {
  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm px-5 py-3 flex items-center gap-4">
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-[#6B7280] whitespace-nowrap">Replenisher</label>
        <select
          value={replenisher}
          onChange={e => onReplenisherChange(e.target.value)}
          className="text-xs border border-[#E5E7EB] rounded-md px-3 py-1.5 text-[#111827] bg-white outline-none focus:border-[#DC2626] appearance-none"
        >
          <option value="all">All</option>
          <option value="Rep 1">Rep 1</option>
          <option value="Rep 2">Rep 2</option>
          <option value="Rep 3">Rep 3</option>
          <option value="Rep 4">Rep 4</option>
          <option value="Rep 5">Rep 5</option>
          <option value="Rep 6">Rep 6</option>
          <option value="Rep 7">Rep 7</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-[#6B7280] whitespace-nowrap">Date</label>
        <input
          type="text"
          value={date}
          onChange={e => onDateChange(e.target.value)}
          className="text-xs border border-[#E5E7EB] rounded-md px-3 py-1.5 text-[#111827] bg-white outline-none focus:border-[#DC2626] w-[110px]"
        />
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-[#6B7280] whitespace-nowrap">Status</label>
        <select
          value={status}
          onChange={e => onStatusChange(e.target.value)}
          className="text-xs border border-[#E5E7EB] rounded-md px-3 py-1.5 text-[#111827] bg-white outline-none focus:border-[#DC2626] appearance-none"
        >
          <option value="all">All</option>
          <option value="completed">Completed</option>
          <option value="improved">Improved</option>
          <option value="stock_break">Stock Break</option>
        </select>
      </div>

      <button
        onClick={onClear}
        className="text-xs font-semibold text-[#DC2626] hover:text-[#B91C1C] transition-colors flex items-center gap-1 ml-auto"
      >
        <RotateCcw className="w-3 h-3" />
        Clear Filters
      </button>
    </div>
  )
}
