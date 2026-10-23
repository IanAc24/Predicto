import { useT } from '../../i18n/useT'
import { SectionCard } from '../../ui'

export function MethodologyCard() {
  const { t } = useT()
  return (
    <SectionCard headingStyle="title" title={t('settings.methodologyTitle')}>
      <div className="mt-3 flex flex-col gap-3 text-[13px] leading-snug text-muted">
        <p>{t('settings.methodologyDisclaimer')}</p>
        <p>{t('settings.methodologyStates')}</p>
        <p>{t('settings.methodologyBacktest')}</p>
      </div>
    </SectionCard>
  )
}
