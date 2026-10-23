import { getRouteApi } from '@tanstack/react-router'
import { useLedger, useTrackRecord, useWatchlist } from '../../api/hooks'
import { useT } from '../../i18n/useT'
import { EmptyState, ScreenTitle, StatusScreen } from '../../ui'
import { CalibrationChart } from './CalibrationChart'
import { HypotheticalCard } from './HypotheticalCard'
import { LiveHero } from './LiveHero'
import { Ledger } from './Ledger'
import { WeeklyBars } from './WeeklyBars'

const route = getRouteApi('/track-record')

export function TrackRecordScreen() {
  const { t } = useT()
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const trackRecord = useTrackRecord()
  const ledger = useLedger()
  const watchlist = useWatchlist()

  const title = <ScreenTitle>{t('trackRecord.title')}</ScreenTitle>

  if (trackRecord.isError || ledger.isError) {
    return (
      <>
        {title}
        <StatusScreen
          status="error"
          onRetry={() => {
            void trackRecord.refetch()
            void ledger.refetch()
          }}
        />
      </>
    )
  }
  if (!trackRecord.data || !ledger.data) {
    return (
      <>
        {title}
        <StatusScreen status="loading" />
      </>
    )
  }

  const { live, weekly, calibration, hypothetical } = trackRecord.data
  const names = Object.fromEntries(
    (watchlist.data ?? []).map((item) => [item.instrument.id, item.instrument.name]),
  )
  const empty = live.n === 0 && ledger.data.length === 0

  if (empty) {
    return (
      <>
        {title}
        <EmptyState text={t('trackRecord.emptyText')} />
        <HypotheticalCard hypothetical={hypothetical} />
      </>
    )
  }

  return (
    <>
      {title}
      <div className="cols">
        <div className="col">
          <LiveHero live={live} />
          <WeeklyBars weekly={weekly} />
          <CalibrationChart calibration={calibration} />
          <HypotheticalCard hypothetical={hypothetical} />
        </div>
        <div className="col">
          <Ledger
            entries={ledger.data}
            names={names}
            filter={search.filter ?? 'all'}
            instrument={search.instrument}
            onFilterChange={(filter) =>
              void navigate({
                search: (prev) => ({ ...prev, filter: filter === 'all' ? undefined : filter }),
                replace: true,
              })
            }
            onInstrumentChange={(instrument) =>
              void navigate({ search: (prev) => ({ ...prev, instrument }), replace: true })
            }
          />
        </div>
      </div>
    </>
  )
}
