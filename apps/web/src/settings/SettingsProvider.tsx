import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { locales, translate, type Language } from '../i18n'
import { readPref, writePref } from './prefs'
import { SettingsContext, type Theme } from './SettingsContext'

export function SettingsProvider({ children }: { children: ReactNode }) {
  // English unless Spanish was saved; light unless dark was saved.
  // Only a choice made in Settings is written, so a fresh install is never pinned.
  const [language, setLanguageState] = useState<Language>(() =>
    readPref('lang') === 'es' ? 'es' : 'en',
  )
  const [theme, setThemeState] = useState<Theme>(() =>
    readPref('theme') === 'dark' ? 'dark' : 'light',
  )

  const setLanguage = useCallback((next: Language) => {
    writePref('lang', next)
    setLanguageState(next)
  }, [])

  const setTheme = useCallback((next: Theme) => {
    writePref('theme', next)
    setThemeState(next)
  }, [])

  useEffect(() => {
    document.documentElement.lang = language
    document.title = translate(language, 'common.appName')
  }, [language])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  const value = useMemo(
    () => ({ language, setLanguage, locale: locales[language], theme, setTheme }),
    [language, setLanguage, theme, setTheme],
  )

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}
