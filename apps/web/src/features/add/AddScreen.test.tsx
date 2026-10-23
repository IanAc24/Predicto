import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createMemoryHistory, createRouter } from '@tanstack/react-router'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'

import { afterEach, beforeEach, expect, test } from 'vitest'
import { mockConfig, mockStore } from '../../api/mock'
import type { Scenario } from '../../api/types'
import { routeTree } from '../../routeTree.gen'
import { SettingsProvider } from '../../settings/SettingsProvider'

function setScenario(scenario: Scenario) {
  ;(mockStore as { scenario: Scenario }).scenario = scenario
}

beforeEach(() => {
  mockConfig.delayMs = 0
  setScenario('default')
  // The mock store is a module singleton: start every test with an empty watchlist.
  for (const item of mockStore.getWatchlist()) mockStore.removeFromWatchlist(item.instrument.id)
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
  await screen.findByRole('heading', { level: 1, name: 'Add a stock' })
  return router
}

const resultsList = () => screen.findByRole('list', { name: 'Search results' })
const followingSection = () => screen.getByRole('region', { name: 'Following' })

test('typing searches after a pause and keeps the query in the URL', async () => {
  const router = await renderAt('/add')
  expect(screen.getByRole('searchbox', { name: /Search by company name/ })).toHaveFocus()
  expect(screen.getByText(/Type a company name or a symbol/)).toBeInTheDocument()
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'nike' } })
  const list = await resultsList()
  expect(within(list).getByText('Nike')).toBeInTheDocument()
  expect(router.state.location.search).toEqual({ q: 'nike' })
})

test('a suggestion fills the search', async () => {
  await renderAt('/add')
  fireEvent.click(screen.getByRole('button', { name: 'PUMA' }))
  expect(screen.getByRole('searchbox')).toHaveValue('PUMA')
  expect(within(await resultsList()).getByText('Puma')).toBeInTheDocument()
})

test('both Adidas listings appear as distinct choices with a note', async () => {
  await renderAt('/add?q=adidas')
  const list = await resultsList()
  const items = within(list).getAllByRole('listitem')
  expect(items).toHaveLength(2)
  expect(within(items[0]).getByText('ADS · XETRA · EUR')).toBeInTheDocument()
  expect(within(items[1]).getByText('ADDYY · OTC · USD')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Add Adidas (ADS, XETRA)' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Add Adidas (ADR) (ADDYY, OTC)' })).toBeInTheDocument()
  expect(screen.getByText(/tracked separately/)).toBeInTheDocument()
})

test('adding moves the stock to Following and confirms observation', async () => {
  await renderAt('/add?q=nke')
  fireEvent.click(await screen.findByRole('button', { name: 'Add Nike (NKE, NYSE)' }))
  const status = await screen.findByText(/Observing for 6 weeks before the first prediction/)
  expect(status).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Open Nike (NKE)' })).toHaveAttribute(
    'href',
    expect.stringContaining('/stocks/NYSE'),
  )
  expect(screen.queryByRole('button', { name: /^Add Nike/ })).not.toBeInTheDocument()
  await waitFor(() => expect(within(followingSection()).getByText('Nike')).toBeInTheDocument())
  expect(within(await resultsList()).getByText(/Following/)).toBeInTheDocument()
})

test('an already followed stock cannot be added again', async () => {
  mockStore.addToWatchlist('NYSE:NKE')
  await renderAt('/add?q=nke')
  const list = await resultsList()
  await waitFor(() => expect(within(list).getByText(/Following/)).toBeInTheDocument())
  expect(screen.queryByRole('button', { name: /^Add Nike/ })).not.toBeInTheDocument()
  expect(within(list).getByRole('button', { name: /^Remove Nike/ })).toBeInTheDocument()
})

test('removing asks for confirmation first, and can be cancelled', async () => {
  mockStore.addToWatchlist('NYSE:NKE')
  await renderAt('/add?q=zzzz')
  const following = await waitFor(() => {
    const section = followingSection()
    expect(within(section).getByText('Nike')).toBeInTheDocument()
    return section
  })
  fireEvent.click(within(following).getByRole('button', { name: /^Remove Nike/ }))
  expect(within(following).getByText(/Stop following Nike/)).toBeInTheDocument()
  expect(within(following).getByRole('button', { name: 'Cancel' })).toHaveFocus()
  fireEvent.click(within(following).getByRole('button', { name: 'Cancel' }))
  expect(within(following).getByText('Nike')).toBeInTheDocument()
  expect(mockStore.getWatchlist()).toHaveLength(1)

  fireEvent.click(within(following).getByRole('button', { name: /^Remove Nike/ }))
  fireEvent.click(within(following).getByRole('button', { name: 'Yes, remove' }))
  await waitFor(() => expect(within(following).queryByText('Nike')).not.toBeInTheDocument())
  expect(within(following).getByText(/not following any stocks/)).toBeInTheDocument()
  expect(mockStore.getWatchlist()).toHaveLength(0)
})

test('a failed add shows a recoverable message with retry', async () => {
  await renderAt('/add?q=nke')
  const addButton = await screen.findByRole('button', { name: 'Add Nike (NKE, NYSE)' })
  await waitFor(() => expect(addButton).toBeEnabled())
  setScenario('error')
  fireEvent.click(addButton)
  const alert = await screen.findByRole('alert')
  expect(alert).toHaveTextContent('Could not add Nike. Nothing was changed.')
  setScenario('default')
  fireEvent.click(within(alert).getByRole('button', { name: 'Retry' }))
  await screen.findByText(/Observing for 6 weeks/)
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})

test('the error scenario shows a load error with retry for the search', async () => {
  setScenario('error')
  await renderAt('/add?q=nke')
  await waitFor(() => expect(screen.getAllByRole('alert').length).toBeGreaterThan(0))
  expect(screen.getAllByRole('button', { name: 'Retry' }).length).toBeGreaterThan(0)
})
