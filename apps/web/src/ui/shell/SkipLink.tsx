import { useT } from '../../i18n/useT'

/** Invisible until it receives keyboard focus; jumps past the app bar to the main content. */
export function SkipLink() {
  const { t } = useT()
  return (
    <a
      className="skip-link"
      href="#main"
      onClick={(event) => {
        // Move focus ourselves: the router does not reliably do it for in-page anchors.
        event.preventDefault()
        const main = document.getElementById('main')
        main?.focus()
        main?.scrollIntoView()
      }}
    >
      {t('common.skipToContent')}
    </a>
  )
}
