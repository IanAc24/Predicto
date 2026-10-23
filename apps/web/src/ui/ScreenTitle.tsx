import type { ComponentProps } from 'react'
import { cx } from '../lib/cx'

export function ScreenTitle({ className, ...props }: ComponentProps<'h1'>) {
  return (
    <h1
      className={cx(
        'text-center font-display text-xl font-semibold min-[900px]:text-[28px]',
        className,
      )}
      {...props}
    />
  )
}
