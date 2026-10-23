export const watchlist = {
  title: 'Watchlist',
  followed: 'Stocks followed',
  countActive: '{count} active',
  countObserving: '{count} observing',
  countNoSignal: '{count} no signal',
  hitRateLabel: 'Live hit rate',
  hitRateValue: '{rate} of {n} resolved · 95% CI {low}-{high}',
  hitRateNone: 'No resolved predictions yet',
  baseline: 'Always-up baseline: {rate}',
  sortLabel: 'Sort by',
  sortName: 'Name',
  sortChange: 'Day change',
  sortProbability: 'Probability',
  listLabel: 'Followed stocks',
  trend: 'Recent price trend for {symbol}',
  addStock: 'Add a stock',
  emptyText: 'You are not following any stocks yet. Add one to start observing it.',
} as const

export type WatchlistDict = Record<keyof typeof watchlist, string>
