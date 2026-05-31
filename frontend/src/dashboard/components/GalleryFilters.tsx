import { useState, useCallback } from 'react'
import { RotateCcw, Calendar } from 'lucide-react'
import { DatePickerCalendar } from './DatePickerCalendar'

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
  const [calendarOpen, setCalendarOpen] = useState(false)

  const handleClear = useCallback(() => {
    onClear()
  }, [onClear])

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm px-5 py-3 flex items-center gap-4">
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-[#6B7280] whitespace-nowrap">Reponedor</label>
        <select
          value={replenisher}
          onChange={e => onReplenisherChange(e.target.value)}
          className="text-xs border border-[#E5E7EB] rounded-md px-3 py-1.5 text-[#111827] bg-white outline-none focus:border-[#DC2626] appearance-none"
        >
          <option value="all">Todos</option>
          <option value="Rep 1">Rep 1</option>
          <option value="Rep 2">Rep 2</option>
          <option value="Rep 3">Rep 3</option>
          <option value="Rep 4">Rep 4</option>
          <option value="Rep 5">Rep 5</option>
          <option value="Rep 6">Rep 6</option>
          <option value="Rep 7">Rep 7</option>
        </select>
      </div>

      <div className="flex items-center gap-2 relative">
        <label className="text-xs font-medium text-[#6B7280] whitespace-nowrap">Fecha</label>
        <button
          onClick={() => setCalendarOpen(!calendarOpen)}
          className="text-xs border border-[#E5E7EB] rounded-md px-3 py-1.5 text-[#111827] bg-white outline-none focus:border-[#DC2626] flex items-center gap-1.5 w-[120px]"
        >
          <Calendar className="w-3 h-3 text-[#6B7280] shrink-0" />
          <span>{date}</span>
        </button>
        {calendarOpen && (
          <DatePickerCalendar
            value={date}
            onChange={onDateChange}
            onClose={() => setCalendarOpen(false)}
          />
        )}
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-[#6B7280] whitespace-nowrap">Estado</label>
        <select
          value={status}
          onChange={e => onStatusChange(e.target.value)}
          className="text-xs border border-[#E5E7EB] rounded-md px-3 py-1.5 text-[#111827] bg-white outline-none focus:border-[#DC2626] appearance-none"
        >
          <option value="all">Todos</option>
          <option value="completed">Completado</option>
          <option value="improved">Mejorado</option>
          <option value="stock_break">Quiebre</option>
        </select>
      </div>

      <button
        onClick={handleClear}
        className="text-xs font-semibold text-[#DC2626] hover:text-[#B91C1C] transition-colors flex items-center gap-1 ml-auto hover:underline"
      >
        <RotateCcw className="w-3 h-3" />
        Limpiar filtros
      </button>
    </div>
  )
}
