import type { Bar, BarRange } from '../types'
import { END_PRICES } from './instruments'
import { addDays, createRng, gaussian, hashString, weekday } from './rng'

/** The mock "today": the last trading day in every generated history. */
export const END_DATE = '2026-10-23'

/** About three years of weekdays. */
const BAR_COUNT = 780

const RANGE_BARS: Record<BarRange, number> = { '1M': 21, '6M': 126, '1Y': 252, '3Y': BAR_COUNT }

function tradingDaysEndingAt(end: string, count: number): string[] {
  const days: string[] = []
  let cursor = end
  while (days.length < count) {
    const day = weekday(cursor)
    if (day !== 0 && day !== 6) days.push(cursor)
    cursor = addDays(cursor, -1)
  }
  return days.reverse()
}

const round2 = (value: number) => Math.round(value * 100) / 100

/** Daily bars for ~3 years, a seeded random walk rescaled so the last close is `endPrice`. */
export function generateBars(instrumentId: string): Bar[] {
  const endPrice = END_PRICES[instrumentId] ?? 50
  const rng = createRng(hashString(instrumentId))
  const days = tradingDaysEndingAt(END_DATE, BAR_COUNT)
  const volatility = 0.013 + rng() * 0.012
  const drift = (rng() - 0.45) * 0.0006
  const baseVolume = Math.round(800_000 + rng() * 6_000_000)

  const raw: { open: number; high: number; low: number; close: number; volume: number }[] = []
  let previous = 100
  for (let i = 0; i < days.length; i++) {
    const open = previous * (1 + 0.003 * gaussian(rng))
    const close = open * Math.exp(drift + volatility * gaussian(rng))
    const high = Math.max(open, close) * (1 + Math.abs(0.004 * gaussian(rng)))
    const low = Math.min(open, close) * (1 - Math.abs(0.004 * gaussian(rng)))
    const volume = Math.round(baseVolume * (0.6 + 0.8 * rng()))
    raw.push({ open, high, low, close, volume })
    previous = close
  }

  const scale = endPrice / raw[raw.length - 1].close
  return raw.map((bar, i) => {
    const open = round2(bar.open * scale)
    const close = round2(bar.close * scale)
    return {
      time: days[i],
      open,
      high: Math.max(round2(bar.high * scale), open, close),
      low: Math.min(round2(bar.low * scale), open, close),
      close,
      volume: bar.volume,
    }
  })
}

export function sliceBars(bars: Bar[], range: BarRange): Bar[] {
  return bars.slice(-RANGE_BARS[range])
}
