import type { LedgerEntry } from '../../api/types'
import { useT } from '../../i18n/useT'
import type { TranslationKey } from '../../i18n'
import { mondayOf } from '../../lib/dates'
import { formatDate, formatProbability } from '../../lib/format'
import { OutcomeBadge, Pill, PillGroup, Row, SectionCard, Select } from '../../ui'
import { OUTCOME_FILTERS, type OutcomeFilter } from './search'

const FILTER_KEYS: Record<OutcomeFilter, TranslationKey> = {
  all: 'trackRecord.filterAll',
  hit: 'trackRecord.filterHits',
  miss: 'trackRecord.filterMisses',
  pending: 'trackRecord.filterPending',
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
    <SectionCard title={t('trackRecord.ledgerTitle')}>
      <div className="mt-3 flex flex-col gap-3">
        <PillGroup aria-label={t('trackRecord.filterOutcomeLabel')}>
          {OUTCOME_FILTERS.map((value) => (
            <Pill key={value} active={filter === value} onClick={() => onFilterChange(value)}>
              {t(FILTER_KEYS[value])}
            </Pill>
          ))}
        </PillGroup>
        <Select
          aria-label={t('trackRecord.filterInstrumentLabel')}
          value={instrument ?? ''}
          onChange={(event) => onInstrumentChange(event.target.value || undefined)}
        >
          <option value="">{t('trackRecord.filterAllInstruments')}</option>
          {instrumentIds.map((id) => (
            <option key={id} value={id}>
              {nameOf(id)}
            </option>
          ))}
        </Select>
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
              {items.map((entry) => (
                  <li key={entry.id} className="py-2.5">
                    <Row
                      name={nameOf(entry.instrumentId)}
                      meta={`${t('trackRecord.issued', {
                        date: formatDate(entry.issuedAt, 'UTC', locale),
                      })} · ${t('trackRecord.probabilityMeta', {
                        probability: formatProbability(entry.probability, locale),
                      })}`}
                      right={
                        <OutcomeBadge
                          outcome={entry.outcome}
                          excessReturn={entry.excessReturn}
                          excessLabel={t('trackRecord.excessReturn')}
                        />
                      }
                    />
                  </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </SectionCard>
  )
}
