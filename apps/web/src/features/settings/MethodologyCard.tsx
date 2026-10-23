import { useT } from '../../i18n/useT'
import { Card } from '../../ui'

export function MethodologyCard() {
  const { t } = useT()
  return (
    <Card aria-labelledby="methodology-title">
      <h2 id="methodology-title" className="font-display text-base font-semibold">
        {t('settings.methodologyTitle')}
      </h2>
      <div className="mt-3 flex flex-col gap-3 text-[13px] leading-snug text-muted">
        <p>{t('settings.methodologyDisclaimer')}</p>
        <p>{t('settings.methodologyStates')}</p>
        <p>{t('settings.methodologyBacktest')}</p>
      </div>
    </Card>
  )
}
