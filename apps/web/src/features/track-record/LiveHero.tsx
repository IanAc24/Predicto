import type { TrackRecord } from '../../api/types'
import { useT } from '../../i18n/useT'
import { formatPercent } from '../../lib/format'
import { HeroCard, Label } from '../../ui'

/** Below this many resolved predictions the interval is too wide to say anything. */
export const MIN_EVIDENCE_N = 30

export function LiveHero({ live }: { live: TrackRecord['live'] }) {
  const { t, locale } = useT()
  const pct = (value: number) => formatPercent(value * 100, locale, 0)
  const [low, high] = live.ci
  const widthPoints = Math.round((high - low) * 100)
  const insufficient = live.n < MIN_EVIDENCE_N

  return (
    <HeroCard aria-labelledby="live-title" data-testid="live-hero">
      <Label id="live-title">{t('trackRecord.liveTitle')}</Label>
      <div className="mt-2 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-muted">{t('trackRecord.hitRate')}</p>
          <p className="font-display text-[34px] font-semibold tabular-nums">{pct(live.hitRate)}</p>
        </div>
        <div>
          <p className="text-xs text-muted">{t('trackRecord.baselineLabel')}</p>
          <p className="font-display text-[34px] font-semibold tabular-nums text-muted">
            {pct(live.baselineHitRate)}
          </p>
        </div>
      </div>
      <p className="mt-1 text-[13px] text-muted">
        {t('trackRecord.hitRateDetail', { low: pct(low), high: pct(high), n: live.n })}
      </p>

      <div
        role="img"
        aria-label={t('trackRecord.intervalLabel', {
          low: pct(low),
          high: pct(high),
          baseline: pct(live.baselineHitRate),
        })}
        className="mt-4"
      >
        <div className="relative h-3 rounded-full bg-surface-2" aria-hidden="true">
          <div
            className="absolute inset-y-0 rounded-full bg-accent-dim"
            style={{ left: `${low * 100}%`, width: `${(high - low) * 100}%` }}
          />
          <div
            className="absolute -inset-y-1 w-0.5 bg-muted"
            style={{ left: `${live.baselineHitRate * 100}%` }}
          />
          <div
            className="absolute -inset-y-0.5 w-1 rounded-full bg-accent"
            style={{ left: `calc(${live.hitRate * 100}% - 2px)` }}
          />
        </div>
        <div className="mt-1 flex justify-between text-[11px] text-muted" aria-hidden="true">
          <span>{pct(0)}</span>
          <span>{pct(0.5)}</span>
          <span>{pct(1)}</span>
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-border bg-surface-2 p-3 text-[13px] leading-snug">
        {insufficient ? (
          <>
            <p className="font-semibold text-warning">⚠ {t('trackRecord.insufficientTitle')}</p>
            <p className="mt-1 text-muted">
              {t('trackRecord.insufficientBody', {
                n: live.n,
                width: widthPoints,
                min: MIN_EVIDENCE_N,
              })}
            </p>
          </>
        ) : (
          <p className="text-muted">{t('trackRecord.enoughBody', { width: widthPoints })}</p>
        )}
      </div>
    </HeroCard>
  )
}
