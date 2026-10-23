import type { Language } from '../../i18n'
import { useT } from '../../i18n/useT'
import { useSettings } from '../../settings/useSettings'
import { Card, Label, Pill, PillGroup } from '../../ui'

const LANGUAGES: { value: Language; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
]

export function AppearanceCard() {
  const { t } = useT()
  const { language, setLanguage, theme, setTheme } = useSettings()

  return (
    <Card aria-labelledby="appearance-title">
      <h2 id="appearance-title" className="font-display text-base font-semibold">
        {t('settings.appearanceTitle')}
      </h2>
      <div className="mt-4 flex flex-col gap-5">
        <div>
          <Label id="language-label">{t('settings.language')}</Label>
          <PillGroup aria-labelledby="language-label" className="mt-2">
            {LANGUAGES.map(({ value, label }) => (
              <Pill
                key={value}
                lang={value}
                active={language === value}
                onClick={() => setLanguage(value)}
              >
                {label}
              </Pill>
            ))}
          </PillGroup>
        </div>
        <div>
          <Label id="theme-label">{t('settings.theme')}</Label>
          <PillGroup aria-labelledby="theme-label" className="mt-2">
            <Pill active={theme === 'dark'} onClick={() => setTheme('dark')}>
              {t('settings.themeDark')}
            </Pill>
            <Pill active={theme === 'light'} onClick={() => setTheme('light')}>
              {t('settings.themeLight')}
            </Pill>
          </PillGroup>
        </div>
      </div>
    </Card>
  )
}
