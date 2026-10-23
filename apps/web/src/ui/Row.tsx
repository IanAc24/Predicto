import type { ComponentProps, ReactNode } from 'react'
import { cx } from '../lib/cx'

/** Name and muted meta on the left (optional coloured dot), a value on the right. */
export function Row({
  name,
  meta,
  right,
  dotColor,
  className,
  ...props
}: Omit<ComponentProps<'div'>, 'children'> & {
  name: ReactNode
  meta?: ReactNode
  right?: ReactNode
  /** Any CSS colour, e.g. 'var(--up)'. Decorative only. */
  dotColor?: string
}) {
  return (
    <div className={cx('flex items-center justify-between gap-3', className)} {...props}>
      <div className="min-w-0">
        <p className="flex items-center text-base">
          {dotColor && (
            <span
              aria-hidden="true"
              className="mr-1.5 inline-block size-2 shrink-0 rounded-full"
              style={{ background: dotColor }}
            />
          )}
          <span className="min-w-0 truncate">{name}</span>
        </p>
        {meta && <p className="mt-0.5 text-xs text-muted">{meta}</p>}
      </div>
      {right !== undefined && (
        <div className="shrink-0 whitespace-nowrap text-right text-base font-semibold">{right}</div>
      )}
    </div>
  )
}
