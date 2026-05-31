import { useLocation } from 'react-router-dom'
import { ChevronLeft, GitCompare, LayoutDashboard, Map, Users, Image, Warehouse } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/dashboard/utils/constants'
import { useDashboard } from '@/dashboard/context/DashboardContext'

const navItems = [
  { label: 'Resumen General', href: ROUTES.OVERVIEW, icon: LayoutDashboard },
  { label: 'Mapa en vivo', href: ROUTES.MAPA_VIVO, icon: Map },
  { label: 'Reponedores', href: ROUTES.REPONEDORES, icon: Users },
  { label: 'Galería IA', href: ROUTES.GALERIA, icon: Image },
  { label: 'Depósitos POP', href: ROUTES.DEPOSITOS, icon: Warehouse },
  { label: 'Simulador', href: ROUTES.SIMULADOR, icon: GitCompare },
]

export function Sidebar() {
  const location = useLocation()
  const { sidebarCollapsed, toggleSidebar } = useDashboard()

  return (
    <aside
      className={cn(
        'h-screen bg-white border-r border-[#E5E7EB] flex flex-col z-30 overflow-hidden',
        'transition-all duration-300 ease-in-out',
        sidebarCollapsed ? 'w-[64px] min-w-[64px]' : 'w-[240px] min-w-[240px]'
      )}
    >
      {/* Branding */}
      <div className={cn(
        'h-[72px] flex items-center border-b border-[#E5E7EB] transition-all duration-300',
        sidebarCollapsed ? 'justify-center px-0' : 'gap-3 px-5'
      )}>
        <div className="w-8 h-8 shrink-0">
          <svg viewBox="0 0 32 32" width="32" height="32" fill="#DC2626" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 4C12 4 9 7 9 11c0 2 .7 3.5 2 4.5l-3 1.5C6.5 18 6 19.5 6 21v2c0 1.5.7 3 1.5 4L10 30h12l2.5-3c.8-1 1.5-2.5 1.5-4v-2c0-1.5-.5-3-2-4l-3-1.5c1.3-1 2-2.5 2-4.5 0-4-3-7-7-7z" />
            <path d="M12 11c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4-4-1.8-4-4z" fill="#FFF" />
            <path d="M14 4l2-2 2 2" stroke="#DC2626" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className={cn(
          'transition-all duration-200 overflow-hidden whitespace-nowrap',
          sidebarCollapsed ? 'opacity-0 w-0 invisible' : 'opacity-100 w-auto visible delay-100'
        )}>
          <p className="text-sm font-bold text-[#DC2626] leading-tight">ASTA</p>
          <p className="text-[10px] text-[#6B7280] leading-tight font-semibold">GRUPO VENADO</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-1 overflow-hidden">
        {navItems.map(item => {
          const isActive = location.pathname === item.href
          const Icon = item.icon

          return (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center rounded-lg text-sm font-medium transition-all duration-200 relative py-2.5',
                sidebarCollapsed ? 'justify-center mx-auto w-10' : 'gap-3 px-3',
                isActive
                  ? 'bg-[#FEF2F2] text-[#DC2626]'
                  : 'text-[#6B7280] hover:bg-gray-50 hover:text-[#111827]'
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#DC2626] rounded-r-full" />
              )}
              <Icon className={cn('w-5 h-5 shrink-0', isActive ? 'text-[#DC2626]' : 'text-[#9CA3AF]')} />
              <span className={cn(
                'transition-all duration-200 overflow-hidden whitespace-nowrap',
                sidebarCollapsed ? 'opacity-0 w-0 invisible' : 'opacity-100 w-auto visible delay-100'
              )}>
                {item.label}
              </span>
            </a>
          )
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-[#E5E7EB] overflow-hidden">
        <button
          onClick={toggleSidebar}
          className={cn(
            'flex items-center w-full py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
            sidebarCollapsed ? 'justify-center' : 'gap-3 px-3',
            'text-[#6B7280] hover:bg-gray-50 hover:text-[#111827]'
          )}
        >
          <ChevronLeft className={cn(
            'w-5 h-5 shrink-0 text-[#9CA3AF] transition-transform duration-300',
            sidebarCollapsed && 'rotate-180'
          )} />
          <span className={cn(
            'transition-all duration-200 overflow-hidden whitespace-nowrap',
            sidebarCollapsed ? 'opacity-0 w-0 invisible' : 'opacity-100 w-auto visible delay-100'
          )}>
            Ocultar menú
          </span>
        </button>
      </div>
    </aside>
  )
}
