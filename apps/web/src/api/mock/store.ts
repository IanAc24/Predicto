import type {
  Bar,
  BarRange,
  DataStatus,
  Instrument,
  LedgerEntry,
  Prediction,
  PredictionState,
  Scenario,
  TrackRecord,
  UserSettings,
  WatchlistItem,
} from '../types'
import { END_DATE, generateBars, sliceBars } from './bars'
import { ADDYY, ADS, ALL_INSTRUMENTS, NKE } from './instruments'
import { computeLiveRecord, computeTrackRecord, generateLedger } from './ledger'

const ISSUED_AT = `${END_DATE}T21:30:00Z`
const DAYS_PER_WEEK = 5

export const DEFAULT_SETTINGS: UserSettings = {
  observationWeeks: 6,
  benchmark: 'SPY',
  displayCurrency: 'USD',
}

export type MockStore = {
  readonly scenario: Scenario
  getWatchlist(): WatchlistItem[]
  getInstrument(id: string): Instrument
  getBars(id: string, range: BarRange): Bar[]
  getPrediction(id: string): Prediction
  getLedger(instrumentId?: string): LedgerEntry[]
  getTrackRecord(): TrackRecord
  getDataStatus(): DataStatus
  getUserSettings(): UserSettings
  updateUserSettings(patch: Partial<UserSettings>): UserSettings
  searchInstruments(query: string): Instrument[]
  addToWatchlist(id: string): WatchlistItem
  removeFromWatchlist(id: string): void
}

type Seed = { state: PredictionState; day: number; probability?: number; baseRate: number }

const DEFAULT_SEEDS: Record<string, Seed> = {
  [NKE.id]: { state: 'active', day: 30, probability: 0.58, baseRate: 0.52 },
  [ADS.id]: { state: 'observing', day: 12, baseRate: 0.5 },
  [ADDYY.id]: { state: 'no-signal', day: 30, baseRate: 0.51 },
}

const OBSERVING_SEEDS: Record<string, Seed> = {
  [NKE.id]: { state: 'observing', day: 21, baseRate: 0.52 },
  [ADS.id]: { state: 'observing', day: 12, baseRate: 0.5 },
  [ADDYY.id]: { state: 'observing', day: 5, baseRate: 0.51 },
}

function seedsFor(scenario: Scenario): Record<string, Seed> {
  if (scenario === 'empty') return {}
  if (scenario === 'observing') return OBSERVING_SEEDS
  return DEFAULT_SEEDS
}

/** Builds the in-memory backend for one scenario. Synchronous; hooks.ts adds the delay and errors. */
export function createMockStore(scenario: Scenario = 'default'): MockStore {
  const settings: UserSettings = { ...DEFAULT_SETTINGS }
  const instruments = new Map(ALL_INSTRUMENTS.map((instrument) => [instrument.id, instrument]))
  const barCache = new Map<string, Bar[]>()
  // The empty and observing scenarios model a fresh install: nothing has been issued yet.
  const ledger: LedgerEntry[] = scenario === 'empty' || scenario === 'observing' ? [] : generateLedger()
  const dataStatus: DataStatus = {
    provider: 'Mock data',
    lastRun: scenario === 'stale' ? '2026-10-19T21:30:00Z' : ISSUED_AT,
    stale: scenario === 'stale',
  }

  const predictions = new Map<string, Prediction>()
  const watchlist: string[] = []

  const requireInstrument = (id: string): Instrument => {
    const instrument = instruments.get(id)
    if (!instrument) throw new Error(`Unknown instrument: ${id}`)
    return instrument
  }

  const barsFor = (id: string): Bar[] => {
    requireInstrument(id)
    let bars = barCache.get(id)
    if (!bars) {
      bars = generateBars(id)
      barCache.set(id, bars)
    }
    return bars
  }

  const buildPrediction = (instrumentId: string, seed: Seed): Prediction => {
    const active = seed.state === 'active'
    return {
      id: `${instrumentId}:${END_DATE}`,
      instrumentId,
      state: seed.state,
      issuedAt: ISSUED_AT,
      horizonDays: 5,
      target: 'beat-benchmark',
      benchmark: settings.benchmark,
      probability: active ? (seed.probability ?? null) : null,
      baseRate: seed.baseRate,
      observation: { day: seed.day, total: settings.observationWeeks * DAYS_PER_WEEK },
      modelVersion: seed.state === 'observing' ? 'none' : 'baseline-0.3.0',
      drivers: active
        ? [
            { label: '4-week momentum vs benchmark', direction: 'up', weight: 0.34 },
            { label: 'Volume trend', direction: 'up', weight: 0.21 },
            { label: 'Recent volatility', direction: 'down', weight: 0.18 },
          ]
        : [],
      liveRecord: computeLiveRecord(ledger.filter((entry) => entry.instrumentId === instrumentId)),
    }
  }

  const toItem = (id: string): WatchlistItem => {
    const bars = barsFor(id)
    const last = bars[bars.length - 1]
    const previous = bars[bars.length - 2]
    const prediction = predictions.get(id)
    if (!prediction) throw new Error(`Not on the watchlist: ${id}`)
    return {
      instrument: requireInstrument(id),
      lastClose: last.close,
      changePct: Math.round(((last.close / previous.close - 1) * 100) * 100) / 100,
      sparkline: bars.slice(-30).map((bar) => bar.close),
      asOf: last.time,
      prediction,
    }
  }

  for (const [id, seed] of Object.entries(seedsFor(scenario))) {
    watchlist.push(id)
    predictions.set(id, buildPrediction(id, seed))
  }

  return {
    scenario,
    getWatchlist: () => watchlist.map(toItem),
    getInstrument: requireInstrument,
    getBars: (id, range) => sliceBars(barsFor(id), range),
    getPrediction(id) {
      const prediction = predictions.get(id)
      if (!prediction) throw new Error(`Not on the watchlist: ${id}`)
      return prediction
    },
    getLedger: (instrumentId) =>
      ledger.filter((entry) => instrumentId === undefined || entry.instrumentId === instrumentId),
    getTrackRecord: () => computeTrackRecord(ledger),
    getDataStatus: () => ({ ...dataStatus }),
    getUserSettings: () => ({ ...settings }),
    updateUserSettings(patch) {
      Object.assign(settings, patch)
      return { ...settings }
    },
    searchInstruments(query) {
      const needle = query.trim().toLowerCase()
      if (!needle) return []
      const score = (instrument: Instrument): number => {
        const symbol = instrument.symbol.toLowerCase()
        if (symbol === needle) return 0
        if (symbol.startsWith(needle) || instrument.name.toLowerCase().startsWith(needle)) return 1
        if (`${instrument.id} ${instrument.name}`.toLowerCase().includes(needle)) return 2
        return -1
      }
      return ALL_INSTRUMENTS.map((instrument) => ({ instrument, rank: score(instrument) }))
        .filter(({ rank }) => rank >= 0)
        .sort((a, b) => a.rank - b.rank || a.instrument.name.localeCompare(b.instrument.name))
        .map(({ instrument }) => instrument)
    },
    addToWatchlist(id) {
      requireInstrument(id)
      if (watchlist.includes(id)) throw new Error(`Already on the watchlist: ${id}`)
      watchlist.push(id)
      predictions.set(id, buildPrediction(id, { state: 'observing', day: 1, baseRate: 0.5 }))
      return toItem(id)
    },
    removeFromWatchlist(id) {
      const index = watchlist.indexOf(id)
      if (index === -1) throw new Error(`Not on the watchlist: ${id}`)
      watchlist.splice(index, 1)
      predictions.delete(id)
    },
  }
}
