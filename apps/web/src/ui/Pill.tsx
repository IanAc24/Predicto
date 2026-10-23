import type { ComponentProps } from 'react'
import { cx } from '../lib/cx'

/** A choice among several. `active` marks the selected one (also exposed as aria-pressed). */
export function Pill({
  active = false,
  className,
  type = 'button',
  ...props
}: ComponentProps<'button'> & { active?: boolean }) {
  return (
    <button
      type={type}
      aria-pressed={active}
      className={cx(
        'min-h-11 cursor-pointer rounded-full border px-4 py-3 text-sm',
        active
          ? 'border-accent bg-accent font-semibold text-on-accent'
          : 'border-border bg-surface-2 text-muted',
        className,
      )}
      {...props}
    />
  )
}

export function PillGroup({ className, ...props }: ComponentProps<'div'>) {
  return <div role="group" className={cx('flex flex-wrap gap-2', className)} {...props} />
}
