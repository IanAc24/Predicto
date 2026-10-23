import { describe, expect, test } from 'vitest'
import {
  formatDate,
  formatMoney,
  formatPercent,
  formatProbability,
  formatSignedPercent,
} from './format'

// Intl uses non-breaking spaces in some locales; compare with plain spaces.
const plain = (text: string) => text.replace(/[  ]/g, ' ')

describe('formatMoney', () => {
  test('USD in English', () => {
    expect(formatMoney(1234.5, 'USD', 'en-US')).toBe('$1,234.50')
  })
  test('EUR in English', () => {
    expect(formatMoney(1234.5, 'EUR', 'en-US')).toBe('€1,234.50')
  })
  test('EUR in Spanish', () => {
    expect(plain(formatMoney(1234.5, 'EUR', 'es-ES'))).toBe('1234,50 €')
  })
  test('USD in Spanish', () => {
    expect(plain(formatMoney(98.76, 'USD', 'es-ES'))).toBe('98,76 US$')
  })
})

describe('percent', () => {
  test('formatPercent takes percent units', () => {
    expect(formatPercent(12.345, 'en-US')).toBe('12.3%')
    expect(plain(formatPercent(12.345, 'es-ES'))).toBe('12,3 %')
  })
  test('formatSignedPercent shows sign, true minus and no sign for zero', () => {
    expect(formatSignedPercent(1.2, 'en-US')).toBe('+1.2%')
    expect(formatSignedPercent(-0.8, 'en-US')).toBe('−0.8%')
    expect(formatSignedPercent(0, 'en-US')).toBe('0.0%')
    expect(plain(formatSignedPercent(1.2, 'es-ES'))).toBe('+1,2 %')
    expect(plain(formatSignedPercent(-0.8, 'es-ES'))).toBe('−0,8 %')
  })
  test('formatProbability takes a fraction', () => {
    expect(formatProbability(0.58, 'en-US')).toBe('58%')
    expect(plain(formatProbability(0.524, 'es-ES'))).toBe('52 %')
  })
})

describe('formatDate', () => {
  test('a trading day is not shifted by the time zone', () => {
    expect(formatDate('2025-03-14', 'America/New_York', 'en-US')).toBe('Mar 14, 2025')
    expect(formatDate('2025-03-14', 'Europe/Berlin', 'en-US')).toBe('Mar 14, 2025')
  })
  test('an instant is shown in the exchange time zone', () => {
    // 02:30 UTC is still the previous evening in New York, already morning in Berlin
    const iso = '2025-03-14T02:30:00Z'
    expect(formatDate(iso, 'America/New_York', 'en-US')).toBe('Mar 13, 2025')
    expect(formatDate(iso, 'Europe/Berlin', 'en-US')).toBe('Mar 14, 2025')
  })
  test('Spanish locale', () => {
    expect(formatDate('2025-03-14', 'Europe/Berlin', 'es-ES')).toBe('14 mar 2025')
  })
})
