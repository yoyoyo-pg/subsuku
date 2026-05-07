import { AlertTriangle } from 'lucide-react'
import type { Subscription } from '@/types/subscription'
import { CATEGORIES, toMonthlyAmount } from '@/types/subscription'

interface WasteItem {
  id: string
  name: string
  reason: string
  monthlyAmount: number
  icon: string
}

function detectWaste(subs: Subscription[]): WasteItem[] {
  const active = subs.filter(s => s.is_active)
  const items: WasteItem[] = []

  // Yearly subscriptions over ¥10,000/year (often forgotten)
  for (const s of active) {
    if (s.billing_cycle === 'yearly' && s.amount >= 10000) {
      items.push({
        id: s.id,
        name: s.name,
        icon: CATEGORIES[s.category]?.icon ?? '📦',
        monthlyAmount: toMonthlyAmount(s.amount, s.billing_cycle),
        reason: `年払い ${s.amount.toLocaleString('ja-JP')}円 — 月換算すると高額です`,
      })
    }
  }

  // Duplicate categories (3+ in same category)
  const catCount: Record<string, number> = {}
  for (const s of active) catCount[s.category] = (catCount[s.category] ?? 0) + 1
  for (const [cat, count] of Object.entries(catCount)) {
    if (count >= 3) {
      const label = CATEGORIES[cat as keyof typeof CATEGORIES]?.label ?? cat
      const catSubs = active.filter(s => s.category === cat)
      const total   = catSubs.reduce((sum, s) => sum + toMonthlyAmount(s.amount, s.billing_cycle), 0)
      if (!items.find(i => i.id === catSubs[0].id)) {
        items.push({
          id: catSubs[0].id + '_dup',
          name: `${label}カテゴリ (${count}件)`,
          icon: CATEGORIES[cat as keyof typeof CATEGORIES]?.icon ?? '📦',
          monthlyAmount: total,
          reason: `同カテゴリに ${count} つのサブスクが重複しています`,
        })
      }
    }
  }

  // High cost single subscriptions (> ¥5000/month)
  for (const s of active) {
    const monthly = toMonthlyAmount(s.amount, s.billing_cycle)
    if (monthly >= 5000 && s.billing_cycle !== 'yearly') {
      if (!items.find(i => i.id === s.id)) {
        items.push({
          id: s.id,
          name: s.name,
          icon: CATEGORIES[s.category]?.icon ?? '📦',
          monthlyAmount: monthly,
          reason: `月額 ¥${Math.round(monthly).toLocaleString('ja-JP')} — 本当に活用していますか？`,
        })
      }
    }
  }

  return items.slice(0, 4)
}

interface Props {
  subscriptions: Subscription[]
}

export default function WasteAlert({ subscriptions }: Props) {
  const items = detectWaste(subscriptions)
  if (items.length === 0) return null

  return (
    <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-amber-400" />
        <h3 className="text-amber-300 font-semibold">無駄遣い候補</h3>
        <span className="ml-auto text-amber-500/70 text-xs">見直しを検討してみましょう</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map(item => (
          <div key={item.id} className="bg-gray-900/60 rounded-xl p-4 flex items-start gap-3">
            <span className="text-xl">{item.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">{item.name}</p>
              <p className="text-amber-400/80 text-xs mt-0.5 leading-relaxed">{item.reason}</p>
            </div>
            <span className="text-white font-semibold text-sm whitespace-nowrap">
              ¥{Math.round(item.monthlyAmount).toLocaleString('ja-JP')}<span className="text-gray-500">/月</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
