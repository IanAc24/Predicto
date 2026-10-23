import type { ComponentProps } from 'react'
import { cx } from '../lib/cx'

/** Small uppercase muted caption above a figure. */
export function Label({ className, ...props }: ComponentProps<'p'>) {
  return <p className={cx('text-xs uppercase tracking-wider text-muted', className)} {...props} />
}
