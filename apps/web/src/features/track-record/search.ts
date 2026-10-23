export const OUTCOME_FILTERS = ['all', 'hit', 'miss', 'pending'] as const
export type OutcomeFilter = (typeof OUTCOME_FILTERS)[number]

export type TrackRecordSearch = {
  filter?: OutcomeFilter
  instrument?: string
}

/** Unknown or default values are dropped so the URL stays clean. */
export function validateTrackRecordSearch(search: Record<string, unknown>): TrackRecordSearch {
  const filter = OUTCOME_FILTERS.find((value) => value === search.filter)
  return {
    filter: filter && filter !== 'all' ? filter : undefined,
    instrument:
      typeof search.instrument === 'string' && search.instrument ? search.instrument : undefined,
  }
}
