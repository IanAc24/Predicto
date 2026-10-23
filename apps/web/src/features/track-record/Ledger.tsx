import type { LedgerEntry, LedgerOutcome } from '../../api/types'
import { useT } from '../../i18n/useT'
import type { TranslationKey } from '../../i18n'
import { cx } from '../../lib/cx'
import { formatDate, formatProbability } from '../../lib/format'
import { Card, Label, Pill, PillGroup, Row, SignedChange } from '../../ui'
import { OUTCOME_FILTERS, type OutcomeFilter } from './search'

const FILTER_KEYS: Record<OutcomeFilter, TranslationKey> = {
  all: 'trackRecord.filterAll',
  hit: 'trackRecord.filterHits',
  miss: 'trackRecord.filterMisses',
  pending: 'trackRecord.filterPending',
}

const OUTCOME_VIEW: Record<LedgerOutcome, { key: TranslationKey; icon: string; className: string }> = {
  hit: { key: 'trackRecord.outcomeHit', icon: '✓', className: 'text-up' },
  miss: { key: 'trackRecord.outcomeMiss', icon: '✗', className: 'text-down' },
  pending: { key: 'trackRecord.outcomePending', icon: '…', className: 'text-muted' },
}

/** Monday of the week containing a 'YYYY-MM-DD' date, as 'YYYY-MM-DD'. */
function mondayOf(date: string): string {
  const d = new Date(`${date}T00:00:00Z`)
  const offset = (d.getUTCDay() + 6) % 7
  d.setUTCDate(d.getUTCDate() - offset)
  return d.toISOString().slice(0, 10)
}

export function Ledger({
  entries,
  names,
  filter,
  instrument,
  onFilterChange,
  onInstrumentChange,
}: {
  /** The full ledger (unfiltered), newest first. */
  entries: LedgerEntry[]
  /** Display name per instrument id; ids missing here fall back to the symbol. */
  names: Record<string, string>
  filter: OutcomeFilter
  instrument: string | undefined
  onFilterChange: (filter: OutcomeFilter) => void
  onInstrumentChange: (instrument: string | undefined) => void
}) {
  const { t, locale } = useT()
  const nameOf = (id: string) => names[id] ?? id.split(':').pop() ?? id
  const instrumentIds = [...new Set(entries.map((entry) => entry.instrumentId))]

  const visible = entries.filter(
    (entry) =>
      (filter === 'all' || entry.outcome === filter) &&
      (instrument === undefined || entry.instrumentId === instrument),
  )

  const groups = new Map<string, LedgerEntry[]>()
  for (const entry of visible) {
    const week = mondayOf(entry.issuedAt.slice(0, 10))
    groups.set(week, [...(groups.get(week) ?? []), entry])
  }

  return (
    <Card aria-labelledby="ledger-title">
      <Label id="ledger-title">{t('trackRecord.ledgerTitle')}</Label>
      <div className="mt-3 flex flex-col gap-3">
        <PillGroup aria-label={t('trackRecord.filterOutcomeLabel')}>
          {OUTCOME_FILTERS.map((value) => (
            <Pill key={value} active={filter === value} onClick={() => onFilterChange(value)}>
              {t(FILTER_KEYS[value])}
            </Pill>
          ))}
        </PillGroup>
        <select
          aria-label={t('trackRecord.filterInstrumentLabel')}
          value={instrument ?? ''}
          onChange={(event) => onInstrumentChange(event.target.value || undefined)}
          className="min-h-11 rounded-xl border border-border bg-surface-2 px-3 text-sm text-text"
        >
          <option value="">{t('trackRecord.filterAllInstruments')}</option>
          {instrumentIds.map((id) => (
            <option key={id} value={id}>
              {nameOf(id)}
            </option>
          ))}
        </select>
      </div>

      {visible.length === 0 ? (
        <p className="mt-4 text-[13px] text-muted">{t('trackRecord.ledgerNoMatches')}</p>
      ) : (
        [...groups.entries()].map(([week, items]) => (
          <section key={week} className="mt-4" aria-label={t('trackRecord.weekOf', { date: formatDate(week, 'UTC', locale) })}>
            <h3 className="text-xs uppercase tracking-wider text-muted">
              {t('trackRecord.weekOf', { date: formatDate(week, 'UTC', locale) })}
            </h3>
            <ul className="mt-2 flex flex-col divide-y divide-border">
              {items.map((entry) => {
                const view = OUTCOME_VIEW[entry.outcome]
                return (
                  <li key={entry.id} className="py-2.5">
                    <Row
                      name={nameOf(entry.instrumentId)}
                      meta={`${t('trackRecord.issued', {
                        date: formatDate(entry.issuedAt, 'UTC', locale),
                      })} · ${t('trackRecord.probabilityMeta', {
                        probability: formatProbability(entry.probability, locale),
                      })}`}
                      right={
                        <div className="flex flex-col items-end gap-0.5">
                          <span className={cx('inline-flex items-center gap-1', view.className)}>
                            <span aria-hidden="true">{view.icon}</span>
                            {t(view.key)}
                          </span>
                          {entry.excessReturn !== null && (
                            <span className="text-xs">
                              <span className="sr-only">{t('trackRecord.excessReturn')} </span>
                              <SignedChange value={entry.excessReturn} />
                            </span>
                          )}
                        </div>
                      }
                    />
                  </li>
                )
              })}
            </ul>
          </section>
        ))
      )}
    </Card>
  )
}
