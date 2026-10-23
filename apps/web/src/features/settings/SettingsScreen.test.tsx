import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createMemoryHistory, createRouter } from '@tanstack/react-router'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, test } from 'vitest'
import { mockConfig, mockStore, resetMockStore } from '../../api/mock'
import { routeTree } from '../../routeTree.gen'
import { SettingsProvider } from '../../settings/SettingsProvider'

beforeEach(() => {
  mockConfig.delayMs = 0
  resetMockStore('default')
})

afterEach(() => {
  localStorage.clear()
})

function renderSettings() {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ['/settings'] }),
  })
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <SettingsProvider>
        <RouterProvider router={router} />
      </SettingsProvider>
    </QueryClientProvider>,
  )
}

test('language and theme pills update the settings context', async () => {
  renderSettings()
  await screen.findByRole('button', { name: 'Español' })
  expect(screen.getByRole('button', { name: 'English' })).toHaveAttribute('aria-pressed', 'true')

  fireEvent.click(screen.getByRole('button', { name: 'Light' }))
  expect(document.documentElement.dataset.theme).toBe('light')

  fireEvent.click(screen.getByRole('button', { name: 'Español' }))
  expect(await screen.findByRole('heading', { level: 1, name: 'Ajustes' })).toBeInTheDocument()
  expect(screen.getByText('Metodología y aviso legal')).toBeInTheDocument()
})

test('observation weeks are saved through the mock API', async () => {
  renderSettings()
  const eight = await screen.findByRole('button', { name: '8 weeks' })
  fireEvent.click(eight)
  expect(eight).toHaveAttribute('aria-pressed', 'true')
  expect(mockStore.getUserSettings().observationWeeks).not.toBe(8)

  fireEvent.click(screen.getByRole('button', { name: 'Save' }))
  expect(await screen.findByText(/Saved/)).toBeInTheDocument()
  expect(mockStore.getUserSettings().observationWeeks).toBe(8)
})

test('shows horizon, data status and disclaimer', async () => {
  renderSettings()
  expect(await screen.findByText('5 trading days (fixed)')).toBeInTheDocument()
  expect(await screen.findByText('Mock data')).toBeInTheDocument()
  expect(screen.getByText(/^Predictions are probabilistic estimates for personal research/)).toBeInTheDocument()
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})

test('stale scenario shows the stale warning', async () => {
  resetMockStore('stale')
  renderSettings()
  expect(await screen.findByRole('alert')).toHaveTextContent(/out of date/)
})

test('error scenario shows retry buttons', async () => {
  resetMockStore('error')
  renderSettings()
  await waitFor(() => expect(screen.getAllByRole('button', { name: 'Retry' }).length).toBeGreaterThan(0))
})
