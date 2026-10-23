export const trackRecord = {
  title: 'Track record',
  liveTitle: 'Live performance',
  hitRate: 'Hit rate',
  hitRateDetail: '95% interval {low} to {high} · n = {n} resolved predictions',
  baselineLabel: 'Always-up baseline',
  intervalLabel: 'Hit rate interval from {low} to {high}; baseline {baseline}',
  insufficientTitle: 'Insufficient evidence yet',
  insufficientBody:
    'With only {n} resolved predictions the interval is {width} points wide, too wide to tell skill from luck. Treat these numbers as noise until at least {min} predictions have resolved.',
  enoughBody:
    'The interval is {width} points wide. Compare it with the baseline before reading anything into it.',
  weeklyTitle: 'Weekly hits and misses',
  weeklyHits: 'Hits',
  weeklyMisses: 'Misses',
  weeklyWeek: 'Week of {date}',
  weeklySummary: '{hits} hits, {misses} misses',
  weeklyChartLabel: 'Hits and misses per week',
  calibrationTitle: 'Calibration',
  calibrationIntro:
    'Dots on the diagonal mean predicted and observed frequencies agree. Dot size shows how many predictions fall in the bucket.',
  calibrationChartLabel:
    'Calibration chart: predicted against observed frequency per probability bucket',
  calibrationBucket: 'Bucket',
  calibrationPredicted: 'Predicted',
  calibrationObserved: 'Observed',
  calibrationN: 'n',
  ledgerTitle: 'Ledger',
  filterAll: 'All',
  filterHits: 'Hits',
  filterMisses: 'Misses',
  filterPending: 'Pending',
  filterOutcomeLabel: 'Filter by outcome',
  filterInstrumentLabel: 'Instrument',
  filterAllInstruments: 'All instruments',
  weekOf: 'Week of {date}',
  issued: 'Issued {date}',
  probabilityMeta: '{probability} probability',
  excessReturn: 'Excess return',
  ledgerNoMatches: 'No predictions match these filters.',
  hypotheticalTitle: 'Hypothetical (backtest)',
  hypotheticalWarning: 'Not a live result. Kept separate from the live numbers above.',
  hypotheticalHitRate: 'Backtest hit rate',
  hypotheticalN: 'n = {n} simulated predictions',
  emptyText:
    'No predictions have resolved yet. Results appear here once the first week has passed.',
} as const

export type TrackRecordDict = Record<keyof typeof trackRecord, string>
