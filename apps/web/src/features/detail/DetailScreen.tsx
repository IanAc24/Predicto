import { Link, useNavigate, useParams, useSearch } from '@tanstack/react-router'
import { Suspense, lazy, useMemo } from 'react'
import { useBars, useInstrument, useLedger, usePrediction } from '../../api/hooks'
import type { Instrument } from '../../api/types'
import { useT } from '../../i18n/useT'
import { formatDate, formatMoney } from '../../lib/format'
import {
  Card,
  EmptyState,
  Label,
  Pill,
  PillGroup,
  ScreenTitle,
  SignedChange,
  StatusScreen,
  buttonClass,
} from '../../ui'
import { PredictionPanel } from './PredictionPanel'
import { RANGES, parseRange } from './range'
import { RecentPredictions } from './RecentPredictions'

// Loaded on demand so the charting library stays out of the main bundle.
const PriceChart = lazy(() =>
  import('./PriceChart').then((module) => ({ default: module.PriceChart })),
)

/** The mock API rejects with these messages; the real API will answer 404 instead. */
function isNotFound(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.message.startsWith('Unknown instrument') || error.message.startsWith('Not on the watchlist'))
  )
}

export function DetailScreen() {
  const { t } = useT()
  const { instrumentId } = useParams({ from: '/stocks/$instrumentId' })
  const instrumentQuery = useInstrument(instrumentId)
  const predictionQuery = usePrediction(instrumentId)

  const heading = <ScreenTitle className="sr-only">{t('detail.title')}</ScreenTitle>

  if (instrumentQuery.isPending || predictionQuery.isPending) {
    return (
      <>
        {heading}
        <StatusScreen status="loading" />
      </>
    )
  }

  const failure = instrumentQuery.error ?? predictionQuery.error
  if (failure || !instrumentQuery.data || !predictionQuery.data) {
    if (isNotFound(failure)) {
      return (
        <>
          {heading}
          <EmptyState text={t('detail.notFound')}>
            <Link to="/" className={buttonClass('secondary')}>
              {t('detail.notFoundAction')}
            </Link>
          </EmptyState>
        </>
      )
    }
    return (
      <>
        {heading}
        <StatusScreen
          status="error"
          onRetry={() => {
            void instrumentQuery.refetch()
            void predictionQuery.refetch()
          }}
        />
      </>
    )
  }

  return (
    <>
      {heading}
      <DetailContent
        instrument={instrumentQuery.data}
        prediction={predictionQuery.data}
      />
    </>
  )
}

function DetailContent({
  instrument,
  prediction,
}: {
  instrument: Instrument
  prediction: NonNullable<ReturnType<typeof usePrediction>['data']>
}) {
  const { t, locale } = useT()
  const search = useSearch({ from: '/stocks/$instrumentId' })
  const navigate = useNavigate({ from: '/stocks/$instrumentId' })
  const range = parseRange(search.range)

  const barsQuery = useBars(instrument.id, range)
  const ledgerQuery = useLedger(instrument.id)

  const bars = barsQuery.data
  const last = bars?.[bars.length - 1]
  const previous = bars?.[bars.length - 2]
  const entries = useMemo(() => ledgerQuery.data ?? [], [ledgerQuery.data])
  const labels = useMemo(
    () => ({
      hit: t('detail.markerHit'),
      miss: t('detail.markerMiss'),
      pending: t('detail.markerPending'),
    }),
    [t],
  )

  return (
    <div className="flex flex-col gap-4">
      <Link to="/" className="self-start text-sm text-accent">
        <span aria-hidden="true">← </span>
        {t('detail.back')}
      </Link>

      <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div className="min-w-0">
          <h2 className="font-display text-xl font-semibold min-[900px]:text-2xl">
            {instrument.name}{' '}
            <span className="text-muted">{instrument.symbol}</span>
          </h2>
          <p className="mt-0.5 text-xs text-muted">
            {t('detail.meta', {
              exchange: instrument.exchange,
              currency: instrument.currency,
              timeZone: instrument.timeZone,
            })}
          </p>
        </div>
        {last && (
          <div className="text-right">
            <Label>{t('detail.lastClose')}</Label>
            <p className="text-2xl font-semibold tabular-nums">
              {formatMoney(last.close, instrument.currency, locale)}{' '}
              {previous && (
                <SignedChange
                  className="text-base"
                  value={(last.close / previous.close - 1) * 100}
                />
              )}
            </p>
            <p className="text-xs text-muted">
              {t('detail.asOf', { date: formatDate(last.time, instrument.timeZone, locale) })}
            </p>
          </div>
        )}
      </header>

      <div className="grid gap-4 min-[900px]:grid-cols-2 min-[900px]:items-start min-[900px]:gap-5">
        <div className="min-w-0 min-[900px]:col-start-1 min-[900px]:row-start-1">
          <PredictionPanel prediction={prediction} instrument={instrument} />
        </div>

        <Card className="min-w-0 min-[900px]:col-start-2 min-[900px]:row-span-2 min-[900px]:row-start-1">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Label>{t('detail.chartTitle')}</Label>
            <PillGroup aria-label={t('detail.chartRange')}>
              {RANGES.map((value) => (
                <Pill
                  key={value}
                  active={value === range}
                  onClick={() =>
                    void navigate({ search: (prev) => ({ ...prev, range: value }), replace: true })
                  }
                >
                  {value}
                </Pill>
              ))}
            </PillGroup>
          </div>
          <div className="mt-4">
            {barsQuery.isError ? (
              <StatusScreen status="error" onRetry={() => void barsQuery.refetch()} />
            ) : !bars ? (
              <StatusScreen status="loading" />
            ) : (
              <Suspense fallback={<StatusScreen status="loading" />}>
                <PriceChart
                  bars={bars}
                  entries={entries}
                  labels={labels}
                  ariaLabel={t('detail.chartAria', { range })}
                />
              </Suspense>
            )}
          </div>
          <p className="mt-3 text-xs text-muted">{t('detail.chartLegend')}</p>
        </Card>

        <div className="min-w-0 min-[900px]:col-start-1 min-[900px]:row-start-2">
          {ledgerQuery.isError ? (
            <StatusScreen status="error" onRetry={() => void ledgerQuery.refetch()} />
          ) : (
            <RecentPredictions
              entries={entries}
              instrument={instrument}
              benchmark={prediction.benchmark}
              baseRate={prediction.baseRate}
            />
          )}
        </div>
      </div>
    </div>
  )
}
