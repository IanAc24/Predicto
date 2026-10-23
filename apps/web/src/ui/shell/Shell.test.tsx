import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createMemoryHistory, createRouter } from '@tanstack/react-router'
import { render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, test } from 'vitest'
import { mockConfig } from '../../api/mock'
import { routeTree } from '../../routeTree.gen'
import { SettingsProvider } from '../../settings/SettingsProvider'

beforeEach(() => {
  mockConfig.delayMs = 0
})

afterEach(() => {
  localStorage.clear()
})

async function renderAt(path: string) {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [path] }),
  })
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <SettingsProvider>
        <RouterProvider router={router} />
      </SettingsProvider>
    </QueryClientProvider>,
  )
  await screen.findByRole('navigation', { name: 'Main' })
}

test('shell shows brand, tabs, settings link and disclaimer', async () => {
  await renderAt('/')
  expect(screen.getByRole('link', { name: /Stock Predictor/ })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Watchlist' })).toHaveAttribute('aria-current', 'page')
  expect(screen.getByRole('link', { name: 'Add' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Track record' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Settings' })).toHaveAttribute('href', '/settings')
  expect(screen.getByRole('link', { name: 'Skip to content' })).toBeInTheDocument()
  expect(
    screen.getByText(
      'Personal research tool. Predictions are probabilistic estimates, not investment advice.',
    ),
  ).toBeInTheDocument()
})

test.each([
  ['/', 'Watchlist'],
  ['/add', 'Add a stock'],
  ['/stocks/NYSE:NKE', 'Stock detail'],
  ['/track-record', 'Track record'],
  ['/settings', 'Settings'],
])('route %s renders its title', async (path, title) => {
  await renderAt(path)
  await waitFor(() => expect(screen.getByRole('heading', { level: 1, name: title })).toBeInTheDocument())
})

test('no stale banner with fresh data', async () => {
  await renderAt('/')
  expect(screen.queryByRole('status')).not.toBeInTheDocument()
})
