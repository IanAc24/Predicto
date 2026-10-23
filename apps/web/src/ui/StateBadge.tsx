import { useT } from '../i18n/useT'
import { formatProbability } from '../lib/format'
import { cx } from '../lib/cx'

export type StateBadgeProps =
  | { state: 'observing'; day: number; total: number }
  | { state: 'active'; probability: number; baseRate: number }
  | { state: 'no-signal' }

/** Prediction state as text: "Observing · day 12 of 30", "58% vs 52% base" or "No signal". */
export function StateBadge(props: StateBadgeProps) {
  const { t, locale } = useT()

  const text =
    props.state === 'observing'
      ? t('common.stateObserving', { day: props.day, total: props.total })
      : props.state === 'active'
        ? t('common.stateActive', {
            probability: formatProbability(props.probability, locale),
            baseRate: formatProbability(props.baseRate, locale),
          })
        : t('common.stateNoSignal')

  return (
    <span
      data-state={props.state}
      className={cx(
        'inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold',
        props.state === 'active' && 'border-accent-dim bg-surface-2 text-accent',
        props.state === 'observing' && 'border-border bg-surface-2 text-muted',
        props.state === 'no-signal' && 'border-dashed border-border text-muted',
      )}
    >
      {text}
    </span>
  )
}
