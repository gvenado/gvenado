import { useEffect, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { CheckCircle2, XCircle, X } from 'lucide-react'

interface ToastProps {
  visible: boolean
  type: 'success' | 'error' | 'info'
  title: string
  message?: string
  onClose: () => void
}

export function Toast({ visible, type, title, message, onClose }: ToastProps) {
  useEffect(() => {
    if (!visible) return
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [visible, onClose])

  if (!visible) return null

  const icons: Record<string, ReactNode> = {
    success: <CheckCircle2 className="w-5 h-5 text-[#16A34A]" />,
    error: <XCircle className="w-5 h-5 text-[#DC2626]" />,
    info: <CheckCircle2 className="w-5 h-5 text-[#2563EB]" />,
  }

  return (
    <div className="fixed top-4 right-4 z-[9999] animate-in slide-in-from-top-2 fade-in duration-300">
      <div className={cn(
        'bg-white rounded-lg border shadow-lg px-4 py-3 flex items-start gap-3 min-w-[320px] max-w-[400px]',
        type === 'success' && 'border-[#BBF7D0]',
        type === 'error' && 'border-[#FECACA]',
        type === 'info' && 'border-[#BFDBFE]',
      )}>
        <div className="shrink-0 mt-0.5">{icons[type]}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#111827]">{title}</p>
          {message && <p className="text-xs text-[#6B7280] mt-0.5">{message}</p>}
        </div>
        <button onClick={onClose} className="shrink-0 w-5 h-5 flex items-center justify-center rounded hover:bg-gray-100 transition-colors">
          <X className="w-3.5 h-3.5 text-[#9CA3AF]" />
        </button>
      </div>
    </div>
  )
}
