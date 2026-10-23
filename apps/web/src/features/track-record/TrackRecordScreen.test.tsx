import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createMemoryHistory, createRouter } from '@tanstack/react-router'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, expect, test } from 'vitest'
import { mockConfig, mockStore, resetMockStore } from '../../api/mock'
import { routeTree } from '../../routeTree.gen'
import { SettingsProvider } from '../../settings/SettingsProvider'
import { LiveHero } from './LiveHero'

beforeEach(() => {
  mockConfig.delayMs = 0
  resetMockStore('default')
})

afterEach(() => {
  localStorage.clear()
})

function wrap(children: React.ReactNode) {
  return (
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <SettingsProvider>{children}</SettingsProvider>
    </QueryClientProvider>
  )
}

function renderScreen(path = '/track-record') {
  const router = createRouter({ routeTree, history: createMemoryHistory({ initialEntries: [path] }) })
  render(wrap(<RouterProvider router={router} />))
  return router
}

const ci: [number, number] = [0.4, 0.7]

test('hit rate shows n and the confidence interval', () => {
  render(wrap(<LiveHero live={{ n: 42, hits: 24, hitRate: 24 / 42, ci, baselineHitRate: 0.52 }} />))
  expect(screen.getByText('57%')).toBeInTheDocument()
  expect(screen.getByText(/95% interval 40% to 70% · n = 42/)).toBeInTheDocument()
  expect(screen.getByText('52%')).toBeInTheDocument()
  expect(screen.getByRole('img', { name: /from 40% to 70%; baseline 52%/ })).toBeInTheDocument()
})

test('small samples show the insufficient evidence message', () => {
  render(wrap(<LiveHero live={{ n: 8, hits: 5, hitRate: 5 / 8, ci: [0.31, 0.86], baselineHitRate: 0.52 }} />))
  expect(screen.getByText(/Insufficient evidence yet/)).toBeInTheDocument()
  expect(screen.getByText(/too wide to tell skill from luck/)).toBeInTheDocument()
})

test('enough samples do not show the insufficient evidence message', () => {
  render(wrap(<LiveHero live={{ n: 42, hits: 24, hitRate: 24 / 42, ci, baselineHitRate: 0.52 }} />))
  expect(screen.queryByText(/Insufficient evidence yet/)).not.toBeInTheDocument()
})

test('live and hypothetical figures live in separate elements', async () => {
  renderScreen()
  const hypothetical = await screen.findByTestId('hypothetical-card')
  const live = screen.getByTestId('live-hero')
  expect(live.contains(hypothetical)).toBe(false)
  expect(hypothetical.contains(live)).toBe(false)
  expect(within(hypothetical).getByText('Hypothetical (backtest)')).toBeInTheDocument()
  expect(within(live).queryByText(/Hypothetical|backtest/i)).not.toBeInTheDocument()
  expect(within(hypothetical).queryByText(/Live performance/)).not.toBeInTheDocument()
})

test('weekly bars and calibration have text alternatives', async () => {
  renderScreen()
  await screen.findByTestId('live-hero')
  expect(screen.getByRole('table', { name: 'Hits and misses per week' })).toBeInTheDocument()
  expect(screen.getByRole('img', { name: /Calibration chart/ })).toBeInTheDocument()
  expect(screen.getByRole('columnheader', { name: 'Predicted' })).toBeInTheDocument()
})

test('ledger filters by outcome and instrument, and keeps filters in the URL', async () => {
  const router = renderScreen()
  const ledger = await screen.findByRole('region', { name: 'Ledger' })
  const all = within(ledger).getAllByRole('listitem').length
  const pendingCount = mockStore.getLedger().filter((e) => e.outcome === 'pending').length
  const pumaCount = mockStore.getLedger('XETRA:PUMA').length
  expect(all).toBeGreaterThan(40)

  fireEvent.click(within(ledger).getByRole('button', { name: 'Pending' }))
  await waitFor(() => expect(within(ledger).getAllByRole('listitem')).toHaveLength(pendingCount))
  expect(within(ledger).getAllByText('Pending').length).toBe(pendingCount + 1) // rows plus the filter pill
  expect(router.state.location.search).toMatchObject({ filter: 'pending' })

  fireEvent.click(within(ledger).getByRole('button', { name: 'Hits' }))
  await waitFor(() =>
    expect(within(ledger).queryByText('Pending', { selector: 'span' })).not.toBeInTheDocument(),
  )
  expect(within(ledger).queryByText('Miss')).not.toBeInTheDocument()
  expect(within(ledger).getAllByText('Hit').length).toBeGreaterThan(0)

  fireEvent.click(within(ledger).getByRole('button', { name: 'All' }))
  await waitFor(() => expect(within(ledger).getAllByRole('listitem')).toHaveLength(all))

  fireEvent.change(within(ledger).getByLabelText('Instrument'), { target: { value: 'XETRA:PUMA' } })
  await waitFor(() => expect(within(ledger).getAllByRole('listitem')).toHaveLength(pumaCount))
  expect(router.state.location.search).toMatchObject({ instrument: 'XETRA:PUMA' })
})

test('filters are read from the URL', async () => {
  renderScreen('/track-record?filter=miss')
  const ledger = await screen.findByRole('region', { name: 'Ledger' })
  expect(within(ledger).getByRole('button', { name: 'Misses' })).toHaveAttribute('aria-pressed', 'true')
  expect(within(ledger).queryByText('Hit')).not.toBeInTheDocument()
})

test('error scenario shows a retry', async () => {
  resetMockStore('error')
  renderScreen()
  expect(await screen.findByRole('alert')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument()
})

test('empty scenario shows the empty state', async () => {
  resetMockStore('empty')
  renderScreen()
  expect(await screen.findByText(/No predictions have resolved yet/)).toBeInTheDocument()
})
