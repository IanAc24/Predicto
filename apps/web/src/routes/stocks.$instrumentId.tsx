import { createFileRoute } from '@tanstack/react-router'
import { Placeholder } from '../components/Placeholder'

export const Route = createFileRoute('/stocks/$instrumentId')({
  component: StockDetail,
})

function StockDetail() {
  const { instrumentId } = Route.useParams()
  return <Placeholder title={instrumentId} note="Price chart and prediction panel will appear here." />
}
