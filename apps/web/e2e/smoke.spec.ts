import { expect, test, type Page } from '@playwright/test'

const ROUTES = ['/', '/add', '/stocks/NYSE:NKE', '/track-record', '/settings']

/** Content that only exists once a route's data has loaded (the mock API answers after a delay). */
const LOADED: Record<string, RegExp> = {
  '/': /Stocks followed|Acciones seguidas/,
  '/add': /Remove|Quitar|Eliminar/,
  '/stocks/NYSE:NKE': /Recent predictions|Predicciones recientes/,
  '/track-record': /Hypothetical|Hipotético/,
  '/settings': /Mock data/,
}

/** Waits until the route has real content, not just its title. */
async function settled(page: Page, route: string) {
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.getByText(LOADED[route]).first()).toBeVisible()
  await page.waitForLoadState('networkidle')
}

test('watchlist shows Nike, Adidas and the Adidas ADR', async ({ page }) => {
  await page.goto('/')
  const list = page.getByRole('list', { name: 'Followed stocks' })
  await expect(list).toBeVisible()
  for (const symbol of ['NKE', 'ADS', 'ADDYY']) {
    await expect(list.getByText(symbol, { exact: true })).toBeVisible()
  }
})

test('adding PUMA from /add puts it on the watchlist as observing', async ({ page }) => {
  await page.goto('/add')
  await page.getByLabel('Search by company name or symbol').fill('PUMA')
  await page.getByRole('button', { name: /^Add Puma/ }).click()
  await expect(page.getByRole('status').filter({ hasText: 'Added.' })).toBeVisible()
  await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Watchlist' }).click()
  const row = page.getByRole('list', { name: 'Followed stocks' }).getByRole('link', { name: /Puma/ })
  await expect(row).toBeVisible()
  await expect(row).toContainText('Observing')
})

test('Nike detail shows the probability with its base rate, and the range lives in the URL', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: /Nike/ }).first().click()
  await expect(page.getByRole('heading', { level: 1, name: /Nike/ })).toBeVisible()
  await expect(page.getByText('58%', { exact: true })).toBeVisible()
  await expect(page.getByText(/Base rate 52%/)).toBeVisible()
  await page.getByRole('button', { name: '1Y' }).click()
  await expect(page).toHaveURL(/range=1Y/)
  await expect(page.getByRole('button', { name: '1Y' })).toHaveAttribute('aria-pressed', 'true')
})

test('Adidas on XETRA shows the observing state', async ({ page }) => {
  await page.goto('/stocks/XETRA:ADS')
  await expect(page.getByRole('heading', { level: 1, name: /Adidas/ })).toBeVisible()
  await expect(page.getByText('Observing', { exact: true })).toBeVisible()
  await expect(page.getByText(/Day 12 of 30/)).toBeVisible()
})

test('track record shows the live hit rate and a separate hypothetical card', async ({ page }) => {
  await page.goto('/track-record')
  await expect(page.getByRole('heading', { level: 1, name: 'Track record' })).toBeVisible()
  await expect(page.getByText('Live performance')).toBeVisible()
  await expect(page.getByText(/resolved predictions/).first()).toBeVisible()
  const hypothetical = page.getByTestId('hypothetical-card')
  await expect(hypothetical).toContainText('Hypothetical (backtest)')
  await expect(hypothetical).toContainText('Not a live result')
})

test('settings switch language and theme', async ({ page }) => {
  await page.goto('/settings')
  await page.getByRole('button', { name: 'Español' }).click()
  const nav = page.getByRole('navigation', { name: 'Principal' })
  await expect(nav.getByRole('link', { name: 'Seguimiento' })).toBeVisible()
  await expect(nav.getByRole('link', { name: 'Historial' })).toBeVisible()
  await page.getByRole('button', { name: 'Claro' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
})

test('scenario=error shows an error with retry on the watchlist', async ({ page }) => {
  await page.goto('/?scenario=error')
  await expect(page.getByRole('alert')).toContainText('Something went wrong')
  await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible()
})

test('scenario=empty shows the empty state', async ({ page }) => {
  await page.goto('/?scenario=empty')
  await expect(page.getByText('You are not following any stocks yet')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Add a stock' })).toBeVisible()
})

test.describe('phone width', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  for (const route of ROUTES) {
    test(`no horizontal scroll on ${route}`, async ({ page }) => {
      await page.goto(route)
      await settled(page, route)
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      )
      expect(overflow).toBeLessThanOrEqual(0)
    })

    test(`no horizontal scroll on ${route} in Spanish`, async ({ page }) => {
      await page.addInitScript(() => localStorage.setItem('lang', 'es'))
      await page.goto(route)
      await settled(page, route)
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      )
      expect(overflow).toBeLessThanOrEqual(0)
    })
  }
})

for (const route of ROUTES) {
  test(`no console errors on ${route}`, async ({ page }) => {
    const problems: string[] = []
    page.on('console', (message) => {
      if (message.type() === 'error') problems.push(message.text())
    })
    page.on('pageerror', (error) => problems.push(error.message))
    await page.goto(route)
    await settled(page, route)
    expect(problems).toEqual([])
  })
}
