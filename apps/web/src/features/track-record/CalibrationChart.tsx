import type { TrackRecord } from '../../api/types'
import { useT } from '../../i18n/useT'
import { formatPercent } from '../../lib/format'
import { Card, Label } from '../../ui'

const SIZE = 240
const PAD = 28

/** Predicted (x) against observed (y) per bucket, with the perfect-calibration diagonal. */
export function CalibrationChart({ calibration }: { calibration: TrackRecord['calibration'] }) {
  const { t, locale } = useT()
  const pct = (value: number) => formatPercent(value * 100, locale, 0)
  const inner = SIZE - PAD * 2
  const x = (value: number) => PAD + value * inner
  const y = (value: number) => SIZE - PAD - value * inner
  const maxN = Math.max(1, ...calibration.map((point) => point.n))
  const ticks = [0, 0.25, 0.5, 0.75, 1]

  return (
    <Card aria-labelledby="calibration-title">
      <Label id="calibration-title">{t('trackRecord.calibrationTitle')}</Label>
      <p className="mt-2 text-[13px] leading-snug text-muted">{t('trackRecord.calibrationIntro')}</p>
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        role="img"
        aria-label={t('trackRecord.calibrationChartLabel')}
        className="mx-auto mt-3 w-full max-w-[320px]"
      >
        {ticks.map((tick) => (
          <g key={tick} stroke="var(--border)" strokeWidth="1">
            <line x1={x(tick)} x2={x(tick)} y1={y(0)} y2={y(1)} />
            <line x1={x(0)} x2={x(1)} y1={y(tick)} y2={y(tick)} />
          </g>
        ))}
        <line
          x1={x(0)}
          y1={y(0)}
          x2={x(1)}
          y2={y(1)}
          stroke="var(--muted)"
          strokeDasharray="4 4"
          strokeWidth="1.5"
        />
        {ticks.map((tick) => (
          <g key={`l${tick}`} fill="var(--muted)" fontSize="9">
            <text x={x(tick)} y={SIZE - PAD + 12} textAnchor="middle">
              {pct(tick)}
            </text>
            <text x={PAD - 4} y={y(tick) + 3} textAnchor="end">
              {pct(tick)}
            </text>
          </g>
        ))}
        {calibration.map((point) => (
          <circle
            key={point.bucket}
            cx={x(point.predicted)}
            cy={y(point.observed)}
            r={4 + (point.n / maxN) * 6}
            fill="var(--accent)"
            fillOpacity="0.85"
            stroke="var(--bg)"
            strokeWidth="1.5"
          />
        ))}
      </svg>
      <table className="mt-3 w-full text-left text-[13px] tabular-nums">
        <thead className="text-xs uppercase tracking-wider text-muted">
          <tr>
            <th scope="col" className="py-1 font-normal">{t('trackRecord.calibrationBucket')}</th>
            <th scope="col" className="py-1 font-normal">{t('trackRecord.calibrationPredicted')}</th>
            <th scope="col" className="py-1 font-normal">{t('trackRecord.calibrationObserved')}</th>
            <th scope="col" className="py-1 text-right font-normal">{t('trackRecord.calibrationN')}</th>
          </tr>
        </thead>
        <tbody>
          {calibration.map((point) => (
            <tr key={point.bucket} className="border-t border-border">
              <th scope="row" className="py-1.5 font-normal">{point.bucket}</th>
              <td>{pct(point.predicted)}</td>
              <td>{pct(point.observed)}</td>
              <td className="text-right">{point.n}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}
