interface ExportData {
  supervisor: string
  location: string
  date: string
  kpiData: { label: string; value: string }[]
  reassignments: { from: string; to: string; pdvs: number }[]
  impactData: { label: string; value: string }[]
  routes: { reponedorId: string; color: string; points: { lat: number; lng: number }[] }[]
  pdvs: { id: string; lat: number; lng: number; status: string; reponedorId: string }[]
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function getToday(): string {
  return new Date().toLocaleDateString('es-BO', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

/* ──────────────────────────────────────────────
   PDF — open styled HTML in new window & print
   ────────────────────────────────────────────── */
export function exportPDF(data: ExportData) {
  const html = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><title>Propuesta de redistribución</title>
<style>
  @page { margin: 20mm 15mm; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #111827; margin: 0; padding: 20px; }
  h1 { font-size: 20px; margin: 0; } h2 { font-size: 14px; color: #DC2626; margin: 20px 0 8px; }
  .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #DC2626; padding-bottom: 12px; }
  .brand { font-size: 22px; font-weight: 900; color: #DC2626; }
  .brand span { color: #111827; }
  .meta { font-size: 11px; color: #6B7280; margin-top: 4px; }
  table { width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 12px; }
  th, td { padding: 6px 10px; text-align: left; border-bottom: 1px solid #E5E7EB; }
  th { background: #F9FAFB; font-weight: 600; color: #6B7280; font-size: 10px; text-transform: uppercase; }
  .kpi-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .kpi-card { border: 1px solid #E5E7EB; border-radius: 6px; padding: 10px; }
  .kpi-card .val { font-size: 18px; font-weight: 800; color: #111827; }
  .kpi-card .lbl { font-size: 10px; color: #6B7280; }
  .section { margin-top: 16px; }
  .footer { margin-top: 24px; padding-top: 12px; border-top: 1px solid #E5E7EB; font-size: 10px; color: #9CA3AF; text-align: center; }
</style></head>
<body>
  <div class="header">
    <div><div class="brand">ASTA <span>GRUPO VENADO</span></div>
    <div class="meta">Propuesta de redistribución</div></div>
    <div style="text-align:right;font-size:11px;color:#6B7280;">
      <div>${data.date}</div>
      <div>${data.supervisor}</div>
      <div>${data.location}</div>
    </div>
  </div>

  <div class="section">
    <h2>Métricas actuales</h2>
    <div class="kpi-grid">
      ${data.kpiData.map(k => `<div class="kpi-card"><div class="val">${k.value}</div><div class="lbl">${k.label}</div></div>`).join('')}
    </div>
  </div>

  <div class="section">
    <h2>Resumen de reasignaciones</h2>
    <table>
      <thead><tr><th>Origen</th><th>Destino</th><th>PDVs trasladados</th></tr></thead>
      <tbody>${data.reassignments.map(r => `<tr><td>${r.from}</td><td>${r.to}</td><td>${r.pdvs}</td></tr>`).join('')}</tbody>
    </table>
  </div>

  <div class="section">
    <h2>Resumen de impacto</h2>
    <table>
      <thead><tr><th>Métrica</th><th>Valor</th></tr></thead>
      <tbody>${data.impactData.map(i => `<tr><td>${i.label}</td><td>${i.value}</td></tr>`).join('')}</tbody>
    </table>
  </div>

  <div class="footer">ASTA — Asistente de Territorio del Supervisor Automatizado · Generado el ${data.date}</div>
</body></html>`

  const printWindow = window.open('', '_blank')
  if (!printWindow) return
  printWindow.document.write(html)
  printWindow.document.close()
  printWindow.focus()
  setTimeout(() => printWindow.print(), 600)
}

/* ──────────────────────────────────────────────
   EXCEL — XML Spreadsheet 2003 format
   ────────────────────────────────────────────── */
export function exportExcel(data: ExportData) {
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  const reassignRows = data.reassignments.map(r =>
    `<Row><Cell><Data ss:Type="String">${esc(r.from)}</Data></Cell><Cell><Data ss:Type="String">${esc(r.to)}</Data></Cell><Cell><Data ss:Type="Number">${r.pdvs}</Data></Cell></Row>`
  ).join('')

  const metricRows = data.impactData.concat(data.kpiData).map(i =>
    `<Row><Cell><Data ss:Type="String">${esc(i.label)}</Data></Cell><Cell><Data ss:Type="String">${esc(i.value)}</Data></Cell></Row>`
  ).join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:x="urn:schemas-microsoft-com:office:excel"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Worksheet ss:Name="Reasignaciones">
    <Table>
      <Row><Cell><Data ss:Type="String">Reponedor origen</Data></Cell><Cell><Data ss:Type="String">Reponedor destino</Data></Cell><Cell><Data ss:Type="String">PDVs trasladados</Data></Cell></Row>
      ${reassignRows}
    </Table>
  </Worksheet>
  <Worksheet ss:Name="Métricas">
    <Table>
      <Row><Cell><Data ss:Type="String">Métrica</Data></Cell><Cell><Data ss:Type="String">Valor</Data></Cell></Row>
      ${metricRows}
    </Table>
  </Worksheet>
</Workbook>`

  const blob = new Blob([xml], { type: 'application/vnd.ms-excel' })
  downloadBlob(blob, `redistribution-proposal-${Date.now()}.xls`)
}

/* ──────────────────────────────────────────────
   GEOJSON
   ────────────────────────────────────────────── */
export function exportGeoJSON(data: ExportData) {
  const features: Record<string, unknown>[] = []

  data.routes.forEach(route => {
    if (route.points.length < 2) return
    features.push({
      type: 'Feature',
      properties: { type: 'route', reponedorId: route.reponedorId, color: route.color },
      geometry: {
        type: 'LineString',
        coordinates: route.points.map(p => [p.lng, p.lat]),
      },
    })
  })

  data.pdvs.forEach(pdv => {
    features.push({
      type: 'Feature',
      properties: { type: 'pdv', id: pdv.id, status: pdv.status, reponedorId: pdv.reponedorId },
      geometry: {
        type: 'Point',
        coordinates: [pdv.lng, pdv.lat],
      },
    })
  })

  const geojson = {
    type: 'FeatureCollection',
    features,
    metadata: {
      title: 'ASTA Propuesta de redistribución',
      date: data.date,
      supervisor: data.supervisor,
      location: data.location,
    },
  }

  const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/geo+json' })
  downloadBlob(blob, `redistribution-proposal-${Date.now()}.geojson`)
}

/* ──────────────────────────────────────────────
   Collect export data from page state
   ────────────────────────────────────────────── */
export function collectExportData(params: {
  supervisor: string
  location: string
  kpiData: { label: string; value: string }[]
  reassignments: { from: string; to: string; pdvs: number }[]
  impactData: { label: string; value: string }[]
  routes: { reponedorId: string; color: string; points: { lat: number; lng: number }[] }[]
  pdvs: { id: string; lat: number; lng: number; status: string; reponedorId: string }[]
}): ExportData {
  return {
    supervisor: params.supervisor,
    location: params.location,
    date: getToday(),
    kpiData: params.kpiData,
    reassignments: params.reassignments,
    impactData: params.impactData,
    routes: params.routes,
    pdvs: params.pdvs,
  }
}
