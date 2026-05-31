import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import type { ComplianceItem } from '@/dashboard/types'

interface ComplianceChartProps {
  data: ComplianceItem[]
  centerValue: string
  centerLabel: string
}

export function ComplianceChart({ data, centerValue, centerLabel }: ComplianceChartProps) {
  const chartData = data.map(item => ({
    name: item.label,
    value: 20,
    pct: item.percentage,
    color: item.color,
  }))

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={85}
            dataKey="value"
            startAngle={90}
            endAngle={-270}
            stroke="none"
          >
            {chartData.map(entry => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(_: number, name: string) => {
              const item = data.find(d => d.label === name)
              return [`${item?.percentage ?? 0}%`, name]
            }}
            contentStyle={{
              background: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              fontSize: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <p className="text-2xl font-bold text-[#111827] leading-tight">{centerValue}</p>
          <p className="text-[10px] text-[#6B7280] leading-tight">{centerLabel}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1.5">
        {data.map(item => (
          <div key={item.label} className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-sm shrink-0" style={{ backgroundColor: item.color }} />
            <span className="text-[#6B7280] flex-1">{item.label}</span>
            <span className="font-semibold text-[#111827]">{item.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
