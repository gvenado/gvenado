import { useRef, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface DatePickerCalendarProps {
  value: string
  onChange: (date: string) => void
  onClose: () => void
}

const DAYS = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa']
const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

function parseDate(value: string): Date {
  const parts = value.split('/')
  if (parts.length === 3) {
    return new Date(+parts[2], +parts[1] - 1, +parts[0])
  }
  return new Date()
}

function toDDMMYYYY(d: Date): string {
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

export function DatePickerCalendar({ value, onChange, onClose }: DatePickerCalendarProps) {
  const ref = useRef<HTMLDivElement>(null)
  const initial = parseDate(value)
  const [viewMonth, setViewMonth] = useState(initial.getMonth())
  const [viewYear, setViewYear] = useState(initial.getFullYear())

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  const today = new Date()
  const selectedDate = parseDate(value)

  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

  const cells: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1) }
    else setViewMonth(viewMonth - 1)
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1) }
    else setViewMonth(viewMonth + 1)
  }

  function handleSelect(day: number) {
    const d = new Date(viewYear, viewMonth, day)
    onChange(toDDMMYYYY(d))
    onClose()
  }

  return (
    <div
      ref={ref}
      className="absolute top-full mt-1 left-0 z-50 bg-white rounded-xl border border-[#E5E7EB] shadow-lg p-3 w-[260px]"
    >
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={prevMonth}
          className="w-7 h-7 rounded-md flex items-center justify-center text-[#6B7280] hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-xs font-bold text-[#111827]">
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <button
          onClick={nextMonth}
          className="w-7 h-7 rounded-md flex items-center justify-center text-[#6B7280] hover:bg-gray-100 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {DAYS.map(d => (
          <div key={d} className="text-[10px] font-semibold text-[#6B7280] text-center h-6 flex items-center justify-center">
            {d}
          </div>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <div key={`e-${i}`} />
          const d = new Date(viewYear, viewMonth, day)
          const isSelected = isSameDay(d, selectedDate)
          const isToday = isSameDay(d, today)
          return (
            <button
              key={day}
              onClick={() => handleSelect(day)}
              className={`
                text-xs w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                ${isSelected ? 'bg-[#DC2626] text-white font-bold' : 'text-[#111827] hover:bg-gray-100'}
                ${isToday && !isSelected ? 'ring-1 ring-[#DC2626] font-semibold' : ''}
              `}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}
