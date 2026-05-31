import { BeforeAfterSlider } from '@/dashboard/components/BeforeAfterSlider'
import type { EvidenceCardData, EvidenceTag } from '@/dashboard/types'

const TAG_STYLES: Record<string, { bg: string; text: string }> = {
  success: { bg: '#F0FDF4', text: '#16A34A' },
  warning: { bg: '#FFFBEB', text: '#F59E0B' },
  error: { bg: '#FEF2F2', text: '#DC2626' },
}

function TagBadge({ tag }: { tag: EvidenceTag }) {
  const s = TAG_STYLES[tag.type]
  return (
    <span
      className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded whitespace-nowrap"
      style={{ backgroundColor: s.bg, color: s.text }}
    >
      {tag.label}
    </span>
  )
}

interface EvidenceCardProps {
  evidence: EvidenceCardData
  onClick?: () => void
}

export function EvidenceCard({ evidence, onClick }: EvidenceCardProps) {
  return (
    <div
      className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
      onClick={onClick}
    >
      {/* Before / After slider */}
      <div className="relative">
        <BeforeAfterSlider
          beforeSrc={evidence.beforeUrl}
          afterSrc={evidence.afterUrl}
          beforeLabel={evidence.beforeLabel}
          afterLabel={evidence.afterLabel}
        />
        <div className="absolute top-2 right-2 z-10 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 border border-[#E5E7EB] shadow-sm">
          <p className="text-[10px] font-medium text-[#6B7280] leading-tight">Caras ganadas</p>
          <p className="text-sm font-bold text-[#16A34A] leading-tight">+{evidence.facesGained}</p>
        </div>
      </div>

      {/* Tags */}
      <div className="px-3 pt-2.5 pb-1 flex flex-wrap gap-1.5">
        {evidence.tags.map((tag, i) => (
          <TagBadge key={i} tag={tag} />
        ))}
      </div>

      {/* Store info */}
      <div className="px-3 pb-3 pt-1.5 border-t border-[#E5E7EB] mt-1.5">
        <p className="text-xs font-bold text-[#111827]">{evidence.storeName}</p>
        <div className="flex items-center gap-2 text-[10px] text-[#6B7280] mt-0.5">
          <span>{evidence.replenisher}</span>
          <span className="w-1 h-1 rounded-full bg-[#E5E7EB]" />
          <span>{evidence.time}</span>
        </div>
      </div>
    </div>
  )
}
