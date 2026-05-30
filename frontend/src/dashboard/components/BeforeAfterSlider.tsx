import { useState, useRef, type MouseEvent } from 'react'

interface BeforeAfterSliderProps {
  beforeSrc: string
  afterSrc: string
  beforeLabel?: string
  afterLabel?: string
}

export function BeforeAfterSlider({ beforeSrc, afterSrc, beforeLabel = 'Before', afterLabel = 'After' }: BeforeAfterSliderProps) {
  const [sliderPos, setSliderPos] = useState(50)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
    setSliderPos((x / rect.width) * 100)
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-200 cursor-col-resize select-none"
      onMouseMove={(e: MouseEvent) => handleMove(e.clientX)}
    >
      <img src={afterSrc} alt={afterLabel} className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${sliderPos}%` }}>
        <img src={beforeSrc} alt={beforeLabel} className="absolute inset-0 w-full h-full object-cover" />
      </div>
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-md z-10"
        style={{ left: `${sliderPos}%` }}
      />
      <div
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center z-20 border border-[#E5E7EB]"
        style={{ left: `${sliderPos}%` }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
          <path d="M8 3L3 8L8 13" /><path d="M3 8H21" /><path d="M16 21L21 16L16 11" /><path d="M21 16H3" />
        </svg>
      </div>
      <span className="absolute bottom-2 left-2 text-xs font-medium text-white bg-black/50 px-2 py-0.5 rounded">{beforeLabel}</span>
      <span className="absolute bottom-2 right-2 text-xs font-medium text-white bg-black/50 px-2 py-0.5 rounded">{afterLabel}</span>
    </div>
  )
}
