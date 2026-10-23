import type { Currency } from '../api/types'

const MINUS = '−'

/** 1234.5 -> "$1,234.50" (en) / "1234,50 US$" (es). */
export function formatMoney(value: number, currency: Currency, locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value)
}

/** A value already in percent units: 1.234 -> "1.2%". */
export function formatPercent(value: number, locale = 'en-US', digits = 1): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value / 100)
}

/** A value in percent units with an explicit sign: 1.2 -> "+1.2%", -0.8 -> "−0.8%". Zero has no sign. */
export function formatSignedPercent(value: number, locale = 'en-US', digits = 1): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
    signDisplay: 'exceptZero',
  })
    .format(value / 100)
    .replace('-', MINUS)
}

/** A probability as a fraction: 0.58 -> "58%". Always whole percent, no sign. */
export function formatProbability(value: number, locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    maximumFractionDigits: 0,
  }).format(value)
}

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/

/**
 * Formats an ISO string as a medium date in the given IANA time zone.
 * A plain 'YYYY-MM-DD' (a trading day) is a calendar date, so it is never shifted by the time zone.
 */
export function formatDate(isoString: string, timeZone: string, locale = 'en-US'): string {
  const date = new Date(isoString)
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeZone: DATE_ONLY.test(isoString) ? 'UTC' : timeZone,
  }).format(date)
}
