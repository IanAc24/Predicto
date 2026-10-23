import { createFileRoute } from '@tanstack/react-router'
import { TrackRecordScreen } from '../features/track-record/TrackRecordScreen'
import { validateTrackRecordSearch } from '../features/track-record/search'

export const Route = createFileRoute('/track-record')({
  validateSearch: validateTrackRecordSearch,
  component: TrackRecordScreen,
})
