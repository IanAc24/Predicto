import { Link } from '@tanstack/react-router'
import { useT } from '../../i18n/useT'

export function TopNav() {
  const { t } = useT()
  const active = { className: 'active' }

  return (
    <nav className="top-nav" aria-label={t('common.mainNavLabel')}>
      <Link to="/" activeOptions={{ exact: true, includeSearch: false }} activeProps={active}>
        {t('common.navWatchlist')}
      </Link>
      <Link to="/add" activeOptions={{ includeSearch: false }} activeProps={active}>
        {t('common.navAdd')}
      </Link>
      <Link to="/track-record" activeOptions={{ includeSearch: false }} activeProps={active}>
        {t('common.navTrackRecord')}
      </Link>
    </nav>
  )
}
