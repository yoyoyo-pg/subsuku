import { describe, it, expect } from 'vitest'
import { toMonthlyAmount } from '@/types/subscription'

describe('toMonthlyAmount', () => {
  it('月払いはそのまま返す', () => {
    expect(toMonthlyAmount(1000, 'monthly')).toBe(1000)
  })

  it('年払いは12分割して返す', () => {
    expect(toMonthlyAmount(12000, 'yearly')).toBe(1000)
  })

  it('年払いの端数も正確に計算する', () => {
    expect(toMonthlyAmount(10000, 'yearly')).toBeCloseTo(833.33, 1)
  })
})
