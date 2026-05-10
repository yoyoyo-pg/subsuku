import { describe, it, expect } from 'vitest'
import { detectWaste } from '@/lib/waste'
import type { Subscription } from '@/types/subscription'

function sub(overrides: Partial<Subscription> & { id: string }): Subscription {
  return {
    user_id: 'user-1',
    name: 'Test',
    amount: 1000,
    currency: 'JPY',
    billing_cycle: 'monthly',
    category: 'other',
    next_billing_date: null,
    started_at: null,
    is_active: true,
    icon: null,
    notes: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

describe('detectWaste', () => {
  it('空配列は空を返す', () => {
    expect(detectWaste([])).toEqual([])
  })

  it('非アクティブなサブスクは無視する', () => {
    const subs = [sub({ id: '1', is_active: false, amount: 50000, billing_cycle: 'yearly' })]
    expect(detectWaste(subs)).toEqual([])
  })

  it('年払い ≥¥10,000 は検出する', () => {
    const subs = [sub({ id: '1', billing_cycle: 'yearly', amount: 10000 })]
    const result = detectWaste(subs)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('1')
  })

  it('年払い <¥10,000 は検出しない', () => {
    const subs = [sub({ id: '1', billing_cycle: 'yearly', amount: 9999 })]
    expect(detectWaste(subs)).toEqual([])
  })

  it('同カテゴリ 3件以上は検出する', () => {
    const subs = [
      sub({ id: '1', category: 'video' }),
      sub({ id: '2', category: 'video' }),
      sub({ id: '3', category: 'video' }),
    ]
    const result = detectWaste(subs)
    expect(result.some(i => i.id.endsWith('_dup'))).toBe(true)
  })

  it('同カテゴリ 2件は検出しない', () => {
    const subs = [
      sub({ id: '1', category: 'video' }),
      sub({ id: '2', category: 'video' }),
    ]
    expect(detectWaste(subs)).toEqual([])
  })

  it('月払い ≥¥5,000 は検出する', () => {
    const subs = [sub({ id: '1', billing_cycle: 'monthly', amount: 5000 })]
    const result = detectWaste(subs)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('1')
  })

  it('月払い <¥5,000 は検出しない', () => {
    const subs = [sub({ id: '1', billing_cycle: 'monthly', amount: 4999 })]
    expect(detectWaste(subs)).toEqual([])
  })

  it('結果は最大4件に制限される', () => {
    const subs = [
      sub({ id: '1', billing_cycle: 'yearly', amount: 10000 }),
      sub({ id: '2', billing_cycle: 'yearly', amount: 10000 }),
      sub({ id: '3', billing_cycle: 'yearly', amount: 10000 }),
      sub({ id: '4', billing_cycle: 'yearly', amount: 10000 }),
      sub({ id: '5', billing_cycle: 'yearly', amount: 10000 }),
    ]
    expect(detectWaste(subs)).toHaveLength(4)
  })

  it('年払いは高額月払いチェックで二重カウントされない', () => {
    // 年払い ¥120,000 = 月換算 ¥10,000 → 年払いチェックのみで検出、月払いチェックでは除外
    const subs = [sub({ id: '1', billing_cycle: 'yearly', amount: 120000 })]
    const result = detectWaste(subs)
    expect(result.filter(i => i.id === '1')).toHaveLength(1)
  })
})
