import { describe, it, expect } from 'vitest'
import { buildCsvContent } from '@/lib/csv'
import type { Subscription } from '@/types/subscription'

function sub(overrides: Partial<Subscription> & { id: string }): Subscription {
  return {
    user_id: 'user-1',
    name: 'Netflix',
    amount: 1490,
    currency: 'JPY',
    billing_cycle: 'monthly',
    category: 'video',
    next_billing_date: '2026-06-01',
    started_at: '2024-01-01',
    is_active: true,
    icon: null,
    notes: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

describe('buildCsvContent', () => {
  it('ヘッダー行を含む', () => {
    const csv = buildCsvContent([])
    const header = csv.split('\n')[0]
    expect(header).toContain('サービス名')
    expect(header).toContain('金額')
    expect(header).toContain('支払い周期')
  })

  it('サブスクのデータを正しく出力する', () => {
    const csv = buildCsvContent([sub({ id: '1' })])
    expect(csv).toContain('Netflix')
    expect(csv).toContain('1490')
    expect(csv).toContain('月払い')
    expect(csv).toContain('有効')
  })

  it('停止中のサブスクは「停止中」と出力する', () => {
    const csv = buildCsvContent([sub({ id: '1', is_active: false })])
    expect(csv).toContain('停止中')
  })

  it('年払いの月換算金額を正しく出力する', () => {
    const csv = buildCsvContent([sub({ id: '1', billing_cycle: 'yearly', amount: 12000 })])
    expect(csv).toContain('1000') // 12000 / 12
  })

  it('カンマを含む名前はクォートで囲む', () => {
    const csv = buildCsvContent([sub({ id: '1', name: 'Adobe, Creative Cloud' })])
    expect(csv).toContain('"Adobe, Creative Cloud"')
  })

  it('null フィールドは空文字として出力する', () => {
    const csv = buildCsvContent([sub({ id: '1', notes: null, next_billing_date: null })])
    const dataRow = csv.split('\n')[1]
    expect(dataRow).toBeDefined()
    // notes と next_billing_date が空になること
    const fields = dataRow.split(',')
    // 列順: サービス名,カテゴリ,金額,支払い周期,月換算金額,ステータス,次回請求日,開始日,メモ
    expect(fields[6]).toBe('') // next_billing_date
    expect(fields[8]).toBe('') // notes
  })
})
