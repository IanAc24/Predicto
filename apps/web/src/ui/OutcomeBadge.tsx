import type { LedgerOutcome } from '../api/types'
import type { TranslationKey } from '../i18n'
import { useT } from '../i18n/useT'
import { cx } from '../lib/cx'
import { SignedChange } from './SignedChange'

const VIEW: Record<LedgerOutcome, { key: TranslationKey; icon: string; className: string }> = {
  hit: { key: 'common.outcomeHit', icon: '✓', className: 'text-up' },
  miss: { key: 'common.outcomeMiss', icon: '✗', className: 'text-down' },
  pending: { key: 'common.outcomePending', icon: '…', className: 'text-muted' },
}

/**
 * A ledger outcome: glyph plus word (never colour alone), and the excess return when known.
 * `excessLabel` is read by screen readers, or shown after the figure when `showExcessLabel` is set.
 */
export function OutcomeBadge({
  outcome,
  excessReturn,
  excessLabel,
  showExcessLabel = false,
  className,
}: {
  outcome: LedgerOutcome
  excessReturn: number | null
  excessLabel: string
  showExcessLabel?: boolean
  className?: string
}) {
  const { t } = useT()
  const view = VIEW[outcome]
  return (
    <span className={cx('flex flex-col items-end gap-0.5 text-sm', className)}>
      <span className={cx('inline-flex items-center gap-1', view.className)}>
        <span aria-hidden="true">{view.icon}</span>
        {t(view.key)}
      </span>
      {excessReturn !== null && (
        <span className="text-xs font-normal">
          {!showExcessLabel && <span className="sr-only">{excessLabel} </span>}
          <SignedChange value={excessReturn} />
          {showExcessLabel && <span className="ml-1 text-muted">{excessLabel}</span>}
        </span>
      )}
    </span>
  )
}
