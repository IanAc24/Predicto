import type { Instrument, LedgerEntry } from '../../api/types'
import { useT } from '../../i18n/useT'
import { formatDate, formatProbability } from '../../lib/format'
import { OutcomeBadge, Row, SectionCard } from '../../ui'

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
    <SectionCard title={t('detail.recentTitle')}>
      {recent.length === 0 ? (
        <p className="mt-3 text-sm text-muted">{t('detail.recentEmpty')}</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-3">
          {recent.map((entry) => (
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
                    <OutcomeBadge
                      outcome={entry.outcome}
                      excessReturn={entry.excessReturn}
                      excessLabel={t('detail.excessReturn', { benchmark })}
                      showExcessLabel
                    />
                  }
                />
              </li>
          ))}
        </ul>
      )}
    </SectionCard>
  )
}
