import type { Subscription } from '@/types/subscription'
import { BILLING_CYCLE_LABELS, CATEGORIES, toMonthlyAmount } from '@/types/subscription'

function escape(value: string | number | boolean | null): string {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function buildCsvContent(subscriptions: Subscription[]): string {
  const headers = [
    'サービス名', 'カテゴリ', '金額', '支払い周期', '月換算金額',
    'ステータス', '次回請求日', '開始日', 'メモ',
  ]

  const rows = subscriptions.map(s => [
    escape(s.name),
    escape(CATEGORIES[s.category]?.label ?? s.category),
    escape(s.amount),
    escape(BILLING_CYCLE_LABELS[s.billing_cycle] ?? s.billing_cycle),
    escape(Math.round(toMonthlyAmount(s.amount, s.billing_cycle))),
    escape(s.is_active ? '有効' : '停止中'),
    escape(s.next_billing_date),
    escape(s.started_at),
    escape(s.notes),
  ])

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
}

export function downloadCsv(content: string, filename: string): void {
  const bom = '﻿' // Excel で文字化けしないよう BOM を付与
  const blob = new Blob([bom + content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
