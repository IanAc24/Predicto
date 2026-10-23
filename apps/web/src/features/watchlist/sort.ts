import type { WatchlistItem } from '../../api/types'

export const SORTS = ['name', 'change', 'probability'] as const
export type Sort = (typeof SORTS)[number]

/** Unknown values become undefined (the default sort), so links to "/" need no search params. */
export function parseSort(value: unknown): Sort | undefined {
  return SORTS.find((sort) => sort === value)
}

/** Name A-Z, day change high to low, or probability high to low (stocks without one go last). */
export function sortItems(items: WatchlistItem[], sort: Sort): WatchlistItem[] {
  const byName = (a: WatchlistItem, b: WatchlistItem) => a.instrument.name.localeCompare(b.instrument.name)
  const probability = (item: WatchlistItem) => item.prediction.probability ?? -1
  const copy = [...items]
  if (sort === 'change') return copy.sort((a, b) => b.changePct - a.changePct || byName(a, b))
  if (sort === 'probability') return copy.sort((a, b) => probability(b) - probability(a) || byName(a, b))
  return copy.sort(byName)
}
