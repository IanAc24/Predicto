import type { LedgerEntry, TrackRecord } from '../types'
import { END_DATE } from './bars'
import { addDays, createRng, gaussian, hashString, weekStart } from './rng'

/** Share of weeks the benchmark-beating outcome happens when always predicting "up". */
export const BASELINE_HIT_RATE = 0.52

/** 95% Wilson score interval for a proportion. */
export function wilsonInterval(hits: number, n: number): [number, number] {
  if (n === 0) return [0, 1]
  const z = 1.96
  const p = hits / n
  const denominator = 1 + (z * z) / n
  const centre = (p + (z * z) / (2 * n)) / denominator
  const margin = (z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / denominator
  return [Math.max(0, centre - margin), Math.min(1, centre + margin)]
}

/** [instrumentId, resolved weekly predictions]. Fridays going back from the Friday before END_DATE. */
const LEDGER_PLAN: [string, number][] = [
  ['NYSE:NKE', 26],
  ['OTC:ADDYY', 10],
  ['XETRA:PUMA', 6],
]

/** ~42 resolved weekly predictions plus one pending per instrument, newest first. */
export function generateLedger(): LedgerEntry[] {
  const entries: LedgerEntry[] = []
  for (const [instrumentId, resolved] of LEDGER_PLAN) {
    const rng = createRng(hashString(`ledger:${instrumentId}`))
    // weeksBack 0 is the prediction issued on END_DATE (still pending)
    for (let weeksBack = 0; weeksBack <= resolved; weeksBack++) {
      const issued = addDays(END_DATE, -7 * weeksBack)
      const resolves = addDays(issued, 7)
      const probability = Math.round((0.45 + rng() * 0.2) * 100) / 100
      const id = `${instrumentId}:${issued}`
      if (weeksBack === 0) {
        entries.push({
          id,
          instrumentId,
          issuedAt: `${issued}T21:30:00Z`,
          resolvesAt: `${resolves}T21:00:00Z`,
          probability,
          outcome: 'pending',
          excessReturn: null,
        })
        continue
      }
      // About 57% of the time the call goes the way the probability pointed.
      const agrees = rng() < 0.57
      const predictedUp = probability >= 0.5
      const direction = agrees === predictedUp ? 1 : -1
      const excessReturn = Math.round(direction * (0.2 + Math.abs(gaussian(rng)) * 2.2) * 100) / 100
      entries.push({
        id,
        instrumentId,
        issuedAt: `${issued}T21:30:00Z`,
        resolvesAt: `${resolves}T21:00:00Z`,
        probability,
        outcome: agrees ? 'hit' : 'miss',
        excessReturn,
      })
    }
  }
  return entries.sort((a, b) => b.issuedAt.localeCompare(a.issuedAt) || a.id.localeCompare(b.id))
}

export function computeLiveRecord(entries: LedgerEntry[]): { n: number; hits: number; ci: [number, number] } {
  const resolved = entries.filter((entry) => entry.outcome !== 'pending')
  const hits = resolved.filter((entry) => entry.outcome === 'hit').length
  return { n: resolved.length, hits, ci: wilsonInterval(hits, resolved.length) }
}

const BUCKETS: [string, number, number][] = [
  ['40-50%', 0.4, 0.5],
  ['50-60%', 0.5, 0.6],
  ['60-70%', 0.6, 0.7],
]

export function computeTrackRecord(ledger: LedgerEntry[]): TrackRecord {
  const resolved = ledger.filter((entry) => entry.outcome !== 'pending')
  const { n, hits, ci } = computeLiveRecord(ledger)

  const weeks = new Map<string, { n: number; hits: number }>()
  for (const entry of resolved) {
    const key = weekStart(entry.issuedAt.slice(0, 10))
    const week = weeks.get(key) ?? { n: 0, hits: 0 }
    week.n += 1
    if (entry.outcome === 'hit') week.hits += 1
    weeks.set(key, week)
  }

  const calibration = BUCKETS.flatMap(([bucket, low, high]) => {
    const inBucket = resolved.filter((entry) => entry.probability >= low && entry.probability < high)
    if (inBucket.length === 0) return []
    const predicted = inBucket.reduce((sum, entry) => sum + entry.probability, 0) / inBucket.length
    const observed = inBucket.filter((entry) => (entry.excessReturn ?? 0) > 0).length / inBucket.length
    return [{ bucket, predicted, observed, n: inBucket.length }]
  })

  return {
    live: { n, hits, hitRate: n === 0 ? 0 : hits / n, ci, baselineHitRate: BASELINE_HIT_RATE },
    weekly: [...weeks.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, week]) => ({ weekStart: key, ...week })),
    calibration,
    hypothetical: {
      label: 'Hypothetical (backtest)',
      n: 412,
      hitRate: 0.55,
      note: 'Walk-forward backtest on past data, fitted with hindsight about which features to use. Not a live result.',
    },
  }
}
