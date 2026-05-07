import { CreditCard, Calendar, TrendingDown, Bell } from 'lucide-react'
import type { Subscription } from '@/types/subscription'
import { toMonthlyAmount } from '@/types/subscription'

function formatJPY(amount: number) {
  return `¥${Math.round(amount).toLocaleString('ja-JP')}`
}

function getThisMonthRenewals(subs: Subscription[]): number {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth   = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return subs.filter(s => {
    if (!s.next_billing_date || !s.is_active) return false
    const d = new Date(s.next_billing_date)
    return d >= startOfMonth && d <= endOfMonth
  }).length
}

interface Props {
  subscriptions: Subscription[]
}

export default function StatsCards({ subscriptions }: Props) {
  const active = subscriptions.filter(s => s.is_active)
  const monthlyTotal = active.reduce((sum, s) => sum + toMonthlyAmount(s.amount, s.billing_cycle), 0)
  const yearlyTotal  = monthlyTotal * 12
  const renewals     = getThisMonthRenewals(active)

  const cards = [
    {
      label: '月額合計',
      value: formatJPY(monthlyTotal),
      sub: `年間 ${formatJPY(yearlyTotal)}`,
      icon: TrendingDown,
      color: 'text-violet-400',
      bg:   'bg-violet-500/10',
    },
    {
      label: 'アクティブ',
      value: `${active.length}件`,
      sub: `全 ${subscriptions.length} 件`,
      icon: CreditCard,
      color: 'text-blue-400',
      bg:   'bg-blue-500/10',
    },
    {
      label: '今月の更新',
      value: `${renewals}件`,
      sub: '今月中に請求',
      icon: Bell,
      color: 'text-amber-400',
      bg:   'bg-amber-500/10',
    },
    {
      label: '年額換算',
      value: formatJPY(yearlyTotal),
      sub: `1日あたり ${formatJPY(yearlyTotal / 365)}`,
      icon: Calendar,
      color: 'text-emerald-400',
      bg:   'bg-emerald-500/10',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(card => (
        <div key={card.label} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <div className={`inline-flex p-2.5 rounded-xl ${card.bg} mb-3`}>
            <card.icon className={`w-5 h-5 ${card.color}`} />
          </div>
          <p className="text-gray-400 text-sm">{card.label}</p>
          <p className="text-2xl font-bold text-white mt-1">{card.value}</p>
          <p className="text-gray-500 text-xs mt-1">{card.sub}</p>
        </div>
      ))}
    </div>
  )
}
