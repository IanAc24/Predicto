import { Outlet } from '@tanstack/react-router'
import { useT } from '../../i18n/useT'
import { AppBar } from './AppBar'
import { SkipLink } from './SkipLink'
import { StaleBanner } from './StaleBanner'

export function Shell() {
  const { t } = useT()

  return (
    <div className="flex min-h-screen flex-col">
      <SkipLink />
      <AppBar />
      <main id="main" tabIndex={-1} className="w-full flex-1 outline-none">
        <StaleBanner />
        <Outlet />
      </main>
      <footer className="px-5 pb-8 text-center text-xs text-muted">{t('common.disclaimer')}</footer>
    </div>
  )
}
