import { Link } from '@tanstack/react-router'
import { useWatchlist } from '../../api/hooks'
import { useT } from '../../i18n/useT'
import { Card, Label, Row, StatusScreen } from '../../ui'
import { RemoveControl } from './RemoveControl'
import { listingMeta } from './listingMeta'

/** Current watchlist with remove (after an inline confirmation). */
export function FollowingList() {
  const { t } = useT()
  const watchlist = useWatchlist()

  return (
    <section aria-labelledby="following-heading" className="flex flex-col gap-3">
      <Label id="following-heading" className="px-1">
        {t('add.followingTitle')}
      </Label>
      {watchlist.isPending ? (
        <StatusScreen status="loading" />
      ) : watchlist.isError ? (
        <StatusScreen status="error" onRetry={() => void watchlist.refetch()} />
      ) : watchlist.data.length === 0 ? (
        <Card>
          <p className="text-sm text-muted">{t('add.followingEmpty')}</p>
        </Card>
      ) : (
        <Card>
          <ul className="m-0 flex list-none flex-col p-0">
            {watchlist.data.map(({ instrument }) => (
              <li
                key={instrument.id}
                className="flex flex-col gap-3 border-b border-border py-3 first:pt-0 last:border-b-0 last:pb-0"
              >
                <Row
                  name={
                    <Link
                      to="/stocks/$instrumentId"
                      params={{ instrumentId: instrument.id }}
                      className="text-text no-underline hover:underline"
                    >
                      {instrument.name}
                    </Link>
                  }
                  meta={listingMeta(instrument)}
                />
                <RemoveControl instrument={instrument} />
              </li>
            ))}
          </ul>
        </Card>
      )}
    </section>
  )
}
