// Domain types. They mirror the OpenAPI contract in /contracts; once the generated client
// exists these will be replaced by its types.

export type Currency = 'USD' | 'EUR'

export type Instrument = {
  /** Exchange-qualified id, e.g. 'NYSE:NKE'. */
  id: string
  symbol: string
  name: string
  exchange: string
  currency: Currency
  /** IANA time zone of the exchange, e.g. 'America/New_York'. */
  timeZone: string
}

export type Bar = {
  /** Trading day, 'YYYY-MM-DD'. */
  time: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export type PredictionState = 'observing' | 'active' | 'no-signal'

export type Driver = {
  label: string
  direction: 'up' | 'down'
  weight: number
}

export type Prediction = {
  id: string
  instrumentId: string
  state: PredictionState
  issuedAt: string
  horizonDays: number
  target: 'beat-benchmark'
  /** Benchmark symbol, e.g. 'SPY'. */
  benchmark: string
  /** Probability (0..1) of beating the benchmark; null unless state is 'active'. */
  probability: number | null
  /** Share (0..1) of past weeks in which the target happened. */
  baseRate: number
  observation: { day: number; total: number }
  modelVersion: string
  drivers: Driver[]
  /** Resolved live predictions for this instrument: n, hits and a 95% interval (0..1). */
  liveRecord: { n: number; hits: number; ci: [number, number] }
}

export type WatchlistItem = {
  instrument: Instrument
  lastClose: number
  /** Day change in percent units: 1.2 means +1.2%. */
  changePct: number
  sparkline: number[]
  /** Trading day of lastClose, 'YYYY-MM-DD'. */
  asOf: string
  prediction: Prediction
}

export type LedgerOutcome = 'hit' | 'miss' | 'pending'

export type LedgerEntry = {
  id: string
  instrumentId: string
  issuedAt: string
  resolvesAt: string
  probability: number
  outcome: LedgerOutcome
  /** Return versus the benchmark in percent units; null while pending. */
  excessReturn: number | null
}

export type TrackRecord = {
  live: {
    n: number
    hits: number
    hitRate: number
    ci: [number, number]
    baselineHitRate: number
  }
  weekly: { weekStart: string; n: number; hits: number }[]
  calibration: { bucket: string; predicted: number; observed: number; n: number }[]
  /** Backtest results. Never combined with the live numbers. */
  hypothetical: { label: string; n: number; hitRate: number; note: string }
}

export type DataStatus = {
  provider: string
  lastRun: string
  stale: boolean
}

export type UserSettings = {
  observationWeeks: number
  benchmark: string
  displayCurrency: Currency
}

export type BarRange = '1M' | '6M' | '1Y' | '3Y'

export type Scenario = 'default' | 'empty' | 'observing' | 'stale' | 'error'
