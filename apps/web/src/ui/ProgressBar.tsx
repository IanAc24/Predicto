import { cx } from '../lib/cx'

/** Thin bar. `value` is a fraction 0..1; `label` is the accessible name. */
export function ProgressBar({
  value,
  label,
  className,
}: {
  value: number
  label: string
  className?: string
}) {
  const fraction = Math.min(Math.max(value, 0), 1)
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(fraction * 100)}
      className={cx('h-2 overflow-hidden rounded-full bg-surface-2', className)}
    >
      <div className="h-full rounded-full bg-accent" style={{ width: `${fraction * 100}%` }} />
    </div>
  )
}
