import { createFileRoute } from '@tanstack/react-router'
import { useT } from '../i18n/useT'
import { ScreenTitle } from '../ui'

export const Route = createFileRoute('/add')({ component: AddScreen })

function AddScreen() {
  const { t } = useT()
  return <ScreenTitle>{t('add.title')}</ScreenTitle>
}
