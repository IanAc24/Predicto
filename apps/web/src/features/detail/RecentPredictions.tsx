import type { Instrument, LedgerEntry } from '../../api/types'
import { useT } from '../../i18n/useT'
import { formatDate, formatProbability } from '../../lib/format'
import { Card, Label, Row, SignedChange } from '../../ui'

const SHAPE = { hit: '●', miss: '■', pending: '▼' } as const

export function RecentPredictions({
  entries,
  instrument,
  benchmark,
  baseRate,
}: {
  entries: LedgerEntry[]
  instrument: Instrument
  benchmark: string
  /** Latest base rate; the ledger stores only the probability. */
  baseRate: number
}) {
  const { t, locale } = useT()
  const recent = [...entries]
    .sort((a, b) => (a.issuedAt < b.issuedAt ? 1 : -1))
    .slice(0, 8)

  return (
    <Card aria-labelledby="recent-heading">
      <Label id="recent-heading">{t('detail.recentTitle')}</Label>
      {recent.length === 0 ? (
        <p className="mt-3 text-sm text-muted">{t('detail.recentEmpty')}</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-3">
          {recent.map((entry) => {
            const outcome =
              entry.outcome === 'hit'
                ? t('detail.outcomeHit')
                : entry.outcome === 'miss'
                  ? t('detail.outcomeMiss')
                  : t('detail.outcomePending')
            return (
              <li key={entry.id} data-outcome={entry.outcome}>
                <Row
                  name={t('detail.recentRow', {
                    probability: formatProbability(entry.probability, locale),
                    baseRate: formatProbability(baseRate, locale),
                  })}
                  meta={t('detail.recentIssued', {
                    date: formatDate(entry.issuedAt, instrument.timeZone, locale),
                  })}
                  right={
                    <span className="flex flex-col items-end gap-0.5 text-sm">
                      <span>
                        <span aria-hidden="true">{SHAPE[entry.outcome]} </span>
                        {outcome}
                      </span>
                      {entry.excessReturn !== null && (
                        <span className="text-xs font-normal">
                          <SignedChange value={entry.excessReturn} />{' '}
                          <span className="text-muted">
                            {t('detail.excessReturn', { benchmark })}
                          </span>
                        </span>
                      )}
                    </span>
                  }
                />
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}
