import { type ReactNode, useState, useRef, useEffect } from 'react'
import { Bell, Search, ChevronDown } from 'lucide-react'
import { Sidebar } from '@/dashboard/components/Sidebar'
import { useDashboard } from '@/dashboard/context/DashboardContext'
import { useSupervisor } from '@/dashboard/context/SupervisorContext'

interface DashboardLayoutProps {
  children: ReactNode
  currentPage: string
}

export function DashboardLayout({ children, currentPage }: DashboardLayoutProps) {
  const { currentDate, location, pageTitle } = useDashboard()
  const { supervisor } = useSupervisor()
  const [searchOpen, setSearchOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLButtonElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

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
                <span>{location}</span>
                <span className="w-1 h-1 rounded-full bg-[#E5E7EB]" />
                <span className="text-[#DC2626] font-medium">{currentPage}</span>
              </div>
            </div>
          </div>

          <div className="text-sm text-[#6B7280] font-medium hidden md:block">
            {currentDate}
          </div>

          <div className="flex items-center gap-4">
            <div ref={searchRef} className="relative">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="w-9 h-9 rounded-lg border border-[#E5E7EB] flex items-center justify-center hover:bg-gray-50 transition-colors text-[#6B7280]"
              >
                <Search className="w-4 h-4" />
              </button>
              {searchOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-lg border border-[#E5E7EB] shadow-lg p-2 z-50">
                  <input
                    autoFocus
                    placeholder="Search PDVs, workers..."
                    className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-md outline-none focus:border-[#DC2626]"
                  />
                </div>
              )}
            </div>

            <div className="relative">
              <button
                ref={notifRef}
                onClick={() => setNotifOpen(!notifOpen)}
                className="w-9 h-9 rounded-lg border border-[#E5E7EB] flex items-center justify-center hover:bg-gray-50 transition-colors relative text-[#6B7280]"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#DC2626] rounded-full text-[9px] text-white font-bold flex items-center justify-center">
                  3
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
                    <div className="text-xs text-[#6B7280] p-2 bg-[#EFF6FF] rounded">
                      3 PDVs pending visit today
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div ref={profileRef} className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 hover:bg-gray-50 rounded-lg p-1.5 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[#991B1B] flex items-center justify-center text-white text-xs font-bold">
                  {supervisor.name.split(' ').map(n => n[0]).join('')}
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
