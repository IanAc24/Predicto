import { useT } from '../i18n/useT'
import { cx } from '../lib/cx'
import { Button } from './Button'
import { Card } from './Card'
import { Logo } from './shell/Logo'

/** Loading or error card for a whole screen or section. Errors offer a retry. */
export function StatusScreen({
  status,
  text,
  onRetry,
}: {
  status: 'loading' | 'error'
  /** Overrides the default message. */
  text?: string
  onRetry?: () => void
}) {
  const { t } = useT()
  const loading = status === 'loading'

  return (
    <Card className="flex flex-col items-center gap-4 text-center">
      <Logo className={cx('size-[72px]!', loading && 'loading-logo')} />
      <p role={loading ? 'status' : 'alert'} className="text-[13px] leading-snug text-muted">
        {text ?? (loading ? t('common.loading') : t('common.loadError'))}
      </p>
      {!loading && onRetry && <Button onClick={onRetry}>{t('common.retry')}</Button>}
    </Card>
  )
}
