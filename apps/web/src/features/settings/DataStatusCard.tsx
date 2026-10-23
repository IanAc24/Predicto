import { useDataStatus } from '../../api/hooks'
import { useT } from '../../i18n/useT'
import { SectionCard, Row, StatusScreen } from '../../ui'

export function DataStatusCard() {
  const { t, locale } = useT()
  const status = useDataStatus()

  if (status.isError) return <StatusScreen status="error" onRetry={() => void status.refetch()} />
  if (!status.data) return <StatusScreen status="loading" />

  // No time zone given: Intl uses the viewer's local zone.
  const lastRun = new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(status.data.lastRun),
  )

  return (
    <SectionCard headingStyle="title" title={t('settings.dataTitle')}>
      <div className="mt-4 flex flex-col gap-3">
        <Row name={t('settings.provider')} right={status.data.provider} />
        <Row name={t('settings.lastRun')} right={<time dateTime={status.data.lastRun}>{lastRun}</time>} />
        <p
          role={status.data.stale ? 'alert' : undefined}
          className={status.data.stale ? 'text-[13px] font-semibold text-warning' : 'text-[13px] text-muted'}
        >
          {status.data.stale ? `⚠ ${t('settings.staleWarning')}` : `✓ ${t('settings.fresh')}`}
        </p>
      </div>
    </SectionCard>
  )
}
