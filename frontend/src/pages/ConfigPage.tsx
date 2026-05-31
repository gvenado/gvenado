import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Bell, Moon, Globe, Camera, Wifi } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BottomNav } from '@/components/BottomNav'

const STORAGE_KEY = 'asta_settings'

interface Settings {
  notificaciones: boolean
  modoOscuro: boolean
  subirFotosWifi: boolean
  idioma: string
}

const defaultSettings: Settings = {
  notificaciones: true,
  modoOscuro: false,
  subirFotosWifi: true,
  idioma: 'es',
}

function loadSettings(): Settings {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings
  } catch {
    return defaultSettings
  }
}

interface ToggleRowProps {
  icon: typeof Bell
  label: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
}

function ToggleRow({ icon: Icon, label, description, checked, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <div className="w-8 h-8 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-[#DC2626]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#0F172A]">{label}</p>
        <p className="text-[10px] text-[#64748B] mt-0.5">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative w-[44px] h-6 rounded-full transition-colors shrink-0',
          checked ? 'bg-[#DC2626]' : 'bg-[#CBD5E1]',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform',
            checked && 'translate-x-5',
          )}
        />
      </button>
    </div>
  )
}

export function ConfigPage() {
  const navigate = useNavigate()
  const [settings, setSettings] = useState<Settings>(loadSettings)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  }, [settings])

  const update = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="min-h-dvh bg-[#0F172A] flex justify-center">
      <div className="w-full max-w-[375px] min-h-dvh bg-[#F8FAFC] flex flex-col">
        <header className="shrink-0 bg-[#DC2626] px-4 pt-3 pb-3 shadow-sm">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => navigate('/app/perfil')}>
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-white text-base font-bold">Configuración</h1>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-3 pt-3 pb-2">
          <p className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider mb-1.5 px-1">
            Preferencias
          </p>
          <section className="rounded-xl bg-white border border-[#E2E8F0] shadow-sm overflow-hidden divide-y divide-[#E2E8F0]">
            <ToggleRow
              icon={Bell}
              label="Notificaciones"
              description="Recibir alertas de nuevas rutas y actualizaciones"
              checked={settings.notificaciones}
              onChange={v => update('notificaciones', v)}
            />
            <ToggleRow
              icon={Moon}
              label="Modo oscuro"
              description="Cambiar a tema oscuro en la aplicación"
              checked={settings.modoOscuro}
              onChange={v => update('modoOscuro', v)}
            />
            <ToggleRow
              icon={Camera}
              label="Subir fotos solo con WiFi"
              description="Ahorrar datos móviles al enviar evidencia"
              checked={settings.subirFotosWifi}
              onChange={v => update('subirFotosWifi', v)}
            />
            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-8 h-8 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center shrink-0">
                <Globe className="w-4 h-4 text-[#DC2626]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#0F172A]">Idioma</p>
                <p className="text-[10px] text-[#64748B] mt-0.5">Seleccionar idioma de la aplicación</p>
              </div>
              <select
                value={settings.idioma}
                onChange={e => update('idioma', e.target.value)}
                className="text-xs font-semibold text-[#0F172A] bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#DC2626]"
              >
                <option value="es">Español</option>
                <option value="en">English</option>
              </select>
            </div>
          </section>

          <p className="text-[9px] text-[#94A3B8] text-center mt-4">
            Los cambios se guardan automáticamente
          </p>
        </main>

        <BottomNav />
      </div>
    </div>
  )
}
