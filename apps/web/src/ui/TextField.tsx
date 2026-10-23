import { useId, type ComponentProps } from 'react'
import { cx } from '../lib/cx'

/** A labelled text or search input. Pass `ref` through as usual (React 19). */
export function TextField({
  label,
  id,
  className,
  ...props
}: ComponentProps<'input'> & { label: string }) {
  const fallbackId = useId()
  const inputId = id ?? fallbackId
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-xs uppercase tracking-wider text-muted">
        {label}
      </label>
      <input
        id={inputId}
        className={cx(
          'min-h-11 appearance-none rounded-xl border border-border bg-surface-2 px-3.5 py-3 text-base text-text',
          className,
        )}
        {...props}
      />
    </div>
  )
}
