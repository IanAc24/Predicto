import { Link } from '@tanstack/react-router'
import { useTrackRecord, useWatchlist } from '../../api/hooks'
import type { WatchlistItem } from '../../api/types'
import { useT } from '../../i18n/useT'
import { formatMoney, formatProbability } from '../../lib/format'
import {
  Card,
  Column,
  Columns,
  EmptyState,
  HeroCard,
  Label,
  Pill,
  PillGroup,
  ScreenTitle,
  SignedChange,
  Sparkline,
  StateBadge,
  StatusScreen,
  buttonClass,
} from '../../ui'
import { SORTS, sortItems, type Sort } from './sort'

const SORT_KEYS = {
  name: 'watchlist.sortName',
  change: 'watchlist.sortChange',
  probability: 'watchlist.sortProbability',
} as const

export function WatchlistScreen({
  sort,
  onSortChange,
}: {
  sort: Sort
  onSortChange: (sort: Sort) => void
}) {
  const { t } = useT()
  const watchlist = useWatchlist()
  const items = watchlist.data

  return (
    <div className="flex flex-col gap-4">
      <ScreenTitle>{t('watchlist.title')}</ScreenTitle>
      {watchlist.isPending ? (
        <StatusScreen status="loading" />
      ) : watchlist.isError || !items ? (
        <StatusScreen status="error" onRetry={() => void watchlist.refetch()} />
      ) : items.length === 0 ? (
        <EmptyState text={t('watchlist.emptyText')}>
          <Link to="/add" className={buttonClass('primary')}>
            {t('watchlist.addStock')}
          </Link>
        </EmptyState>
      ) : (
        <Columns>
          <Column>
            <Summary items={items} />
            <Link to="/add" className={buttonClass('primary')}>
              {t('watchlist.addStock')}
            </Link>
          </Column>
          <Column>
            <Card className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label id="watchlist-sort-label">{t('watchlist.sortLabel')}</Label>
                <PillGroup aria-labelledby="watchlist-sort-label">
                  {SORTS.map((key) => (
                    <Pill key={key} active={sort === key} onClick={() => onSortChange(key)}>
                      {t(SORT_KEYS[key])}
                    </Pill>
                  ))}
                </PillGroup>
              </div>
              <ul aria-label={t('watchlist.listLabel')} className="flex flex-col gap-4">
                {sortItems(items, sort).map((item) => (
                  <li key={item.instrument.id}>
                    <StockRow item={item} />
                  </li>
                ))}
              </ul>
            </Card>
          </Column>
        </Columns>
      )}
    </div>
  )
}

function Summary({ items }: { items: WatchlistItem[] }) {
  const { t, locale } = useT()
  const record = useTrackRecord()
  const count = (state: WatchlistItem['prediction']['state']) =>
    items.filter((item) => item.prediction.state === state).length
  const live = record.data?.live
  const pct = (value: number) => formatProbability(value, locale)

  return (
    <HeroCard className="flex flex-col gap-3">
      <div>
        <Label>{t('watchlist.followed')}</Label>
        <p className="font-display text-[40px] font-semibold leading-none tabular-nums">{items.length}</p>
      </div>
      <p className="text-sm text-muted">
        {t('watchlist.countActive', { count: count('active') })} ·{' '}
        {t('watchlist.countObserving', { count: count('observing') })} ·{' '}
        {t('watchlist.countNoSignal', { count: count('no-signal') })}
      </p>
      <div>
        <Label>{t('watchlist.hitRateLabel')}</Label>
        {live && live.n > 0 ? (
          <>
            <p className="text-base font-semibold tabular-nums">
              {t('watchlist.hitRateValue', {
                rate: pct(live.hitRate),
                n: live.n,
                low: pct(live.ci[0]),
                high: pct(live.ci[1]),
              })}
            </p>
            <p className="text-sm text-muted">
              {t('watchlist.baseline', { rate: pct(live.baselineHitRate) })}
            </p>
          </>
        ) : (
          record.isSuccess && <p className="text-sm text-muted">{t('watchlist.hitRateNone')}</p>
        )}
      </div>
    </HeroCard>
  )
}

function StockRow({ item }: { item: WatchlistItem }) {
  const { t, locale } = useT()
  const { instrument, prediction } = item
  const badge =
    prediction.state === 'active' && prediction.probability !== null ? (
      <StateBadge state="active" probability={prediction.probability} baseRate={prediction.baseRate} />
    ) : prediction.state === 'observing' ? (
      <StateBadge
        state="observing"
        day={prediction.observation.day}
        total={prediction.observation.total}
      />
    ) : (
      <StateBadge state="no-signal" />
    )

  return (
    <Link
      to="/stocks/$instrumentId"
      params={{ instrumentId: instrument.id }}
      className="block rounded-xl text-inherit no-underline"
    >
      {/* Three lines so long names wrap instead of being cut off on phones */}
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1">
        <p className="min-w-0 break-words text-base">
          {instrument.name} <span className="ml-1 text-muted">{instrument.symbol}</span>
        </p>
        <div className="flex items-center gap-3">
          <Sparkline values={item.sparkline} label={t('watchlist.trend', { symbol: instrument.symbol })} />
          <span className="text-base font-semibold tabular-nums">
            {formatMoney(item.lastClose, instrument.currency, locale)}
          </span>
        </div>
        <p className="text-xs text-muted">{`${instrument.exchange} · ${instrument.currency}`}</p>
        <SignedChange value={item.changePct} className="justify-self-end text-xs" />
        <div className="col-span-2 mt-1">{badge}</div>
      </div>
    </Link>
  )
}
