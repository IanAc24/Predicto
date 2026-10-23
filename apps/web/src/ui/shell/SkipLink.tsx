import { useT } from '../../i18n/useT'

/** Invisible until it receives keyboard focus; jumps past the app bar to the main content. */
export function SkipLink() {
  const { t } = useT()
  return (
    <a className="skip-link" href="#main">
      {t('common.skipToContent')}
    </a>
  )
}
