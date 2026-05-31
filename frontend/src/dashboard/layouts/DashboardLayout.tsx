import { type ReactNode, useState, useRef, useEffect } from 'react'
import { Bell, Search, ChevronDown, CalendarDays } from 'lucide-react'
import { Sidebar } from '@/dashboard/components/Sidebar'
import { useDashboard } from '@/dashboard/context/DashboardContext'
import { useSupervisor } from '@/dashboard/context/SupervisorContext'

interface DashboardLayoutProps {
  children: ReactNode
  currentPage: string
}

function formatDayName(date: Date): string {
  return date.toLocaleDateString('es-BO', { weekday: 'long' })
}

function formatDatePill(date: Date): string {
  return date.toLocaleDateString('es-BO', { year: 'numeric', month: 'long', day: 'numeric' })
}

export function DashboardLayout({ children, currentPage }: DashboardLayoutProps) {
  const { location, pageTitle } = useDashboard()
  const { supervisor } = useSupervisor()
  const [searchOpen, setSearchOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLButtonElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  const today = new Date()

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false)
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className="flex h-screen bg-[#FFFFFF] overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-[72px] min-h-[72px] bg-white border-b border-[#E5E7EB] flex items-center justify-between px-6 z-20">
          <div className="flex items-center gap-6">
            <div>
              <h1 className="text-base font-bold text-[#111827]">{pageTitle}</h1>
              <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                <svg className="w-3 h-3 text-[#DC2626]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                <span>{location}</span>
                <span className="w-1 h-1 rounded-full bg-[#E5E7EB]" />
                <span className="text-[#DC2626] font-medium">{currentPage}</span>
              </div>
            </div>
          </div>

          {/* Calendar pill */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 border border-[#E5E7EB] rounded-lg bg-white">
            <CalendarDays className="w-4 h-4 text-[#6B7280]" />
            <div className="text-center">
              <p className="text-xs font-semibold text-[#111827] leading-tight">{formatDatePill(today)}</p>
              <p className="text-[10px] text-[#6B7280] leading-tight capitalize">{formatDayName(today)}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Search bar */}
            <div ref={searchRef} className="relative hidden lg:block">
              <div className="flex items-center gap-2 px-3 py-2 border border-[#E5E7EB] rounded-lg bg-white min-w-[240px]">
                <Search className="w-4 h-4 text-[#9CA3AF] shrink-0" />
                <input
                  type="text"
                  placeholder="Buscar PDV, reponedor, depósito..."
                  className="text-xs text-[#6B7280] outline-none bg-transparent w-full placeholder:text-[#9CA3AF]"
                  onFocus={() => setSearchOpen(true)}
                />
              </div>
              {searchOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg border border-[#E5E7EB] shadow-lg p-3 z-50">
                  <p className="text-xs text-[#6B7280]">Type to search...</p>
                </div>
              )}
            </div>

            {/* Notification bell */}
            <div className="relative">
              <button
                ref={notifRef}
                onClick={() => setNotifOpen(!notifOpen)}
                className="w-9 h-9 rounded-lg border border-[#E5E7EB] flex items-center justify-center hover:bg-gray-50 transition-colors relative text-[#6B7280]"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#DC2626] rounded-full text-[9px] text-white font-bold flex items-center justify-center">
                  2
                </span>
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg border border-[#E5E7EB] shadow-lg p-3 z-50">
                  <p className="text-xs font-semibold text-[#111827] mb-2">Notifications</p>
                  <div className="space-y-2">
                    <div className="text-xs text-[#6B7280] p-2 bg-[#FEF2F2] rounded">
                      2 overloaded replenishers detected
                    </div>
                    <div className="text-xs text-[#6B7280] p-2 bg-[#FFFBEB] rounded">
                      Route optimization available
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div ref={profileRef} className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 hover:bg-gray-50 rounded-lg p-1.5 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[#991B1B] flex items-center justify-center text-white text-xs font-bold">
                  {supervisor.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-semibold text-[#111827] leading-tight">Supervisor LPZ</p>
                  <p className="text-[10px] text-[#6B7280] leading-tight">{supervisor.name}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-[#6B7280]" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg border border-[#E5E7EB] shadow-lg p-2 z-50">
                  <div className="px-3 py-2 text-sm text-[#111827] font-medium">{supervisor.name}</div>
                  <div className="px-3 py-1 text-xs text-[#6B7280]">{supervisor.email}</div>
                  <hr className="my-2 border-[#E5E7EB]" />
                  <button className="w-full text-left px-3 py-2 text-sm text-[#6B7280] hover:bg-gray-50 rounded">Profile</button>
                  <button className="w-full text-left px-3 py-2 text-sm text-[#6B7280] hover:bg-gray-50 rounded">Settings</button>
                  <button className="w-full text-left px-3 py-2 text-sm text-[#DC2626] hover:bg-[#FEF2F2] rounded">Log out</button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-[#FFFFFF]">
          {children}
        </main>
      </div>
    </div>
  )
}
