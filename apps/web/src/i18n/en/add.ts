export const add = {
  title: 'Add a stock',
  placeholder: 'Search for a stock to follow.',
} as const

export type AddDict = Record<keyof typeof add, string>
