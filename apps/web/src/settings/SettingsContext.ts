import { createContext } from 'react'
import type { Language } from '../i18n'

export type Theme = 'dark' | 'light'

export type SettingsContextValue = {
  language: Language
  setLanguage: (language: Language) => void
  /** BCP 47 locale for number and date formatting. */
  locale: string
  theme: Theme
  setTheme: (theme: Theme) => void
}

export const SettingsContext = createContext<SettingsContextValue | null>(null)
