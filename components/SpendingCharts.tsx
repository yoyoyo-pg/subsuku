'use client'

import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'
import type { Subscription } from '@/types/subscription'
import { CATEGORIES, toMonthlyAmount } from '@/types/subscription'

function formatJPY(v: number) {
  return `¥${Math.round(v).toLocaleString('ja-JP')}`
}

interface Props {
  subscriptions: Subscription[]
}

export default function SpendingCharts({ subscriptions }: Props) {
  const active = subscriptions.filter(s => s.is_active)

  // Pie data: category breakdown
  const categoryMap = new Map<string, number>()
  for (const s of active) {
    const monthly = toMonthlyAmount(s.amount, s.billing_cycle)
    categoryMap.set(s.category, (categoryMap.get(s.category) ?? 0) + monthly)
  }
  const pieData = Array.from(categoryMap.entries())
    .map(([key, value]) => ({
      name:  CATEGORIES[key as keyof typeof CATEGORIES]?.label ?? key,
      value: Math.round(value),
      color: CATEGORIES[key as keyof typeof CATEGORIES]?.color ?? '#6b7280',
    }))
    .sort((a, b) => b.value - a.value)

  // Bar data: top 6 subscriptions by monthly cost
  const barData = [...active]
    .map(s => ({
      name:   s.name.length > 10 ? s.name.slice(0, 10) + '…' : s.name,
      amount: Math.round(toMonthlyAmount(s.amount, s.billing_cycle)),
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 6)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Pie chart */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-4">カテゴリ別支出</h3>
        {pieData.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-gray-500 text-sm">
            データがありません
          </div>
        ) : (
          <div className="flex gap-4 items-center">
            <ResponsiveContainer width="50%" height={180}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: number) => formatJPY(v)}
                  contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8 }}
                  labelStyle={{ color: '#e5e7eb' }}
                  itemStyle={{ color: '#d1d5db' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {pieData.map(d => (
                <div key={d.name} className="flex items-center gap-2 text-sm">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                  <span className="text-gray-400 flex-1 truncate">{d.name}</span>
                  <span className="text-white font-medium">{formatJPY(d.value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bar chart */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-4">月額ランキング（上位6件）</h3>
        {barData.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-gray-500 text-sm">
            データがありません
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={barData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => `¥${(v / 1000).toFixed(0)}k`} tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} width={48} />
              <Tooltip
                formatter={(v: number) => [formatJPY(v), '月額']}
                contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8 }}
                labelStyle={{ color: '#e5e7eb' }}
                itemStyle={{ color: '#d1d5db' }}
              />
              <Bar dataKey="amount" fill="#7c3aed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
