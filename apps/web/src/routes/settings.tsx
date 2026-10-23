import { createFileRoute } from '@tanstack/react-router'
import { Placeholder } from '../components/Placeholder'

export const Route = createFileRoute('/settings')({
  component: () => (
    <Placeholder title="Settings" note="Horizon, observation length and data status will appear here." />
  ),
})
