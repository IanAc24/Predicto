import { getRouteApi } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { useSearchInstruments, useWatchlist } from '../../api/hooks'
import type { Instrument } from '../../api/types'
import { useT } from '../../i18n/useT'
import { Card, Pill, PillGroup, ScreenTitle, StatusScreen } from '../../ui'
import { FollowingList } from './FollowingList'
import { ResultItem } from './ResultItem'

const routeApi = getRouteApi('/add')
const DEBOUNCE_MS = 250
const SUGGESTIONS = ['NKE', 'ADS', 'PUMA']

/** The company name without a trailing "(ADR)"-style qualifier, for spotting multiple listings. */
function companyKey(instrument: Instrument): string {
  return instrument.name.replace(/\s*\(.*\)\s*$/, '').trim().toLowerCase()
}

function hasMultipleListings(instruments: Instrument[]): boolean {
  const seen = new Set<string>()
  for (const instrument of instruments) {
    const key = companyKey(instrument)
    if (seen.has(key)) return true
    seen.add(key)
  }
  return false
}

export function AddScreen() {
  const { t } = useT()
  const navigate = routeApi.useNavigate()
  const { q = '' } = routeApi.useSearch()
  const [draft, setDraft] = useState(q)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Keep the URL in step with the field, after a short pause in typing.
  useEffect(() => {
    const next = draft.trim()
    if (next === q.trim()) return
    const timer = setTimeout(() => {
      void navigate({ search: { q: next || undefined }, replace: true })
    }, DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [draft, q, navigate])

  const query = q.trim()
  const search = useSearchInstruments(query)
  const watchlist = useWatchlist()
  const followedIds = new Set(watchlist.data?.map((item) => item.instrument.id))

  function renderResults() {
    if (!query) {
      return (
        <Card className="flex flex-col gap-4">
          <p className="text-sm text-muted">{t('add.hint')}</p>
          <div className="flex flex-col gap-2">
            <p id="suggestions-label" className="text-xs uppercase tracking-wider text-muted">
              {t('add.suggestionsLabel')}
            </p>
            <PillGroup aria-labelledby="suggestions-label">
              {SUGGESTIONS.map((symbol) => (
                <Pill key={symbol} onClick={() => setDraft(symbol)}>
                  {symbol}
                </Pill>
              ))}
            </PillGroup>
          </div>
        </Card>
      )
    }
    if (search.isPending) return <StatusScreen status="loading" />
    if (search.isError) return <StatusScreen status="error" onRetry={() => void search.refetch()} />
    if (search.data.length === 0) {
      return (
        <Card>
          <p role="status" className="text-sm text-muted">
            {t('add.noResults', { q: query })}
          </p>
        </Card>
      )
    }
    return (
      <Card className="flex flex-col gap-4">
        {hasMultipleListings(search.data) && (
          <p className="text-sm text-muted">{t('add.listingsNote')}</p>
        )}
        <ul aria-label={t('add.resultsLabel')} className="m-0 flex list-none flex-col p-0">
          {search.data.map((instrument) => (
            <ResultItem
              key={instrument.id}
              instrument={instrument}
              followed={followedIds.has(instrument.id)}
              watchlistReady={watchlist.isSuccess}
            />
          ))}
        </ul>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <ScreenTitle>{t('add.title')}</ScreenTitle>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="add-search" className="text-xs uppercase tracking-wider text-muted">
          {t('add.searchLabel')}
        </label>
        <input
          ref={inputRef}
          id="add-search"
          type="search"
          autoComplete="off"
          value={draft}
          placeholder={t('add.searchPlaceholder')}
          onChange={(event) => setDraft(event.target.value)}
          className="appearance-none rounded-xl border border-border bg-surface-2 px-3.5 py-3 text-base text-text"
        />
      </div>
      {renderResults()}
      <FollowingList />
    </div>
  )
}
