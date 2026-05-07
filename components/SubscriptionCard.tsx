import { Pencil, Trash2, CalendarDays } from 'lucide-react'
import type { Subscription } from '@/types/subscription'
import { CATEGORIES, BILLING_CYCLE_LABELS, toMonthlyAmount } from '@/types/subscription'

function formatDate(d: string | null) {
  if (!d) return null
  return new Date(d).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })
}

interface Props {
  subscription: Subscription
  onEdit:   (s: Subscription) => void
  onDelete: (id: string) => void
}

export default function SubscriptionCard({ subscription: s, onEdit, onDelete }: Props) {
  const cat        = CATEGORIES[s.category]
  const monthly    = toMonthlyAmount(s.amount, s.billing_cycle)
  const billingLabel = BILLING_CYCLE_LABELS[s.billing_cycle]

  return (
    <div className={`group bg-gray-900 border rounded-2xl p-5 flex flex-col gap-4 transition-all hover:border-gray-700 ${s.is_active ? 'border-gray-800' : 'border-gray-800/40 opacity-60'}`}>
      {/* Top row */}
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: cat.color + '22' }}>
          {s.icon || cat.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-white font-semibold truncate">{s.name}</p>
            {!s.is_active && (
              <span className="text-xs bg-gray-700 text-gray-400 px-2 py-0.5 rounded-full flex-shrink-0">停止中</span>
            )}
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full mt-1 inline-block" style={{ background: cat.color + '22', color: cat.color }}>
            {cat.label}
          </span>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-white font-bold">
            ¥{s.amount.toLocaleString('ja-JP')}
            <span className="text-gray-500 text-xs font-normal">/{billingLabel.replace('払い', '')}</span>
          </p>
          {s.billing_cycle !== 'monthly' && (
            <p className="text-gray-400 text-xs">月換算 ¥{Math.round(monthly).toLocaleString('ja-JP')}</p>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-gray-500 text-xs">
          {s.next_billing_date && (
            <>
              <CalendarDays className="w-3.5 h-3.5" />
              <span>次回 {formatDate(s.next_billing_date)}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(s)}
            className="p-2 rounded-lg text-gray-500 hover:text-violet-400 hover:bg-violet-500/10 transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(s.id)}
            className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
