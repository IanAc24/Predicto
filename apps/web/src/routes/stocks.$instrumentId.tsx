import { createFileRoute } from '@tanstack/react-router'
import type { BarRange } from '../api/types'
import { DetailScreen } from '../features/detail/DetailScreen'
import { RANGES } from '../features/detail/range'

type DetailSearch = {
  /** Omitted means the default range; DetailScreen resolves it with parseRange. */
  range?: BarRange
  /** Mock API scenario; read from the URL at startup by the mock store, kept here so it survives navigation. */
  scenario?: string
}

export const Route = createFileRoute('/stocks/$instrumentId')({
  validateSearch: (search: Record<string, unknown>): DetailSearch => ({
    ...(RANGES.includes(search.range as BarRange) ? { range: search.range as BarRange } : {}),
    ...(typeof search.scenario === 'string' ? { scenario: search.scenario } : {}),
  }),
  component: DetailScreen,
})
