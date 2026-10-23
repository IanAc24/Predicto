import { useState } from 'react'
import { useUpdateUserSettings } from '../../api/hooks'
import type { Currency, UserSettings } from '../../api/types'
import { useT } from '../../i18n/useT'
import { Button, SectionCard, Label, Pill, PillGroup } from '../../ui'

const WEEK_OPTIONS = [4, 6, 8]
const BENCHMARKS = ['SPY']
const CURRENCIES: Currency[] = ['USD', 'EUR']

/** Draft form: edits stay local until Save. Remount (key) to reset from fresh server data. */
export function PredictionSettings({ initial }: { initial: UserSettings }) {
  const { t } = useT()
  const [draft, setDraft] = useState<UserSettings>(initial)
  const mutation = useUpdateUserSettings()

  const edit = (patch: Partial<UserSettings>) => {
    setDraft((current) => ({ ...current, ...patch }))
    mutation.reset()
  }

  return (
    <SectionCard headingStyle="title" title={t('settings.predictionTitle')}>
      <div className="mt-4 flex flex-col gap-5">
        <div>
          <Label id="obs-label">{t('settings.observationWeeks')}</Label>
          <PillGroup aria-labelledby="obs-label" className="mt-2">
            {WEEK_OPTIONS.map((weeks) => (
              <Pill
                key={weeks}
                active={draft.observationWeeks === weeks}
                onClick={() => edit({ observationWeeks: weeks })}
              >
                {t('settings.observationWeeksValue', { weeks })}
              </Pill>
            ))}
          </PillGroup>
          <p className="mt-1.5 text-xs text-muted">{t('settings.observationHint')}</p>
        </div>

        <div>
          <Label id="benchmark-label">{t('settings.benchmark')}</Label>
          <PillGroup aria-labelledby="benchmark-label" className="mt-2">
            {BENCHMARKS.map((benchmark) => (
              <Pill
                key={benchmark}
                active={draft.benchmark === benchmark}
                onClick={() => edit({ benchmark })}
              >
                {benchmark}
              </Pill>
            ))}
          </PillGroup>
          <p className="mt-1.5 text-xs text-muted">{t('settings.benchmarkNote')}</p>
        </div>

        <div>
          <Label id="currency-label">{t('settings.displayCurrency')}</Label>
          <PillGroup aria-labelledby="currency-label" className="mt-2">
            {CURRENCIES.map((currency) => (
              <Pill
                key={currency}
                active={draft.displayCurrency === currency}
                onClick={() => edit({ displayCurrency: currency })}
              >
                {currency}
              </Pill>
            ))}
          </PillGroup>
        </div>

        <div>
          <Label>{t('settings.horizon')}</Label>
          <p className="mt-1 text-base">{t('settings.horizonValue')}</p>
        </div>

        <div className="flex items-center gap-3">
          <Button disabled={mutation.isPending} onClick={() => mutation.mutate(draft)}>
            {mutation.isPending ? t('settings.saving') : t('settings.save')}
          </Button>
          <p role="status" className="text-[13px] text-muted">
            {mutation.isSuccess && `✓ ${t('settings.saved')}`}
            {mutation.isError && t('settings.saveError')}
          </p>
        </div>
      </div>
    </SectionCard>
  )
}
