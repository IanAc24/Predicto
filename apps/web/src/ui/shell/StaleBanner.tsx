import { useDataStatus } from '../../api/hooks'
import { useT } from '../../i18n/useT'

/** Warns when the data pipeline has not refreshed recently. Renders nothing otherwise. */
export function StaleBanner() {
  const { data } = useDataStatus()
  const { t } = useT()
  if (!data?.stale) return null

  return (
    <p
      role="status"
      className="rounded-2xl border border-warning bg-surface px-4 py-3 text-sm font-semibold text-warning"
    >
      {t('common.staleData')}
    </p>
  )
}
