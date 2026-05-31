// Queue offline estilo WhatsApp
// Cuando no hay señal, las acciones se encolan en localStorage
// Cuando vuelve la señal, se procesan todas automáticamente

const QUEUE_KEY = 'asta_offline_queue'

export interface QueuedAction {
    id: string
    type: 'foto_antes' | 'foto_despues' | 'vision_analyze' | 'create_visita' | 'incidencia'
    endpoint: string
    timestamp: string
    // Para acciones con archivo, guardamos base64
    fileBase64?: string
    fileName?: string
    fileType?: string
    // Para acciones JSON
    body?: string
}

function getQueue(): QueuedAction[] {
    try {
        return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]')
    } catch {
        return []
    }
}

function saveQueue(queue: QueuedAction[]): void {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
}

export function enqueue(action: Omit<QueuedAction, 'id' | 'timestamp'>): void {
    const queue = getQueue()
    queue.push({
        ...action,
        id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
        timestamp: new Date().toISOString(),
    })
    saveQueue(queue)
    console.log(`[OfflineQueue] Encolado: ${action.type} — total en cola: ${queue.length}`)
}

export function getQueueSize(): number {
    return getQueue().length
}

export function clearQueue(): void {
    localStorage.removeItem(QUEUE_KEY)
}

// Convierte un File a base64 para guardarlo en localStorage
export async function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve((reader.result as string).split(',')[1])
        reader.onerror = reject
        reader.readAsDataURL(file)
    })
}

// Convierte base64 de vuelta a File
function base64ToFile(base64: string, fileName: string, mimeType: string): File {
    const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0))
    return new File([bytes], fileName, { type: mimeType })
}

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

// Procesa una acción de la cola
async function processAction(action: QueuedAction): Promise<void> {
    if (action.fileBase64 && action.fileName && action.fileType) {
        const file = base64ToFile(action.fileBase64, action.fileName, action.fileType)
        const form = new FormData()
        form.append('file', file)
        const res = await fetch(`${API_BASE}${action.endpoint}`, { method: 'POST', body: form })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
    } else if (action.body) {
        const res = await fetch(`${API_BASE}${action.endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: action.body,
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
    }
}

// Procesa toda la cola — llamar cuando vuelve la señal
export async function flushQueue(): Promise<{ procesados: number; fallidos: number }> {
    const queue = getQueue()
    if (queue.length === 0) return { procesados: 0, fallidos: 0 }

    console.log(`[OfflineQueue] Procesando ${queue.length} acciones pendientes...`)

    let procesados = 0
    let fallidos = 0
    const pendientes: QueuedAction[] = []

    for (const action of queue) {
        try {
            await processAction(action)
            procesados++
            console.log(`[OfflineQueue] ✅ ${action.type} procesado`)
        } catch (err) {
            fallidos++
            pendientes.push(action) // lo deja en la cola para reintento
            console.warn(`[OfflineQueue] ❌ ${action.type} falló, reintentará después`, err)
        }
    }

    saveQueue(pendientes)
    console.log(`[OfflineQueue] Flush completo: ${procesados} ok, ${fallidos} fallidos`)
    return { procesados, fallidos }
}

// Monitor automático — detecta cuando vuelve la señal y dispara el flush
export function startOfflineMonitor(onFlush?: (result: { procesados: number; fallidos: number }) => void): () => void {
    const handleOnline = async () => {
        console.log('[OfflineQueue] 🌐 Señal recuperada — procesando cola...')
        const result = await flushQueue()
        if (onFlush) onFlush(result)
    }

    window.addEventListener('online', handleOnline)

    // Si ya hay señal al iniciar y hay cosas en cola, procesarlas
    if (navigator.onLine && getQueueSize() > 0) {
        flushQueue().then(result => {
            if (onFlush) onFlush(result)
        })
    }

    // Retorna función para cleanup
    return () => window.removeEventListener('online', handleOnline)
}