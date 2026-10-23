import type { ComponentProps } from 'react'
import { cx } from '../lib/cx'

/** Calm surface; depth comes from the background colour, not shadows. */
export function Card({ className, ...props }: ComponentProps<'section'>) {
  return (
    <section
      className={cx('rounded-2xl border border-border bg-surface p-5', className)}
      {...props}
    />
  )
}

/** The one card per screen with a gradient, teal border and soft glow. */
export function HeroCard({ className, ...props }: ComponentProps<'section'>) {
  return <Card className={cx('card-hero', className)} {...props} />
}
