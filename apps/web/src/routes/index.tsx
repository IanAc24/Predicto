import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { WatchlistScreen } from '../features/watchlist/WatchlistScreen'
import { parseSort, type Sort } from '../features/watchlist/sort'

export const Route = createFileRoute('/')({
  validateSearch: (search: Record<string, unknown>): { sort?: Sort } => {
    const sort = parseSort(search.sort)
    return sort ? { sort } : {}
  },
  component: WatchlistRoute,
})

function WatchlistRoute() {
  const { sort } = Route.useSearch()
  const navigate = useNavigate({ from: '/' })
  return (
    <WatchlistScreen
      sort={sort ?? 'name'}
      onSortChange={(next) => void navigate({ search: { sort: next }, replace: true })}
    />
  )
}
