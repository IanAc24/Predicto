import { createFileRoute } from '@tanstack/react-router'
import { Placeholder } from '../components/Placeholder'

export const Route = createFileRoute('/track-record')({
  component: () => (
    <Placeholder title="Track record" note="Every past prediction and its outcome will appear here." />
  ),
})
