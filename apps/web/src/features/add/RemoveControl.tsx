import { useEffect, useRef, useState } from 'react'
import { useRemoveFromWatchlist } from '../../api/hooks'
import type { Instrument } from '../../api/types'
import { useT } from '../../i18n/useT'
import { Button } from '../../ui'

/** Remove button with an inline, accessible confirmation (no window.confirm). */
export function RemoveControl({ instrument }: { instrument: Instrument }) {
  const { t } = useT()
  const remove = useRemoveFromWatchlist()
  const [confirming, setConfirming] = useState(false)
  const cancelRef = useRef<HTMLButtonElement>(null)
  const openerRef = useRef<HTMLButtonElement>(null)
  const params = { name: instrument.name, symbol: instrument.symbol, exchange: instrument.exchange }

  useEffect(() => {
    if (confirming) cancelRef.current?.focus()
  }, [confirming])

  function cancel() {
    setConfirming(false)
    remove.reset()
    requestAnimationFrame(() => openerRef.current?.focus())
  }

  if (!confirming) {
    return (
      <Button
        ref={openerRef}
        variant="secondary"
        className="px-4 py-2 text-sm"
        aria-label={t('add.removeLabel', params)}
        onClick={() => setConfirming(true)}
      >
        {t('add.remove')}
      </Button>
    )
  }

  return (
    <div
      role="group"
      aria-label={t('add.confirmRemove', params)}
      className="flex w-full flex-col gap-3"
    >
      <p className="text-sm">{t('add.confirmRemove', params)}</p>
      <div className="flex flex-wrap gap-2">
        <Button
          className="px-4 py-2 text-sm"
          disabled={remove.isPending}
          onClick={() => remove.mutate(instrument.id)}
        >
          {remove.isPending
            ? t('add.removing')
            : remove.isError
              ? t('common.retry')
              : t('add.confirmRemoveYes')}
        </Button>
        <Button
          ref={cancelRef}
          variant="secondary"
          className="px-4 py-2 text-sm"
          disabled={remove.isPending}
          onClick={cancel}
        >
          {t('add.cancel')}
        </Button>
      </div>
      {remove.isError && (
        <p role="alert" className="text-sm text-danger">
          {t('add.removeError', params)}
        </p>
      )}
    </div>
  )
}
