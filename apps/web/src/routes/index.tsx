import { createFileRoute } from '@tanstack/react-router'
import { useT } from '../i18n/useT'
import { ScreenTitle } from '../ui'

export const Route = createFileRoute('/')({ component: WatchlistScreen })

function WatchlistScreen() {
  const { t } = useT()
  return <ScreenTitle>{t('watchlist.title')}</ScreenTitle>
}
