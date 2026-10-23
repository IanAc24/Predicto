import type { TrackRecord } from '../../api/types'
import { useT } from '../../i18n/useT'
import { formatPercent } from '../../lib/format'
import { Card, Label } from '../../ui'

/** Backtest numbers. A separate card on purpose: never merged with the live figures. */
export function HypotheticalCard({ hypothetical }: { hypothetical: TrackRecord['hypothetical'] }) {
  const { t, locale } = useT()
  return (
    <Card
      aria-labelledby="hypothetical-title"
      data-testid="hypothetical-card"
      className="border-dashed"
    >
      <Label id="hypothetical-title">{t('trackRecord.hypotheticalTitle')}</Label>
      <p className="mt-1 text-[13px] font-semibold text-warning">
        ⚠ {t('trackRecord.hypotheticalWarning')}
      </p>
      <p className="mt-3 text-xs text-muted">{t('trackRecord.hypotheticalHitRate')}</p>
      <p className="font-display text-2xl font-semibold tabular-nums">
        {formatPercent(hypothetical.hitRate * 100, locale, 0)}
      </p>
      <p className="text-[13px] text-muted">
        {t('trackRecord.hypotheticalN', { n: hypothetical.n })}
      </p>
      <p className="mt-2 text-[13px] leading-snug text-muted">{hypothetical.note}</p>
    </Card>
  )
}
