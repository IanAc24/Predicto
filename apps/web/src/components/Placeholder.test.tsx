import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import { Placeholder } from './Placeholder'

test('renders title and note', () => {
  render(<Placeholder title="Watchlist" note="Coming soon" />)
  expect(screen.getByRole('heading', { name: 'Watchlist' })).toBeInTheDocument()
  expect(screen.getByText('Coming soon')).toBeInTheDocument()
})
