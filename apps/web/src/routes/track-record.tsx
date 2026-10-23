import { createFileRoute } from '@tanstack/react-router'
import { useT } from '../i18n/useT'
import { ScreenTitle } from '../ui'

export const Route = createFileRoute('/track-record')({ component: TrackRecordScreen })

function TrackRecordScreen() {
  const { t } = useT()
  return <ScreenTitle>{t('trackRecord.title')}</ScreenTitle>
}
