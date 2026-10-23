import { describe, expect, test } from 'vitest'
import { parseScenario } from './index'
import { createMockStore } from './store'

describe('scenarios', () => {
  test('parseScenario reads the search param and falls back to default', () => {
    expect(parseScenario('?scenario=empty')).toBe('empty')
    expect(parseScenario('?scenario=stale&x=1')).toBe('stale')
    expect(parseScenario('?scenario=nope')).toBe('default')
    expect(parseScenario('')).toBe('default')
  })

  test('default: NKE active, ADS observing, ADDYY no-signal', () => {
    const items = createMockStore('default').getWatchlist()
    const states = Object.fromEntries(items.map((item) => [item.instrument.id, item.prediction.state]))
    expect(states).toEqual({
      'NYSE:NKE': 'active',
      'XETRA:ADS': 'observing',
      'OTC:ADDYY': 'no-signal',
    })
    const nke = items.find((item) => item.instrument.id === 'NYSE:NKE')!
    expect(nke.prediction.probability).toBe(0.58)
    expect(items.find((item) => item.instrument.id === 'OTC:ADDYY')!.prediction.probability).toBeNull()
  })

  test('empty has no watchlist and no history', () => {
    const store = createMockStore('empty')
    expect(store.getWatchlist()).toEqual([])
    expect(store.getLedger()).toEqual([])
    expect(store.getTrackRecord().live.n).toBe(0)
  })

  test('observing: every followed stock is observing', () => {
    const items = createMockStore('observing').getWatchlist()
    expect(items).toHaveLength(3)
    expect(items.every((item) => item.prediction.state === 'observing')).toBe(true)
  })

  test('stale flags the data status', () => {
    expect(createMockStore('stale').getDataStatus().stale).toBe(true)
    expect(createMockStore('default').getDataStatus().stale).toBe(false)
  })
})

describe('fixtures', () => {
  test('are deterministic', () => {
    const a = createMockStore('default')
    const b = createMockStore('default')
    expect(a.getBars('NYSE:NKE', '3Y')).toEqual(b.getBars('NYSE:NKE', '3Y'))
    expect(a.getLedger()).toEqual(b.getLedger())
  })

  test('bars cover about three years, skip weekends and end at the anchor price', () => {
    const bars = createMockStore().getBars('XETRA:ADS', '3Y')
    expect(bars.length).toBe(780)
    for (const bar of bars) {
      const day = new Date(`${bar.time}T00:00:00Z`).getUTCDay()
      expect([0, 6]).not.toContain(day)
      expect(bar.high).toBeGreaterThanOrEqual(Math.max(bar.open, bar.close))
      expect(bar.low).toBeLessThanOrEqual(Math.min(bar.open, bar.close))
    }
    expect(bars[bars.length - 1].close).toBe(186.3)
  })

  test('ranges return fewer bars', () => {
    const store = createMockStore()
    expect(store.getBars('NYSE:NKE', '1M').length).toBeLessThan(store.getBars('NYSE:NKE', '6M').length)
    expect(store.getBars('NYSE:NKE', '1Y').length).toBe(252)
  })

  test('ledger has ~40 resolved and a few pending predictions', () => {
    const ledger = createMockStore().getLedger()
    const pending = ledger.filter((entry) => entry.outcome === 'pending')
    expect(ledger.length - pending.length).toBeGreaterThanOrEqual(40)
    expect(pending.length).toBeGreaterThanOrEqual(2)
    expect(pending.every((entry) => entry.excessReturn === null)).toBe(true)
  })

  test('track record is derived from the ledger', () => {
    const store = createMockStore()
    const record = store.getTrackRecord()
    const resolved = store.getLedger().filter((entry) => entry.outcome !== 'pending')
    expect(record.live.n).toBe(resolved.length)
    expect(record.weekly.reduce((sum, week) => sum + week.n, 0)).toBe(resolved.length)
    expect(record.live.ci[0]).toBeLessThan(record.live.hitRate)
    expect(record.live.ci[1]).toBeGreaterThan(record.live.hitRate)
  })
})

describe('watchlist mutations', () => {
  test('add puts the instrument in observing at day 1', () => {
    const store = createMockStore('default')
    const item = store.addToWatchlist('NASDAQ:LULU')
    expect(item.prediction.state).toBe('observing')
    expect(item.prediction.observation.day).toBe(1)
    expect(item.prediction.observation.total).toBe(30)
    expect(store.getWatchlist().map((entry) => entry.instrument.id)).toContain('NASDAQ:LULU')
  })

  test('a duplicate add is rejected', () => {
    const store = createMockStore('default')
    expect(() => store.addToWatchlist('NYSE:NKE')).toThrow(/already/i)
    expect(store.getWatchlist()).toHaveLength(3)
  })

  test('unknown instruments are rejected', () => {
    expect(() => createMockStore().addToWatchlist('NYSE:NOPE')).toThrow(/unknown/i)
  })

  test('remove drops it, and re-adding starts observation over', () => {
    const store = createMockStore('default')
    store.removeFromWatchlist('NYSE:NKE')
    expect(store.getWatchlist().map((entry) => entry.instrument.id)).not.toContain('NYSE:NKE')
    expect(() => store.removeFromWatchlist('NYSE:NKE')).toThrow()
    expect(store.addToWatchlist('NYSE:NKE').prediction.observation.day).toBe(1)
  })

  test('settings update changes observation length for new additions', () => {
    const store = createMockStore('empty')
    store.updateUserSettings({ observationWeeks: 4 })
    expect(store.addToWatchlist('NYSE:SKX').prediction.observation.total).toBe(20)
  })
})

describe('search', () => {
  const store = createMockStore()
  test('Adidas shows up on XETRA and as an ADR', () => {
    expect(store.searchInstruments('adidas').map((instrument) => instrument.id)).toEqual([
      'XETRA:ADS',
      'OTC:ADDYY',
    ])
  })
  test('symbol match ranks first; blank returns nothing', () => {
    expect(store.searchInstruments('nke')[0].id).toBe('NYSE:NKE')
    expect(store.searchInstruments('  ')).toEqual([])
    expect(store.searchInstruments('zzzz')).toEqual([])
  })
})
