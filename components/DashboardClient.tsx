'use client'

import { useState, useCallback, useMemo } from 'react'
import { Plus, LogOut, TrendingDown, Search, ArrowUpDown, Download } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import StatsCards       from './StatsCards'
import SpendingCharts   from './SpendingCharts'
import WasteAlert       from './WasteAlert'
import SubscriptionCard from './SubscriptionCard'
import SubscriptionModal from './SubscriptionModal'
import type { Subscription, SubscriptionFormData } from '@/types/subscription'
import { toMonthlyAmount } from '@/types/subscription'
import { buildCsvContent, downloadCsv } from '@/lib/csv'

type SortKey = 'created_at' | 'name' | 'amount_desc' | 'amount_asc' | 'next_billing_date'

const SORT_LABELS: Record<SortKey, string> = {
  created_at:        '追加順',
  name:              '名前順',
  amount_desc:       '金額（高い順）',
  amount_asc:        '金額（低い順）',
  next_billing_date: '請求日順',
}

interface Props {
  user: { id: string; email: string }
  initialSubscriptions: Subscription[]
}

export default function DashboardClient({ user, initialSubscriptions }: Props) {
  const supabase = createClient()
  const router   = useRouter()

  const [subscriptions, setSubscriptions] = useState<Subscription[]>(initialSubscriptions)
  const [modalOpen, setModalOpen]         = useState(false)
  const [editing, setEditing]             = useState<Subscription | null>(null)
  const [search, setSearch]               = useState('')
  const [filterActive, setFilterActive]   = useState<'all' | 'active' | 'inactive'>('active')
  const [sortKey, setSortKey]             = useState<SortKey>('created_at')

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const handleSubmit = useCallback(async (data: SubscriptionFormData) => {
    const payload = {
      name:              data.name.trim(),
      amount:            parseFloat(data.amount),
      billing_cycle:     data.billing_cycle,
      category:          data.category,
      next_billing_date: data.next_billing_date || null,
      started_at:        data.started_at || null,
      is_active:         data.is_active,
      icon:              data.icon || null,
      notes:             data.notes.trim() || null,
      currency:          'JPY',
    }

    if (editing) {
      const { data: updated, error } = await supabase
        .from('subscriptions')
        .update(payload)
        .eq('id', editing.id)
        .select()
        .single()
      if (error) throw error
      setSubscriptions(prev => prev.map(s => s.id === editing.id ? (updated as Subscription) : s))
    } else {
      const { data: created, error } = await supabase
        .from('subscriptions')
        .insert({ ...payload, user_id: user.id })
        .select()
        .single()
      if (error) throw error
      setSubscriptions(prev => [created as Subscription, ...prev])
    }
    setEditing(null)
  }, [editing, supabase, user.id])

  async function handleDelete(id: string) {
    if (!confirm('このサブスクを削除しますか？')) return
    const { error } = await supabase.from('subscriptions').delete().eq('id', id)
    if (!error) setSubscriptions(prev => prev.filter(s => s.id !== id))
  }

  function openAdd() {
    setEditing(null)
    setModalOpen(true)
  }

  function openEdit(s: Subscription) {
    setEditing(s)
    setModalOpen(true)
  }

  function handleExportCsv() {
    const date = new Date().toISOString().slice(0, 10)
    downloadCsv(buildCsvContent(subscriptions), `subsuku_${date}.csv`)
  }

  const filtered = useMemo(() => {
    const result = subscriptions.filter(s => {
      const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase())
      const matchActive =
        filterActive === 'all'    ? true :
        filterActive === 'active' ? s.is_active :
        !s.is_active
      return matchSearch && matchActive
    })

    result.sort((a, b) => {
      switch (sortKey) {
        case 'name':
          return a.name.localeCompare(b.name, 'ja')
        case 'amount_desc':
          return toMonthlyAmount(b.amount, b.billing_cycle) - toMonthlyAmount(a.amount, a.billing_cycle)
        case 'amount_asc':
          return toMonthlyAmount(a.amount, a.billing_cycle) - toMonthlyAmount(b.amount, b.billing_cycle)
        case 'next_billing_date': {
          if (!a.next_billing_date && !b.next_billing_date) return 0
          if (!a.next_billing_date) return 1
          if (!b.next_billing_date) return -1
          return a.next_billing_date.localeCompare(b.next_billing_date)
        }
        default: // created_at
          return b.created_at.localeCompare(a.created_at)
      }
    })

    return result
  }, [subscriptions, search, filterActive, sortKey])

  return (
    <div className="min-h-screen bg-gray-950">
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
            <span className="text-gray-500 text-sm hidden sm:block">{user.email}</span>
            <button
              onClick={handleExportCsv}
              className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-colors"
              title="CSVエクスポート"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-colors"
              title="ログアウト"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Stats */}
        <StatsCards subscriptions={subscriptions} />

        {/* Charts */}
        <SpendingCharts subscriptions={subscriptions} />

        {/* Waste alert */}
        <WasteAlert subscriptions={subscriptions} />

        {/* Subscription list */}
        <div>
          {/* List header */}
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

            {/* Sort */}
            <div className="relative flex items-center">
              <ArrowUpDown className="absolute left-3 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
              <select
                value={sortKey}
                onChange={e => setSortKey(e.target.value as SortKey)}
                className="bg-gray-900 border border-gray-800 rounded-xl pl-8 pr-4 py-2 text-sm text-gray-300 focus:outline-none focus:border-violet-500 transition-colors appearance-none cursor-pointer"
              >
                {(Object.entries(SORT_LABELS) as [SortKey, string][]).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
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

            {/* Add button */}
            <button
              onClick={openAdd}
              className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-medium transition-colors text-sm flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
              追加
            </button>
          </div>

          {/* Grid */}
          {filtered.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-16 text-center">
              <p className="text-4xl mb-3">📭</p>
              <p className="text-gray-400">
                {subscriptions.length === 0
                  ? 'サブスクをまだ登録していません。追加ボタンから始めましょう！'
                  : '条件に一致するサブスクはありません'}
              </p>
              {subscriptions.length === 0 && (
                <button
                  onClick={openAdd}
                  className="mt-4 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-medium transition-colors text-sm"
                >
                  最初のサブスクを追加
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(s => (
                <SubscriptionCard
                  key={s.id}
                  subscription={s}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <SubscriptionModal
        open={modalOpen}
        editing={editing}
        onClose={() => { setModalOpen(false); setEditing(null) }}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
