import { cx } from '../lib/cx'

export type ButtonVariant = 'primary' | 'secondary'

/** Class names for a button look, so links (<Link>) can be styled as buttons too. */
export function buttonClass(variant: ButtonVariant = 'primary', className?: string): string {
  return cx(
    'inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border px-4 py-3.5 text-center text-base font-semibold no-underline disabled:cursor-not-allowed disabled:opacity-50',
    variant === 'primary'
      ? 'border-transparent bg-accent text-on-accent'
      : 'border-border bg-surface-2 text-text',
    className,
  )
}
