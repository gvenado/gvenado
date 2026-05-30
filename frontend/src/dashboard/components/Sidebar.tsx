import { useLocation } from 'react-router-dom'
import { ChevronLeft, GitCompare, LayoutDashboard, Map, Users, Image, Warehouse } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/dashboard/utils/constants'

const navItems = [
  { label: 'Overview', href: ROUTES.OVERVIEW, icon: LayoutDashboard },
  { label: 'Live Map', href: ROUTES.MAPA_VIVO, icon: Map },
  { label: 'Replenishers', href: ROUTES.REPONEDORES, icon: Users },
  { label: 'AI Gallery', href: ROUTES.GALERIA, icon: Image },
  { label: 'POP Warehouses', href: ROUTES.DEPOSITOS, icon: Warehouse },
  { label: 'Simulator', href: ROUTES.SIMULADOR, icon: GitCompare },
]

export function Sidebar() {
  const location = useLocation()

  return (
    <aside className="w-[240px] min-w-[240px] h-screen bg-white border-r border-[#E5E7EB] flex flex-col z-30">
      <div className="h-[72px] flex items-center gap-3 px-5 border-b border-[#E5E7EB]">
        <div className="w-8 h-8 rounded-lg bg-[#991B1B] flex items-center justify-center">
          <span className="text-white font-bold text-sm">A</span>
        </div>
        <div>
          <p className="text-sm font-bold text-[#111827] leading-tight">ASTA</p>
          <p className="text-[10px] text-[#6B7280] leading-tight">Supervisor</p>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map(item => {
          const isActive = location.pathname === item.href
          const Icon = item.icon

          return (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative',
                isActive
                  ? 'bg-[#FEF2F2] text-[#DC2626]'
                  : 'text-[#6B7280] hover:bg-gray-50 hover:text-[#111827]'
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#DC2626] rounded-r-full" />
              )}
              <Icon className={cn('w-5 h-5 shrink-0', isActive ? 'text-[#DC2626]' : 'text-[#9CA3AF]')} />
              <span>{item.label}</span>
            </a>
          )
        })}
      </nav>

      <div className="px-3 py-2 border-t border-[#E5E7EB]">
        <button
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-[#6B7280] hover:bg-gray-50 hover:text-[#111827] transition-all duration-200"
        >
          <ChevronLeft className="w-5 h-5 shrink-0 text-[#9CA3AF]" />
          <span>Collapse Menu</span>
        </button>
      </div>

      <div className="px-4 py-4 border-t border-[#E5E7EB]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#991B1B] flex items-center justify-center text-white text-xs font-bold">
            CM
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-[#111827] truncate">Carlos Mendoza</p>
            <p className="text-[10px] text-[#6B7280] truncate">Supervisor</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
