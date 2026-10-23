export const detail = {
  title: 'Stock detail',
  placeholder: 'Price chart and prediction will appear here.',
} as const

export type DetailDict = Record<keyof typeof detail, string>
