import { createFileRoute } from '@tanstack/react-router'
import { useT } from '../i18n/useT'
import { ScreenTitle } from '../ui'

export const Route = createFileRoute('/stocks/$instrumentId')({ component: DetailScreen })

function DetailScreen() {
  const { t } = useT()
  return <ScreenTitle>{t('detail.title')}</ScreenTitle>
}
