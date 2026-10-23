import { useUserSettings } from '../../api/hooks'
import { useT } from '../../i18n/useT'
import { Column, Columns, ScreenTitle, StatusScreen } from '../../ui'
import { AppearanceCard } from './AppearanceCard'
import { DataStatusCard } from './DataStatusCard'
import { MethodologyCard } from './MethodologyCard'
import { PredictionSettings } from './PredictionSettings'

export function SettingsScreen() {
  const { t } = useT()
  const userSettings = useUserSettings()

  return (
    <>
      <ScreenTitle>{t('settings.title')}</ScreenTitle>
      <Columns>
        <Column>
          <AppearanceCard />
          {userSettings.isError ? (
            <StatusScreen status="error" onRetry={() => void userSettings.refetch()} />
          ) : userSettings.data ? (
            <PredictionSettings initial={userSettings.data} />
          ) : (
            <StatusScreen status="loading" />
          )}
        </Column>
        <Column>
          <DataStatusCard />
          <MethodologyCard />
        </Column>
      </Columns>
    </>
  )
}
