import { useCallback } from 'react'
import { useSettings } from '../settings/useSettings'
import { translate, type TParams, type TranslationKey } from './index'

/** Typed translation hook: `t('common.retry')`, `t('common.stateObserving', { day: 3, total: 30 })`. */
export function useT() {
  const { language, locale } = useSettings()
  const t = useCallback(
    (key: TranslationKey, params?: TParams) => translate(language, key, params),
    [language],
  )
  return { t, language, locale }
}
