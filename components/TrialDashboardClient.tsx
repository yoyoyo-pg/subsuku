'use client'

import { useState } from 'react'
import { TrendingDown, Search, UserPlus, X, Plus } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import StatsCards from './StatsCards'
import SpendingCharts from './SpendingCharts'
import WasteAlert from './WasteAlert'
import SubscriptionCard from './SubscriptionCard'
import type { Subscription } from '@/types/subscription'

const MOCK_SUBSCRIPTIONS: Subscription[] = [
  {
    id: '1', user_id: 'trial', name: 'Netflix', amount: 1490, currency: 'JPY',
    billing_cycle: 'monthly', category: 'video', next_billing_date: '2026-05-15',
    started_at: '2023-01-01', is_active: true, icon: '🎬', notes: null,
    created_at: '2023-01-01T00:00:00Z', updated_at: '2023-01-01T00:00:00Z',
  },
  {
    id: '2', user_id: 'trial', name: 'Spotify', amount: 980, currency: 'JPY',
    billing_cycle: 'monthly', category: 'music', next_billing_date: '2026-05-20',
    started_at: '2022-06-01', is_active: true, icon: '🎵', notes: null,
    created_at: '2022-06-01T00:00:00Z', updated_at: '2022-06-01T00:00:00Z',
  },
  {
    id: '3', user_id: 'trial', name: 'Adobe Creative Cloud', amount: 6980, currency: 'JPY',
    billing_cycle: 'monthly', category: 'productivity', next_billing_date: '2026-05-10',
    started_at: '2021-04-01', is_active: true, icon: null, notes: null,
    created_at: '2021-04-01T00:00:00Z', updated_at: '2021-04-01T00:00:00Z',
  },
  {
    id: '4', user_id: 'trial', name: 'iCloud+', amount: 130, currency: 'JPY',
    billing_cycle: 'monthly', category: 'cloud', next_billing_date: '2026-05-25',
    started_at: '2020-09-01', is_active: true, icon: '☁️', notes: null,
    created_at: '2020-09-01T00:00:00Z', updated_at: '2020-09-01T00:00:00Z',
  },
  {
    id: '5', user_id: 'trial', name: 'Amazon Prime', amount: 5900, currency: 'JPY',
    billing_cycle: 'yearly', category: 'video', next_billing_date: '2027-02-01',
    started_at: '2020-02-01', is_active: true, icon: null, notes: null,
    created_at: '2020-02-01T00:00:00Z', updated_at: '2020-02-01T00:00:00Z',
  },
  {
    id: '6', user_id: 'trial', name: 'YouTube Premium', amount: 1180, currency: 'JPY',
    billing_cycle: 'monthly', category: 'video', next_billing_date: '2026-05-12',
    started_at: '2023-03-01', is_active: true, icon: null, notes: null,
    created_at: '2023-03-01T00:00:00Z', updated_at: '2023-03-01T00:00:00Z',
  },
  {
    id: '7', user_id: 'trial', name: 'Notion Plus', amount: 16000, currency: 'JPY',
    billing_cycle: 'yearly', category: 'productivity', next_billing_date: '2026-12-01',
    started_at: '2023-01-01', is_active: true, icon: null, notes: null,
    created_at: '2023-01-01T00:00:00Z', updated_at: '2023-01-01T00:00:00Z',
  },
]

export default function TrialDashboardClient() {
  const router = useRouter()
  const [search, setSearch]           = useState('')
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('active')
  const [bannerVisible, setBannerVisible] = useState(true)

  function goToSignup() {
    router.push('/')
  }

  const filtered = MOCK_SUBSCRIPTIONS.filter(s => {
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase())
    const matchActive =
      filterActive === 'all'      ? true :
      filterActive === 'active'   ? s.is_active :
      !s.is_active
    return matchSearch && matchActive
  })

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Trial banner */}
      {bannerVisible && (
        <div className="bg-violet-700 text-white text-sm px-4 py-2.5 flex items-center gap-4">
          <div className="flex items-center gap-2 flex-1 justify-center flex-wrap">
            <span>👀 これはお試しモードです。データは保存されません。</span>
            <button
              onClick={goToSignup}
              className="font-semibold underline underline-offset-2 hover:text-violet-200 transition-colors"
            >
              登録して実際に使う →
            </button>
          </div>
          <button
            onClick={() => setBannerVisible(false)}
            className="flex-shrink-0 p-1 hover:text-violet-200 transition-colors"
            aria-label="バナーを閉じる"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold text-lg">Subsuku</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs bg-violet-500/20 text-violet-300 border border-violet-500/30 px-2.5 py-1 rounded-full">
              お試し中
            </span>
            <button
              onClick={goToSignup}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              登録する
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <StatsCards subscriptions={MOCK_SUBSCRIPTIONS} />
        <SpendingCharts subscriptions={MOCK_SUBSCRIPTIONS} />
        <WasteAlert subscriptions={MOCK_SUBSCRIPTIONS} />

        {/* Subscription list */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
            <h2 className="text-white font-semibold text-lg flex-1">サブスクリプション一覧</h2>

            {/* Search */}
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="検索..."
                className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-9 pr-4 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>

            {/* Filter tabs */}
            <div className="flex bg-gray-900 border border-gray-800 rounded-xl p-1 gap-1">
              {(['all', 'active', 'inactive'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilterActive(f)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${filterActive === f ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  {f === 'all' ? '全て' : f === 'active' ? '有効' : '停止中'}
                </button>
              ))}
            </div>

            {/* Add button - prompts signup */}
            <button
              onClick={goToSignup}
              className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-medium transition-colors text-sm flex-shrink-0"
              title="アカウント登録後に利用できます"
            >
              <Plus className="w-4 h-4" />
              追加
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(s => (
              <SubscriptionCard
                key={s.id}
                subscription={s}
                onEdit={goToSignup}
                onDelete={goToSignup}
              />
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gray-900 border border-violet-500/30 rounded-2xl p-8 text-center">
          <p className="text-xl font-bold text-white mb-2">あなたのサブスクを管理しよう</p>
          <p className="text-gray-400 text-sm mb-6">
            無料で始められます。Google アカウントですぐ登録。
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-medium transition-colors"
          >
            <UserPlus className="w-5 h-5" />
            無料で始める
          </Link>
        </div>
      </main>
    </div>
  )
}
