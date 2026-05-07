'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import type { Subscription, SubscriptionFormData, Category, BillingCycle } from '@/types/subscription'
import { CATEGORIES, BILLING_CYCLE_LABELS } from '@/types/subscription'

const ICON_OPTIONS = ['🎬', '🎵', '💼', '🎮', '☁️', '📰', '📦', '📺', '🎧', '📱', '💻', '🎯', '📚', '🏋️', '🍿', '🎨']

const DEFAULT_FORM: SubscriptionFormData = {
  name: '', amount: '', billing_cycle: 'monthly',
  category: 'other', next_billing_date: '',
  started_at: '', is_active: true, icon: '', notes: '',
}

interface Props {
  open:       boolean
  editing:    Subscription | null
  onClose:    () => void
  onSubmit:   (data: SubscriptionFormData) => Promise<void>
}

export default function SubscriptionModal({ open, editing, onClose, onSubmit }: Props) {
  const [form, setForm]       = useState<SubscriptionFormData>(DEFAULT_FORM)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  useEffect(() => {
    if (editing) {
      setForm({
        name:              editing.name,
        amount:            String(editing.amount),
        billing_cycle:     editing.billing_cycle,
        category:          editing.category,
        next_billing_date: editing.next_billing_date ?? '',
        started_at:        editing.started_at ?? '',
        is_active:         editing.is_active,
        icon:              editing.icon ?? '',
        notes:             editing.notes ?? '',
      })
    } else {
      setForm(DEFAULT_FORM)
    }
    setError('')
  }, [editing, open])

  if (!open) return null

  function set<K extends keyof SubscriptionFormData>(key: K, value: SubscriptionFormData[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) { setError('サービス名を入力してください'); return }
    const amt = parseFloat(form.amount)
    if (!form.amount || isNaN(amt) || amt <= 0) { setError('有効な金額を入力してください'); return }
    setLoading(true)
    setError('')
    try {
      await onSubmit(form)
      onClose()
    } catch {
      setError('保存に失敗しました。もう一度お試しください。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800 sticky top-0 bg-gray-900 z-10">
          <h2 className="text-white font-semibold text-lg">
            {editing ? 'サブスクを編集' : 'サブスクを追加'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Icon picker */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">アイコン</label>
            <div className="flex flex-wrap gap-2">
              {ICON_OPTIONS.map(icon => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => set('icon', form.icon === icon ? '' : icon)}
                  className={`w-10 h-10 rounded-xl text-lg transition-all ${form.icon === icon ? 'bg-violet-600 ring-2 ring-violet-400' : 'bg-gray-800 hover:bg-gray-700'}`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">サービス名 <span className="text-red-400">*</span></label>
            <input
              type="text"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="Netflix, Spotify..."
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          {/* Amount + Cycle */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">金額 <span className="text-red-400">*</span></label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">¥</span>
                <input
                  type="number"
                  value={form.amount}
                  onChange={e => set('amount', e.target.value)}
                  placeholder="1490"
                  min="1"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-7 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">支払い周期</label>
              <select
                value={form.billing_cycle}
                onChange={e => set('billing_cycle', e.target.value as BillingCycle)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-colors"
              >
                {(Object.entries(BILLING_CYCLE_LABELS) as [BillingCycle, string][]).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">カテゴリ</label>
            <div className="grid grid-cols-4 gap-2">
              {(Object.entries(CATEGORIES) as [Category, typeof CATEGORIES[Category]][]).map(([key, cat]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => set('category', key)}
                  className={`flex flex-col items-center gap-1 p-2.5 rounded-xl text-xs transition-all ${form.category === key ? 'ring-2' : 'bg-gray-800 hover:bg-gray-700'}`}
                  style={form.category === key ? { background: cat.color + '22', ringColor: cat.color, color: cat.color, outline: `2px solid ${cat.color}` } : { color: '#9ca3af' }}
                >
                  <span className="text-base">{cat.icon}</span>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">次回請求日</label>
              <input
                type="date"
                value={form.next_billing_date}
                onChange={e => set('next_billing_date', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">開始日</label>
              <input
                type="date"
                value={form.started_at}
                onChange={e => set('started_at', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">メモ</label>
            <textarea
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="共有プランなど..."
              rows={2}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors resize-none"
            />
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-gray-400">アクティブ</span>
            <button
              type="button"
              onClick={() => set('is_active', !form.is_active)}
              className={`relative w-11 h-6 rounded-full transition-colors ${form.is_active ? 'bg-violet-600' : 'bg-gray-700'}`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${form.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          {/* Submit */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium transition-colors disabled:opacity-50"
            >
              {loading ? '保存中...' : editing ? '更新する' : '追加する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
