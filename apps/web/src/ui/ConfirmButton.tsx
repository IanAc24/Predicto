import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { cx } from '../lib/cx'
import { Button } from './Button'

/**
 * A button that asks for confirmation inline (no window.confirm). Focus moves to Cancel when the
 * question opens and back to the opener when it closes.
 */
export function ConfirmButton({
  label,
  ariaLabel,
  question,
  confirmLabel,
  pendingLabel,
  cancelLabel,
  retryLabel,
  errorText,
  pending,
  failed,
  onConfirm,
  onCancel,
  restoreFocusTo = '#main',
}: {
  /** Text of the opening button. */
  label: ReactNode
  ariaLabel?: string
  question: string
  confirmLabel: ReactNode
  pendingLabel: ReactNode
  cancelLabel: ReactNode
  /** Shown on the confirm button after a failure. */
  retryLabel: ReactNode
  errorText: string
  pending: boolean
  failed: boolean
  onConfirm: () => void
  /** Called when the question is dismissed, so the caller can reset a failed mutation. */
  onCancel?: () => void
  /** CSS selector to focus if this control disappears while it holds focus (e.g. after a removal). */
  restoreFocusTo?: string
}) {
  const [confirming, setConfirming] = useState(false)
  const cancelRef = useRef<HTMLButtonElement>(null)
  const openerRef = useRef<HTMLButtonElement>(null)
  const groupRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (confirming) cancelRef.current?.focus()
  }, [confirming])

  // If the confirmed action removes this control, keyboard focus would fall back to the page top.
  useLayoutEffect(() => {
    const group = groupRef.current
    return () => {
      if (group?.contains(document.activeElement)) {
        requestAnimationFrame(() => {
          document.querySelector<HTMLElement>(restoreFocusTo)?.focus()
        })
      }
    }
  }, [confirming, restoreFocusTo])

  function cancel() {
    setConfirming(false)
    onCancel?.()
    requestAnimationFrame(() => openerRef.current?.focus())
  }

  if (!confirming) {
    return (
      <Button
        ref={openerRef}
        variant="secondary"
        className="px-4 py-2 text-sm"
        aria-label={ariaLabel}
        onClick={() => setConfirming(true)}
      >
        {label}
      </Button>
    )
  }

  return (
    <div
      ref={groupRef}
      role="group"
      aria-label={question}
      className="flex w-full flex-col gap-3"
      onKeyDown={(event) => {
        if (event.key === 'Escape' && !pending) cancel()
      }}
    >
      <p className="text-sm">{question}</p>
      <div className="flex flex-wrap gap-2">
        {/* aria-disabled, not disabled: a disabled button drops keyboard focus. */}
        <Button
          className={cx('px-4 py-2 text-sm', pending && 'cursor-not-allowed opacity-50')}
          aria-disabled={pending}
          onClick={() => {
            if (!pending) onConfirm()
          }}
        >
          {pending ? pendingLabel : failed ? retryLabel : confirmLabel}
        </Button>
        <Button
          ref={cancelRef}
          variant="secondary"
          className={cx('px-4 py-2 text-sm', pending && 'cursor-not-allowed opacity-50')}
          aria-disabled={pending}
          onClick={() => {
            if (!pending) cancel()
          }}
        >
          {cancelLabel}
        </Button>
      </div>
      {failed && (
        <p role="alert" className="text-sm text-danger">
          {errorText}
        </p>
      )}
    </div>
  )
}
