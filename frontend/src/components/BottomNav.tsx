import { NavLink } from 'react-router-dom'
import { Home, Map, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  { icon: Home, label: 'Ruta', to: '/app/ruta-hoy' },
  { icon: Map, label: 'Mapa', to: '/app/pdv-actual' },
  { icon: User, label: 'Perfil', to: '/app/perfil' },
]

export function BottomNav() {
  return (
    <nav className="shrink-0 bg-white border-t border-[#E2E8F0] flex items-center justify-around px-2 pt-1 pb-0.5">
      {tabs.map(tab => (
        <NavLink
          key={tab.label}
          to={tab.to}
          end
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center gap-0 py-1.5 px-3 rounded-lg transition-colors',
              isActive ? 'text-[#DC2626]' : 'text-[#64748B]',
            )
          }
        >
          {({ isActive }) => (
            <>
              <tab.icon className={cn('w-5 h-5', isActive && 'fill-[#DC2626]/10')} />
              <span className={cn('text-[9px] font-semibold mt-0.5', !isActive && 'font-medium')}>
                {tab.label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
