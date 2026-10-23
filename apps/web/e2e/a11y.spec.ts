import { expect, test, type Page } from '@playwright/test'

/** The element that has keyboard focus, with what a sighted keyboard user would see. */
async function focused(page: Page) {
  return page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null
    if (!el || el === document.body) return null
    const style = getComputedStyle(el)
    const rect = el.getBoundingClientRect()
    return {
      name: el.getAttribute('aria-label') ?? el.textContent?.trim() ?? el.tagName,
      outlineVisible: style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0,
      inViewport: rect.bottom > 0 && rect.top < window.innerHeight,
    }
  })
}

async function tabTo(page: Page, name: RegExp, limit = 60) {
  for (let i = 0; i < limit; i++) {
    await page.keyboard.press('Tab')
    const el = await focused(page)
    if (el && name.test(el.name)) return el
  }
  throw new Error(`Never focused ${name}`)
}

test('the app bar is reachable in a logical order with a visible focus ring', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  const order = ['Skip to content', 'Stock Predictor', 'Watchlist', 'Add', 'Track record', 'Settings']
  const seen: string[] = []
  for (let i = 0; i < order.length; i++) {
    await page.keyboard.press('Tab')
    const el = await focused(page)
    expect(el?.outlineVisible, `focus ring on ${el?.name}`).toBe(true)
    seen.push(el?.name ?? '')
  }
  expect(seen.map((name, i) => name.startsWith(order[i]))).toEqual(order.map(() => true))
})

test('skip link moves focus to the main content', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await page.keyboard.press('Tab')
  await page.keyboard.press('Enter')
  await expect(page.locator('#main')).toBeFocused()
})

test('every screen can be walked with Tab and each stop shows a focus ring', async ({ page }) => {
  for (const route of ['/', '/add?q=nke', '/stocks/NYSE:NKE', '/track-record', '/settings']) {
    await page.goto(route)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await page.waitForLoadState('networkidle')
    const total = await page.locator('a[href], button, input, select').count()
    for (let i = 0; i < total + 2; i++) {
      await page.keyboard.press('Tab')
      const el = await focused(page)
      if (!el) continue
      expect(el.outlineVisible, `${route}: focus ring on "${el.name}"`).toBe(true)
      expect(el.inViewport, `${route}: "${el.name}" scrolled into view`).toBe(true)
    }
  }
})

test('removing and re-adding a stock works by keyboard alone', async ({ page }) => {
  await page.goto('/add?q=nke')
  await expect(page.getByRole('button', { name: /^Remove Nike/ }).first()).toBeVisible()
  await tabTo(page, /^Remove Nike/)
  await page.keyboard.press('Enter')
  // The question opens with focus on Cancel, the safe choice.
  await expect(page.getByRole('button', { name: 'Cancel' }).first()).toBeFocused()
  // Escape backs out and returns focus to the opener.
  await page.keyboard.press('Escape')
  await expect(page.getByRole('button', { name: /^Remove Nike/ }).first()).toBeFocused()
  await page.keyboard.press('Enter')
  await page.keyboard.press('Shift+Tab')
  await expect(page.getByRole('button', { name: 'Yes, remove' }).first()).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('button', { name: /^Add Nike/ })).toBeVisible()
  // Focus is not lost to the page top after the control disappears.
  await expect(page.locator('#add-search')).toBeFocused()
  await tabTo(page, /^Add Nike/)
  await page.keyboard.press('Enter')
  await expect(page.getByRole('button', { name: /^Remove Nike/ }).first()).toBeVisible()
})

test('both themes keep footer text readable', async ({ page }) => {
  for (const theme of ['dark', 'light']) {
    await page.addInitScript((value) => localStorage.setItem('theme', value), theme)
    await page.goto('/settings')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme)
    const ratio = await page.evaluate(() => {
      const parse = (css: string) => css.match(/\d+(\.\d+)?/g)!.slice(0, 3).map(Number)
      const lum = ([r, g, b]: number[]) => {
        const c = [r, g, b].map((v) => {
          const s = v / 255
          return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
        })
        return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
      }
      const text = lum(parse(getComputedStyle(document.querySelector('footer')!).color))
      const bg = lum(parse(getComputedStyle(document.body).backgroundColor))
      return (Math.max(text, bg) + 0.05) / (Math.min(text, bg) + 0.05)
    })
    expect(ratio, `${theme} footer text`).toBeGreaterThanOrEqual(4.5)
  }
})
