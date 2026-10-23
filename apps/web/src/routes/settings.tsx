import { createFileRoute } from '@tanstack/react-router'
import { useT } from '../i18n/useT'
import { ScreenTitle } from '../ui'

export const Route = createFileRoute('/settings')({ component: SettingsScreen })

function SettingsScreen() {
  const { t } = useT()
  return <ScreenTitle>{t('settings.title')}</ScreenTitle>
}
