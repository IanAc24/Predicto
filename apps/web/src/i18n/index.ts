import { add as addEn } from './en/add'
import { common as commonEn } from './en/common'
import { detail as detailEn } from './en/detail'
import { settings as settingsEn } from './en/settings'
import { trackRecord as trackRecordEn } from './en/trackRecord'
import { watchlist as watchlistEn } from './en/watchlist'
import { add as addEs } from './es/add'
import { common as commonEs } from './es/common'
import { detail as detailEs } from './es/detail'
import { settings as settingsEs } from './es/settings'
import { trackRecord as trackRecordEs } from './es/trackRecord'
import { watchlist as watchlistEs } from './es/watchlist'

export type Language = 'en' | 'es'

export const en = {
  common: commonEn,
  watchlist: watchlistEn,
  add: addEn,
  detail: detailEn,
  trackRecord: trackRecordEn,
  settings: settingsEn,
}

// Same shape as `en` with every value widened to string. Spanish must match it.
type Widen<T> = { [N in keyof T]: Record<keyof T[N], string> }
export type Dictionary = Widen<typeof en>

export const es: Dictionary = {
  common: commonEs,
  watchlist: watchlistEs,
  add: addEs,
  detail: detailEs,
  trackRecord: trackRecordEs,
  settings: settingsEs,
}

export const dictionaries: Record<Language, Dictionary> = { en, es }

/** Every translation key as 'namespace.key', checked against the English dictionary. */
export type TranslationKey = {
  [N in keyof typeof en]: `${N}.${keyof (typeof en)[N] & string}`
}[keyof typeof en]

export type TParams = Record<string, string | number>

export function translate(lang: Language, key: TranslationKey, params?: TParams): string {
  const [namespace, name] = key.split('.') as [keyof Dictionary, string]
  const dict = dictionaries[lang][namespace] as Record<string, string>
  const text = dict[name] ?? key
  if (!params) return text
  return text.replace(/\{(\w+)\}/g, (match, param: string) =>
    param in params ? String(params[param]) : match,
  )
}

export const locales: Record<Language, string> = { en: 'en-US', es: 'es-ES' }
