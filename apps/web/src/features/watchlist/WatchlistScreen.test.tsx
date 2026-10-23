import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createMemoryHistory, createRouter } from '@tanstack/react-router'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { mockConfig, mockStore } from '../../api/mock'
import { routeTree } from '../../routeTree.gen'
import { SettingsProvider } from '../../settings/SettingsProvider'

beforeEach(() => {
  mockConfig.delayMs = 0
})

afterEach(() => {
  vi.restoreAllMocks()
  localStorage.clear()
})

function renderAt(path: string) {
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
}

const rowHrefs = () =>
  within(screen.getByRole('list', { name: 'Followed stocks' }))
    .getAllByRole('link')
    .map((link) => link.getAttribute('href'))

test('default scenario renders one linked row per stock with badges and hit rate', async () => {
  renderAt('/')
  const list = await screen.findByRole('list', { name: 'Followed stocks' })
  const links = within(list).getAllByRole('link')
  expect(links).toHaveLength(3)
  expect(links[0]).toHaveAttribute('href', expect.stringContaining('/stocks/'))
  expect(within(list).getByText(/vs .* base/)).toBeInTheDocument()
  expect(within(list).getByText(/Observing · day/)).toBeInTheDocument()
  expect(within(list).getByText('No signal')).toBeInTheDocument()
  expect(await screen.findByText(/of \d+ resolved · 95% CI/)).toBeInTheDocument()
  expect(screen.getByText(/Always-up baseline/)).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Add a stock' })).toHaveAttribute('href', '/add')
})

test('empty state links to add', async () => {
  vi.spyOn(mockStore, 'getWatchlist').mockReturnValue([])
  renderAt('/')
  expect(await screen.findByText(/not following any stocks/)).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Add a stock' })).toHaveAttribute('href', '/add')
})

test('error state offers retry', async () => {
  const spy = vi.spyOn(mockStore, 'getWatchlist').mockImplementation(() => {
    throw new Error('boom')
  })
  renderAt('/')
  expect(await screen.findByRole('alert')).toBeInTheDocument()
  spy.mockRestore()
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
  expect(await screen.findByRole('list', { name: 'Followed stocks' })).toBeInTheDocument()
})

test('sort selector reorders rows', async () => {
  renderAt('/')
  await screen.findByRole('list', { name: 'Followed stocks' })
  const byName = rowHrefs()
  fireEvent.click(screen.getByRole('button', { name: 'Probability' }))
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Probability' })).toHaveAttribute('aria-pressed', 'true'),
  )
  const byProbability = rowHrefs()
  // The only active stock (NKE) comes first when sorting by probability.
  expect(byProbability[0]).toContain('NKE')
  expect(byProbability).not.toEqual(byName)
})

test('sort comes from the URL', async () => {
  renderAt('/?sort=change')
  await screen.findByRole('list', { name: 'Followed stocks' })
  expect(screen.getByRole('button', { name: 'Day change' })).toHaveAttribute('aria-pressed', 'true')
})
