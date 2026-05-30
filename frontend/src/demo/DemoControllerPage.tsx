import { useState } from "react";

const API_BASE = "http://localhost:8000";

const DEMO_STEPS = [
    { id: "reset",      label: "🏁 Iniciar demo",           endpoint: "/api/demo/reset",          timing: "0:00" },
    { id: "geo1",       label: "📍 Geofence PDV 1",         endpoint: "/api/demo/geofence/1",     timing: "2:00" },
    { id: "foto_antes", label: "📷 Foto ANTES",             endpoint: "/api/demo/foto-antes",     timing: "2:20" },
    { id: "checklist",  label: "✅ Completar checklist",    endpoint: "/api/demo/checklist",      timing: "2:45" },
    { id: "foto_desp",  label: "📷 Foto DESPUÉS",           endpoint: "/api/demo/foto-despues",   timing: "2:55" },
    { id: "cerrar",     label: "⚡ Cerrar visita",           endpoint: "/api/demo/cerrar-visita",  timing: "3:15" },
    { id: "redistrib",  label: "🔄 Redistribución",         endpoint: "/api/demo/redistribucion", timing: "3:35" },
    { id: "impacto",    label: "🏆 Mostrar impacto",        endpoint: "/api/demo/impacto",        timing: "3:55" },
];

export default function DemoControllerPage() {
    const [activeStep, setActiveStep] = useState<string | null>(null);
    const [log, setLog] = useState<string[]>([]);
    const [lastResult, setLastResult] = useState<string>("");

    const triggerStep = async (step: typeof DEMO_STEPS[0]) => {
        setActiveStep(step.id);
        try {
            const res = await fetch(API_BASE + step.endpoint, { method: "POST" });
            const data = await res.json();
            setLog(prev => [`${new Date().toLocaleTimeString()} → ${step.label}`, ...prev]);
            setLastResult(JSON.stringify(data, null, 2));
        } catch {
            setLog(prev => [`❌ ERROR en ${step.label}`, ...prev]);
        }
        setTimeout(() => setActiveStep(null), 2000);
    };

    return (
        <div style={{ padding: 24, background: "#111827", minHeight: "100vh", fontFamily: "monospace" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <h1 style={{ color: "white", fontSize: 24, margin: 0 }}>🎮 ASTA Demo Controller</h1>
                <span style={{ color: "#9ca3af", fontSize: 13 }}>Dev C — panel de control</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
                {DEMO_STEPS.map(step => (
                    <button
                        key={step.id}
                        onClick={() => triggerStep(step)}
                        style={{
                            padding: "16px 20px",
                            borderRadius: 12,
                            border: "none",
                            cursor: "pointer",
                            textAlign: "left",
                            fontSize: 16,
                            fontWeight: "bold",
                            transition: "all 0.15s",
                            background: activeStep === step.id ? "#facc15" : "#374151",
                            color: activeStep === step.id ? "#111827" : "white",
                            transform: activeStep === step.id ? "scale(0.96)" : "scale(1)",
                        }}
                    >
                        <div>{step.label}</div>
                        <div style={{ fontSize: 11, opacity: 0.6, marginTop: 4 }}>min {step.timing}</div>
                    </button>
                ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                    <p style={{ color: "#9ca3af", fontSize: 11, marginBottom: 8 }}>LOG DE EVENTOS</p>
                    <div style={{ background: "#000", borderRadius: 12, padding: 16, height: 180, overflowY: "auto" }}>
                        {log.length === 0 && <p style={{ color: "#4b5563", fontSize: 13 }}>Esperando acciones...</p>}
                        {log.map((entry, i) => <p key={i} style={{ color: "#4ade80", fontSize: 13, margin: "2px 0" }}>{entry}</p>)}
                    </div>
                </div>
                <div>
                    <p style={{ color: "#9ca3af", fontSize: 11, marginBottom: 8 }}>ÚLTIMA RESPUESTA API</p>
                    <div style={{ background: "#000", borderRadius: 12, padding: 16, height: 180, overflowY: "auto" }}>
                        <pre style={{ color: "#93c5fd", fontSize: 11, margin: 0 }}>{lastResult || "—"}</pre>
                    </div>
                </div>
            </div>
        </div>
    );
}