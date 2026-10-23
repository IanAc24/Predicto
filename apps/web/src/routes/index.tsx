import { createFileRoute } from '@tanstack/react-router'
import { Placeholder } from '../components/Placeholder'

export const Route = createFileRoute('/')({
  component: () => (
    <Placeholder title="Watchlist" note="Followed stocks and their prediction state will appear here." />
  ),
})
