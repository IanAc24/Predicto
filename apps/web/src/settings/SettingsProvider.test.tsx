import { act, render, screen } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'
import { SettingsProvider } from './SettingsProvider'
import { useSettings } from './useSettings'

function Probe() {
  const { language, theme, setLanguage, setTheme } = useSettings()
  return (
    <div>
      <span data-testid="state">{`${language}/${theme}`}</span>
      <button onClick={() => setLanguage('es')}>es</button>
      <button onClick={() => setTheme('light')}>light</button>
    </div>
  )
}

function renderProbe() {
  return render(
    <SettingsProvider>
      <Probe />
    </SettingsProvider>,
  )
}

afterEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

test('defaults to English and dark, and applies them to <html>', () => {
  renderProbe()
  expect(screen.getByTestId('state')).toHaveTextContent('en/dark')
  expect(document.documentElement.lang).toBe('en')
  expect(document.documentElement.dataset.theme).toBe('dark')
})

test('persists changes and reads them back', () => {
  const first = renderProbe()
  act(() => screen.getByText('es').click())
  act(() => screen.getByText('light').click())
  expect(document.documentElement.lang).toBe('es')
  expect(document.documentElement.dataset.theme).toBe('light')
  first.unmount()
  renderProbe()
  expect(screen.getByTestId('state')).toHaveTextContent('es/light')
})

test('survives localStorage throwing', () => {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new Error('blocked')
  })
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('blocked')
  })
  renderProbe()
  act(() => screen.getByText('es').click())
  expect(screen.getByTestId('state')).toHaveTextContent('es/dark')
})
