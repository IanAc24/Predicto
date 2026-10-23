import { useT } from '../i18n/useT'
import { cx } from '../lib/cx'
import { formatSignedPercent } from '../lib/format'

/** A percent change like "▲ +1.2%". Sign and arrow carry the direction; colour only reinforces it. */
export function SignedChange({ value, className }: { value: number; className?: string }) {
  const { t, locale } = useT()
  const text = formatSignedPercent(value, locale)
  // Compare the rounded text, so "+0.0%" never shows as up.
  const direction = value > 0 && !text.startsWith('0') ? 'up' : value < 0 && !text.startsWith('0') ? 'down' : 'flat'

  return (
    <span
      data-direction={direction}
      className={cx(
        'inline-flex items-center gap-1 whitespace-nowrap font-semibold',
        direction === 'up' && 'text-up',
        direction === 'down' && 'text-down',
        direction === 'flat' && 'text-muted',
        className,
      )}
    >
      {direction !== 'flat' && (
        <span aria-hidden="true" className="text-[0.7em]">
          {direction === 'up' ? '▲' : '▼'}
        </span>
      )}
      {direction !== 'flat' && <span className="sr-only">{t(`common.${direction}`)}</span>}
      {text}
    </span>
  )
}
