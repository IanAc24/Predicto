export const watchlist = {
  title: 'Watchlist',
  placeholder: 'Followed stocks and their prediction state will appear here.',
} as const

export type WatchlistDict = Record<keyof typeof watchlist, string>
