import { type ReactNode } from 'react'
import { BottomNav } from '@/components/BottomNav'

interface MobileLayoutProps {
  children: ReactNode
  header?: ReactNode
  bottomCta?: ReactNode
  hideNav?: boolean
}

export function MobileLayout({ children, header, bottomCta, hideNav }: MobileLayoutProps) {
  return (
    <div className="min-h-dvh bg-[#0F172A] flex justify-center">
      <div className="w-full max-w-[375px] min-h-dvh bg-[#F8FAFC] flex flex-col">
        {header && (
          <header className="shrink-0 bg-[#DC2626] px-4 pt-3 pb-3 shadow-sm">
            {header}
          </header>
        )}

        <main className="flex-1 overflow-y-auto px-3 pt-3 pb-2">
          {children}
        </main>

        {!hideNav && <BottomNav />}

        {bottomCta && (
          <div className="shrink-0 bg-white border-t border-[#E2E8F0] px-4 pt-2.5 pb-[max(8px,env(safe-area-inset-bottom))]">
            {bottomCta}
          </div>
        )}
      </div>
    </div>
  )
}
