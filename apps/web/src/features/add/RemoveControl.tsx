import { useRemoveFromWatchlist } from '../../api/hooks'
import type { Instrument } from '../../api/types'
import { useT } from '../../i18n/useT'
import { ConfirmButton } from '../../ui'

/** Remove button with an inline, accessible confirmation. */
export function RemoveControl({ instrument }: { instrument: Instrument }) {
  const { t } = useT()
  const remove = useRemoveFromWatchlist()
  const params = { name: instrument.name, symbol: instrument.symbol, exchange: instrument.exchange }

  return (
    <ConfirmButton
      label={t('add.remove')}
      ariaLabel={t('add.removeLabel', params)}
      question={t('add.confirmRemove', params)}
      confirmLabel={t('add.confirmRemoveYes')}
      pendingLabel={t('add.removing')}
      cancelLabel={t('add.cancel')}
      retryLabel={t('common.retry')}
      errorText={t('add.removeError', params)}
      pending={remove.isPending}
      failed={remove.isError}
      onConfirm={() => remove.mutate(instrument.id)}
      onCancel={() => remove.reset()}
      restoreFocusTo="#add-search"
    />
  )
}
