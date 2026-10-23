import { createFileRoute } from '@tanstack/react-router'
import type { BarRange } from '../api/types'
import { DetailScreen } from '../features/detail/DetailScreen'
import { parseRange } from '../features/detail/range'

type DetailSearch = {
  range: BarRange
  /** Mock API scenario; read from the URL at startup by the mock store, kept here so it survives navigation. */
  scenario?: string
}

export const Route = createFileRoute('/stocks/$instrumentId')({
  validateSearch: (search: { range?: unknown; scenario?: unknown }): DetailSearch => ({
    range: parseRange(search.range),
    ...(typeof search.scenario === 'string' ? { scenario: search.scenario } : {}),
  }),
  component: DetailScreen,
})
