import { AlertTriangle } from 'lucide-react'
import type { Subscription } from '@/types/subscription'
import { detectWaste } from '@/lib/waste'

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
