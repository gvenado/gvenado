export type AlertSeverity = 'error' | 'warning' | 'info'

export interface Alerta {
  id: string
  type: string
  severity: AlertSeverity
  message: string
  timestamp: string
}
