import type { ComponentProps } from 'react'
import { cx } from '../lib/cx'

/** A styled native select. Give it an `aria-label` or an associated label. */
export function Select({ className, ...props }: ComponentProps<'select'>) {
  return (
    <select
      className={cx(
        'min-h-11 rounded-xl border border-border bg-surface-2 px-3 text-sm text-text',
        className,
      )}
      {...props}
    />
  )
}
