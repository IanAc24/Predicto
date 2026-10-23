import type { Instrument, Prediction } from '../../api/types'
import { useT } from '../../i18n/useT'
import { formatDate, formatProbability } from '../../lib/format'
import { HeroCard, Label, ProgressBar } from '../../ui'

/** The prediction for one stock in one of three states. Probabilities always come with base rate and sample size. */
export function PredictionPanel({
  prediction,
  instrument,
}: {
  prediction: Prediction
  instrument: Instrument
}) {
  const { t, locale } = useT()
  const baseRate = formatProbability(prediction.baseRate, locale)
  const days = prediction.horizonDays
  const label = t('detail.predictionLabel', { days })

  if (prediction.state === 'observing') {
    const { day, total } = prediction.observation
    return (
      <HeroCard aria-labelledby="prediction-heading" data-state="observing">
        <Label id="prediction-heading">{label}</Label>
        <p className="mt-2 font-display text-2xl font-semibold">{t('detail.observingTitle')}</p>
        <p className="mt-1 text-sm text-muted">{t('detail.observingDay', { day, total })}</p>
        <ProgressBar
          className="mt-3"
          value={total > 0 ? day / total : 0}
          label={t('detail.observingProgress')}
        />
        <p className="mt-4 text-sm leading-relaxed">{t('detail.observingBody')}</p>
      </HeroCard>
    )
  }

  if (prediction.state === 'no-signal' || prediction.probability === null) {
    return (
      <HeroCard aria-labelledby="prediction-heading" data-state="no-signal">
        <Label id="prediction-heading">{label}</Label>
        <p className="mt-2 font-display text-2xl font-semibold">{t('detail.noSignalTitle')}</p>
        <p className="mt-3 text-sm leading-relaxed">{t('detail.noSignalBody', { baseRate })}</p>
        <LiveRecord prediction={prediction} />
        <p className="mt-3 text-xs text-muted">
          {t('detail.modelVersion', { version: prediction.modelVersion })}
        </p>
      </HeroCard>
    )
  }

  return (
    <HeroCard aria-labelledby="prediction-heading" data-state="active">
      <Label id="prediction-heading">{label}</Label>
      <div className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <p className="font-display text-5xl font-semibold tabular-nums text-accent">
          {formatProbability(prediction.probability, locale)}
        </p>
        <p className="text-base font-semibold tabular-nums">
          {t('detail.activeBase', { baseRate })}
        </p>
      </div>
      <p className="mt-2 text-sm">
        {t('detail.activeQuestion', { benchmark: prediction.benchmark, days })}
      </p>
      <p className="mt-1 text-xs text-muted">{t('detail.activeBaseNote')}</p>

      <LiveRecord prediction={prediction} />

      <p className="mt-3 text-sm text-muted">
        {t('detail.horizonDefinition', { benchmark: prediction.benchmark, days })}
      </p>
      <p className="mt-1 text-xs text-muted">
        {t('detail.modelVersion', { version: prediction.modelVersion })} ·{' '}
        {t('detail.issued', { date: formatDate(prediction.issuedAt, instrument.timeZone, locale) })}
      </p>

      {prediction.drivers.length > 0 && (
        <div className="mt-4 border-t border-border pt-4">
          <Label>{t('detail.driversTitle')}</Label>
          <ul className="mt-2 flex flex-col gap-2">
            {prediction.drivers.map((driver) => (
              <li
                key={driver.label}
                data-direction={driver.direction}
                className="flex items-start gap-2 text-sm"
              >
                <span
                  aria-hidden="true"
                  className={driver.direction === 'up' ? 'text-up' : 'text-down'}
                >
                  {driver.direction === 'up' ? '▲' : '▼'}
                </span>
                <span className="min-w-0">
                  {driver.label}
                  <span className="block text-xs text-muted">
                    {driver.direction === 'up' ? t('detail.driverUp') : t('detail.driverDown')}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </HeroCard>
  )
}

function LiveRecord({ prediction }: { prediction: Prediction }) {
  const { t, locale } = useT()
  const { n, hits, ci } = prediction.liveRecord
  return (
    <p className="mt-3 text-sm tabular-nums">
      {n === 0
        ? t('detail.liveRecordNone')
        : t('detail.liveRecord', {
            hits,
            n,
            low: formatProbability(ci[0], locale),
            high: formatProbability(ci[1], locale),
          })}
    </p>
  )
}
