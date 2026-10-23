import { Link } from '@tanstack/react-router'
import { useAddToWatchlist, useUserSettings } from '../../api/hooks'
import type { Instrument } from '../../api/types'
import { useT } from '../../i18n/useT'
import { Button, Row, buttonClass } from '../../ui'
import { RemoveControl } from './RemoveControl'
import { listingMeta } from './listingMeta'

/** One search result: add, or "Following" with remove. */
export function ResultItem({
  instrument,
  followed,
  watchlistReady,
}: {
  instrument: Instrument
  followed: boolean
  /** False until the watchlist has loaded, so nothing is added twice by mistake. */
  watchlistReady: boolean
}) {
  const { t } = useT()
  const add = useAddToWatchlist()
  const settings = useUserSettings()
  const params = { name: instrument.name, symbol: instrument.symbol, exchange: instrument.exchange }

  function handleAdd() {
    if (followed || add.isPending || !watchlistReady) return
    add.mutate(instrument.id)
  }

  const weeks = settings.data?.observationWeeks

  return (
    <li className="flex flex-col gap-3 border-b border-border py-3 first:pt-0 last:border-b-0 last:pb-0">
      <Row
        name={instrument.name}
        meta={listingMeta(instrument)}
        right={
          followed ? (
            <span className="text-sm text-accent">✓ {t('add.following')}</span>
          ) : (
            <Button
              className="px-4 py-2 text-sm"
              aria-label={t('add.addLabel', params)}
              disabled={add.isPending || !watchlistReady}
              onClick={handleAdd}
            >
              {add.isPending ? t('add.adding') : t('add.add')}
            </Button>
          )
        }
      />
      {followed && <RemoveControl instrument={instrument} />}
      {add.isError && !followed && (
        <div role="alert" className="flex flex-wrap items-center gap-3 text-sm text-danger">
          <span>{t('add.addError', params)}</span>
          <Button variant="secondary" className="px-4 py-2 text-sm" onClick={handleAdd}>
            {t('common.retry')}
          </Button>
        </div>
      )}
      {add.isSuccess && followed && (
        <p role="status" className="text-sm text-muted">
          {weeks === undefined
            ? t('add.addedConfirmGeneric')
            : t('add.addedConfirm', { weeks })}{' '}
          <Link
            to="/stocks/$instrumentId"
            params={{ instrumentId: instrument.id }}
            aria-label={t('add.viewStock', params)}
            className={buttonClass('secondary', 'ml-1 px-4 py-2 text-sm')}
          >
            {instrument.symbol}
          </Link>
        </p>
      )}
    </li>
  )
}
