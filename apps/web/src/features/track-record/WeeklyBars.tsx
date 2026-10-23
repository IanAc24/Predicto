import type { TrackRecord } from '../../api/types'
import { useT } from '../../i18n/useT'
import { formatDate } from '../../lib/format'
import { Card, Label } from '../../ui'

/** Hits stacked on misses, one column per week. Text alternative is a table for screen readers. */
export function WeeklyBars({ weekly }: { weekly: TrackRecord['weekly'] }) {
  const { t, locale } = useT()
  const max = Math.max(1, ...weekly.map((week) => week.n))
  const shortDate = (iso: string) =>
    new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(
      new Date(iso),
    )

  return (
    <Card aria-labelledby="weekly-title">
      <Label id="weekly-title">{t('trackRecord.weeklyTitle')}</Label>
      <div className="mt-3 flex gap-4 text-xs text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="size-2.5 rounded-sm bg-up" />
          {t('trackRecord.weeklyHits')}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="size-2.5 rounded-sm bg-down" />
          {t('trackRecord.weeklyMisses')}
        </span>
      </div>
      <div className="mt-3 flex h-[140px] items-end gap-1" aria-hidden="true">
        {weekly.map((week) => (
          <div key={week.weekStart} className="flex h-full min-w-0 flex-1 flex-col justify-end">
            <div
              className="flex flex-col justify-end overflow-hidden rounded-t-sm"
              style={{ height: `${(week.n / max) * 100}%` }}
              title={t('trackRecord.weeklySummary', { hits: week.hits, misses: week.n - week.hits })}
            >
              <div className="bg-down" style={{ flexGrow: week.n - week.hits }} />
              <div className="bg-up" style={{ flexGrow: week.hits }} />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[11px] text-muted" aria-hidden="true">
        <span>{weekly[0] ? shortDate(weekly[0].weekStart) : ''}</span>
        <span>{weekly.length > 1 ? shortDate(weekly[weekly.length - 1].weekStart) : ''}</span>
      </div>
      <table className="sr-only">
        <caption>{t('trackRecord.weeklyChartLabel')}</caption>
        <thead>
          <tr>
            <th scope="col">{t('trackRecord.weeklyWeek', { date: '' }).trim()}</th>
            <th scope="col">{t('trackRecord.weeklyHits')}</th>
            <th scope="col">{t('trackRecord.weeklyMisses')}</th>
          </tr>
        </thead>
        <tbody>
          {weekly.map((week) => (
            <tr key={week.weekStart}>
              <th scope="row">{formatDate(week.weekStart, 'UTC', locale)}</th>
              <td>{week.hits}</td>
              <td>{week.n - week.hits}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}
