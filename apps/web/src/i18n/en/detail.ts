export const detail = {
  title: 'Stock detail',
  back: 'Back to the watchlist',
  meta: '{exchange} · {currency} · {timeZone}',
  lastClose: 'Last close',
  asOf: 'Data as of {date}',
  notFound: 'This stock is not on your watchlist.',
  notFoundAction: 'Go to the watchlist',

  predictionLabel: 'Prediction · next {days} trading days',
  observingTitle: 'Observing',
  observingProgress: 'Observation progress',
  observingDay: 'Day {day} of {total}',
  observingBody:
    'Predictions for this stock are being recorded silently so there is an honest track record before any are shown. No prediction is displayed yet.',
  activeQuestion: 'Chance of beating {benchmark} over the next {days} trading days',
  activeBase: 'Base rate {baseRate}',
  activeBaseNote: 'How often this happened in past weeks.',
  liveRecord: 'Live record: {hits} of {n} resolved predictions correct (95% CI {low}–{high}).',
  liveRecordNone: 'No resolved live predictions for this stock yet.',
  horizonDefinition:
    'Target: this stock’s return over the next {days} trading days is higher than {benchmark}’s.',
  modelVersion: 'Model {version}',
  issued: 'Issued {date}',
  driversTitle: 'Top drivers',
  driverUp: 'Pushes the estimate up',
  driverDown: 'Pushes the estimate down',
  noSignalTitle: 'No signal',
  noSignalBody:
    'The model has no edge for this stock today. Its estimate is no better than the base rate of {baseRate}, so no probability is shown.',

  chartTitle: 'Price',
  chartRange: 'Chart range',
  chartAria: 'Candlestick price chart with volume, {range}. Markers show past predictions.',
  chartLegend: 'Markers: ● hit, ■ miss, ▼ pending',
  markerHit: 'Hit',
  markerMiss: 'Miss',
  markerPending: 'Pending',

  recentTitle: 'Recent predictions',
  recentEmpty: 'No predictions have been issued for this stock yet.',
  recentRow: '{probability} vs {baseRate} base',
  recentIssued: 'Issued {date}',
  excessReturn: 'vs {benchmark}',
} as const

export type DetailDict = Record<keyof typeof detail, string>
