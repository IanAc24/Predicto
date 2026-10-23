export const common = {
  appName: 'Stock Predictor',
  appNameMain: 'Stock',
  appNameAccent: 'Predictor',
  homeLink: 'Go to the watchlist',
  skipToContent: 'Skip to content',
  navWatchlist: 'Watchlist',
  navAdd: 'Add',
  navTrackRecord: 'Track record',
  navSettings: 'Settings',
  mainNavLabel: 'Main',
  disclaimer:
    'Personal research tool. Predictions are probabilistic estimates, not investment advice.',
  staleData: 'Market data is out of date. Predictions may not reflect the latest prices.',
  loading: 'Loading…',
  loadError: 'Something went wrong while loading this.',
  retry: 'Retry',
  emptyTitle: 'Nothing here yet',
  stateObserving: 'Observing · day {day} of {total}',
  stateActive: '{probability} vs {baseRate} base',
  stateNoSignal: 'No signal',
  change: 'Change',
  up: 'up',
  down: 'down',
} as const

export type CommonDict = Record<keyof typeof common, string>
