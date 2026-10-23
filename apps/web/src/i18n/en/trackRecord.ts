export const trackRecord = {
  title: 'Track record',
  placeholder: 'Every past prediction and its outcome will appear here.',
} as const

export type TrackRecordDict = Record<keyof typeof trackRecord, string>
