import type { Scenario } from '../types'
import { createMockStore } from './store'

const SCENARIOS: Scenario[] = ['default', 'empty', 'observing', 'stale', 'error']

/** Reads `?scenario=` from a URL search string; anything unknown means 'default'. */
export function parseScenario(search: string): Scenario {
  const value = new URLSearchParams(search).get('scenario')
  return SCENARIOS.find((scenario) => scenario === value) ?? 'default'
}

function readScenarioAtStartup(): Scenario {
  return typeof window === 'undefined' ? 'default' : parseScenario(window.location.search)
}

/** Mock backend shared by every hook. The scenario is read once, when the app starts. */
export const mockStore = createMockStore(readScenarioAtStartup())

/** Simulated network latency in ms. Tests set it to 0. */
export const mockConfig = { delayMs: 250 }

export { createMockStore } from './store'
export type { MockStore } from './store'
