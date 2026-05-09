export type Category = 'video' | 'music' | 'productivity' | 'gaming' | 'cloud' | 'news' | 'other'
export type BillingCycle = 'monthly' | 'yearly'

export interface Subscription {
  id: string
  user_id: string
  name: string
  amount: number
  currency: string
  billing_cycle: BillingCycle
  category: Category
  next_billing_date: string | null
  started_at: string | null
  is_active: boolean
  icon: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface SubscriptionFormData {
  name: string
  amount: string
  billing_cycle: BillingCycle
  category: Category
  next_billing_date: string
  started_at: string
  is_active: boolean
  icon: string
  notes: string
}

export const CATEGORIES: Record<Category, { label: string; color: string; icon: string }> = {
  video:        { label: '動画',      color: '#ef4444', icon: '🎬' },
  music:        { label: '音楽',      color: '#22c55e', icon: '🎵' },
  productivity: { label: '生産性',    color: '#3b82f6', icon: '💼' },
  gaming:       { label: 'ゲーム',    color: '#a855f7', icon: '🎮' },
  cloud:        { label: 'クラウド',  color: '#06b6d4', icon: '☁️' },
  news:         { label: 'ニュース',  color: '#f97316', icon: '📰' },
  other:        { label: 'その他',    color: '#6b7280', icon: '📦' },
}

export const BILLING_CYCLE_LABELS: Record<BillingCycle, string> = {
  monthly: '月払い',
  yearly:  '年払い',
}

export function toMonthlyAmount(amount: number, cycle: BillingCycle): number {
  if (cycle === 'yearly') return amount / 12
  return amount
}
