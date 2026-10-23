import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { expect, test } from 'vitest'
import { SettingsProvider } from '../settings/SettingsProvider'
import { ProgressBar, SignedChange, Sparkline, StateBadge, StatusScreen } from './index'

const wrap = (node: ReactNode) => render(<SettingsProvider>{node}</SettingsProvider>)

test('StateBadge shows each of the three states', () => {
  const { rerender } = wrap(<StateBadge state="observing" day={12} total={30} />)
  expect(screen.getByText('Observing · day 12 of 30')).toBeInTheDocument()
  rerender(
    <SettingsProvider>
      <StateBadge state="active" probability={0.58} baseRate={0.52} />
    </SettingsProvider>,
  )
  expect(screen.getByText('58% vs 52% base')).toBeInTheDocument()
  rerender(
    <SettingsProvider>
      <StateBadge state="no-signal" />
    </SettingsProvider>,
  )
  expect(screen.getByText('No signal')).toBeInTheDocument()
})

test('SignedChange pairs colour with sign and arrow', () => {
  const { container, rerender } = wrap(<SignedChange value={1.2} />)
  expect(screen.getByText('+1.2%')).toBeInTheDocument()
  expect(container.querySelector('[data-direction="up"]')).toHaveTextContent('▲')
  rerender(
    <SettingsProvider>
      <SignedChange value={-0.8} />
    </SettingsProvider>,
  )
  expect(container.querySelector('[data-direction="down"]')).toHaveTextContent('▼')
  expect(screen.getByText('−0.8%')).toBeInTheDocument()
})

test('SignedChange treats a rounded zero as flat', () => {
  const { container } = wrap(<SignedChange value={0.01} />)
  expect(container.querySelector('[data-direction="flat"]')).toBeInTheDocument()
})

test('Sparkline is hidden from assistive tech but has a text alternative', () => {
  const { container } = wrap(<Sparkline values={[1, 2, 3]} label="Up 3 points over 3 days" />)
  expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  expect(screen.getByText('Up 3 points over 3 days')).toBeInTheDocument()
})

test('ProgressBar exposes its value', () => {
  wrap(<ProgressBar value={0.4} label="Observation progress" />)
  expect(screen.getByRole('progressbar', { name: 'Observation progress' })).toHaveAttribute(
    'aria-valuenow',
    '40',
  )
})

test('StatusScreen error offers a retry', () => {
  let retried = false
  wrap(<StatusScreen status="error" onRetry={() => (retried = true)} />)
  expect(screen.getByRole('alert')).toBeInTheDocument()
  screen.getByRole('button', { name: 'Retry' }).click()
  expect(retried).toBe(true)
})
