import { createFileRoute } from '@tanstack/react-router'
import { AddScreen } from '../features/add/AddScreen'

export const Route = createFileRoute('/add')({
  validateSearch: (search: Record<string, unknown>): { q?: string } => ({
    q: typeof search.q === 'string' && search.q ? search.q : undefined,
  }),
  component: AddScreen,
})
