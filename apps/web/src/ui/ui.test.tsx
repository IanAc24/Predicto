import { fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { expect, test, vi } from 'vitest'
import { SettingsProvider } from '../settings/SettingsProvider'
import { ConfirmButton, OutcomeBadge, ProgressBar, SignedChange, Sparkline, StateBadge, StatusScreen } from './index'

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

test('OutcomeBadge pairs each outcome with a glyph and a word', () => {
  const { rerender } = wrap(<OutcomeBadge outcome="hit" excessReturn={1.2} excessLabel="Excess return" />)
  expect(screen.getByText('Hit')).toBeInTheDocument()
  expect(screen.getByText('✓')).toBeInTheDocument()
  expect(screen.getByText('+1.2%')).toBeInTheDocument()
  rerender(
    <SettingsProvider>
      <OutcomeBadge outcome="pending" excessReturn={null} excessLabel="Excess return" />
    </SettingsProvider>,
  )
  expect(screen.getByText('Pending')).toBeInTheDocument()
  expect(screen.queryByText('Excess return')).not.toBeInTheDocument()
})

test('ConfirmButton asks first, and Escape backs out', () => {
  const onConfirm = vi.fn()
  render(
    <ConfirmButton
      label="Remove"
      question="Remove it?"
      confirmLabel="Yes"
      pendingLabel="Removing…"
      cancelLabel="Cancel"
      retryLabel="Retry"
      errorText="Failed"
      pending={false}
      failed={false}
      onConfirm={onConfirm}
    />,
  )
  fireEvent.click(screen.getByRole('button', { name: 'Remove' }))
  expect(onConfirm).not.toHaveBeenCalled()
  expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus()
  fireEvent.keyDown(screen.getByRole('group'), { key: 'Escape' })
  expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Remove' }))
  fireEvent.click(screen.getByRole('button', { name: 'Yes' }))
  expect(onConfirm).toHaveBeenCalledTimes(1)
})
