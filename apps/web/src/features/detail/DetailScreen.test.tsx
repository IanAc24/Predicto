import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createMemoryHistory, createRouter } from '@tanstack/react-router'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { mockConfig, resetMockStore, setMockScenario } from '../../api/mock'
import { routeTree } from '../../routeTree.gen'
import { SettingsProvider } from '../../settings/SettingsProvider'

// jsdom has no canvas, so the charting library is replaced by a recorder.
const chartMock = vi.hoisted(() => ({ setData: vi.fn(), remove: vi.fn() }))
vi.mock('lightweight-charts', () => {
  const series = () => ({
    setData: chartMock.setData,
    applyOptions: vi.fn(),
    priceScale: () => ({ applyOptions: vi.fn() }),
  })
  return {
    CandlestickSeries: 'Candlestick',
    HistogramSeries: 'Histogram',
    ColorType: { Solid: 'solid' },
    createChart: () => ({
      addSeries: series,
      applyOptions: vi.fn(),
      timeScale: () => ({ fitContent: vi.fn() }),
      remove: chartMock.remove,
    }),
    createSeriesMarkers: () => ({ setMarkers: vi.fn() }),
  }
})

beforeEach(() => {
  mockConfig.delayMs = 0
  resetMockStore('default')
})

afterEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
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
  return router
}

test('active prediction shows probability with base rate, record, definition, model and drivers', async () => {
  renderAt('/stocks/NYSE:NKE')
  const panel = (await screen.findByText('58%')).closest('section')!
  expect(panel).toHaveAttribute('data-state', 'active')
  expect(within(panel).getByText('Base rate 52%')).toBeInTheDocument()
  expect(within(panel).getByText(/Live record: \d+ of \d+ resolved predictions correct \(95% CI/)).toBeInTheDocument()
  expect(within(panel).getByText(/Chance of beating SPY over the next 5 trading days/)).toBeInTheDocument()
  expect(within(panel).getByText(/Target: .*higher than SPY/)).toBeInTheDocument()
  expect(within(panel).getByText(/Model baseline-0\.3\.0/)).toBeInTheDocument()
  expect(within(panel).getByText('4-week momentum vs benchmark')).toBeInTheDocument()
  expect(within(panel).getByText('Recent volatility').closest('li')).toHaveAttribute(
    'data-direction',
    'down',
  )
  expect(screen.getByRole('heading', { level: 1, name: /Nike/ })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /Back to the watchlist/ })).toHaveAttribute('href', '/')
})

test('observing prediction shows progress and explanation, no probability', async () => {
  renderAt('/stocks/XETRA:ADS')
  expect(await screen.findByText('Day 12 of 30')).toBeInTheDocument()
  expect(screen.getByRole('progressbar', { name: 'Observation progress' })).toHaveAttribute(
    'aria-valuenow',
    '40',
  )
  expect(screen.getByText(/recorded silently/)).toBeInTheDocument()
  expect(screen.queryByText(/Base rate/)).not.toBeInTheDocument()
})

test('no-signal prediction says the model has no edge', async () => {
  renderAt('/stocks/OTC:ADDYY')
  expect(await screen.findByText('No signal')).toBeInTheDocument()
  expect(screen.getByText(/no edge for this stock today/)).toBeInTheDocument()
  expect(screen.getByText(/base rate of 51%/)).toBeInTheDocument()
})

test('no imperative buy or sell wording on any state', async () => {
  renderAt('/stocks/NYSE:NKE')
  await screen.findByText('58%')
  expect(document.body.textContent).not.toMatch(/\b(buy|sell)\b/i)
})

test('every recent prediction lists probability against base rate', async () => {
  renderAt('/stocks/NYSE:NKE')
  const list = (await screen.findByText('Recent predictions')).closest('section')!
  await waitFor(() => expect(within(list).getAllByRole('listitem').length).toBeGreaterThan(0))
  for (const item of within(list).getAllByRole('listitem')) {
    expect(item.textContent).toMatch(/\d+% vs \d+% base/)
    expect(item.textContent).toMatch(/Hit|Miss|Pending/)
  }
})

test('the chart is built and fed with bars; default range is 6M', async () => {
  renderAt('/stocks/NYSE:NKE')
  await screen.findByRole('img', { name: /Candlestick price chart with volume, 6M/ })
  await waitFor(() => expect(chartMock.setData).toHaveBeenCalled())
  expect(screen.getByRole('button', { name: '6M' })).toHaveAttribute('aria-pressed', 'true')
})

test('range selector switches the range and stores it in the URL', async () => {
  const router = renderAt('/stocks/NYSE:NKE')
  await screen.findByRole('img', { name: /6M/ })
  fireEvent.click(screen.getByRole('button', { name: '1Y' }))
  await screen.findByRole('img', { name: /with volume, 1Y/ })
  expect(screen.getByRole('button', { name: '1Y' })).toHaveAttribute('aria-pressed', 'true')
  expect(router.state.location.search).toMatchObject({ range: '1Y' })
})

test('range comes from the URL and invalid values fall back to 6M', async () => {
  renderAt('/stocks/NYSE:NKE?range=3Y')
  await screen.findByRole('img', { name: /with volume, 3Y/ })
  expect(screen.getByRole('button', { name: '3Y' })).toHaveAttribute('aria-pressed', 'true')
})

test('invalid range value falls back to 6M', async () => {
  renderAt('/stocks/NYSE:NKE?range=9Z')
  await screen.findByRole('img', { name: /with volume, 6M/ })
})

test('unknown instrument shows an empty state with a link back', async () => {
  renderAt('/stocks/NOPE:XYZ')
  expect(await screen.findByText('This stock is not on your watchlist.')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Go to the watchlist' })).toHaveAttribute('href', '/')
})

test('error scenario shows an error with retry that recovers', async () => {
  resetMockStore('error')
  renderAt('/stocks/NYSE:NKE')
  expect(await screen.findByRole('alert')).toHaveTextContent('Something went wrong')
  setMockScenario('default')
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
  expect(await screen.findByText('58%')).toBeInTheDocument()
})

test('shows a loading status first', async () => {
  mockConfig.delayMs = 300
  renderAt('/stocks/NYSE:NKE')
  expect(await screen.findByRole('status')).toHaveTextContent('Loading')
})
