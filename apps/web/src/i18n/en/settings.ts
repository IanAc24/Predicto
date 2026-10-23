export const settings = {
  title: 'Settings',
  appearanceTitle: 'Appearance',
  language: 'Language',
  theme: 'Theme',
  themeDark: 'Dark',
  themeLight: 'Light',
  predictionTitle: 'Predictions',
  observationWeeks: 'Observation length',
  observationWeeksValue: '{weeks} weeks',
  observationHint: 'How long a new stock is watched before any probability is shown.',
  benchmark: 'Benchmark',
  benchmarkNote:
    'Predictions ask whether a stock beats this index. A home-index option (for example DAX for XETRA listings) is not available yet.',
  displayCurrency: 'Display currency',
  horizon: 'Horizon',
  horizonValue: '5 trading days (fixed)',
  save: 'Save',
  saving: 'Saving…',
  saved: 'Saved',
  saveError: 'Could not save. Try again.',
  dataTitle: 'Data status',
  provider: 'Provider',
  lastRun: 'Last update',
  staleWarning:
    'Warning: data is out of date. Predictions may not reflect the latest prices.',
  fresh: 'Data is up to date.',
  methodologyTitle: 'Methodology and disclaimer',
  methodologyDisclaimer:
    'Predictions are probabilistic estimates for personal research. They are not investment advice and can be wrong.',
  methodologyStates:
    'Observing: a new stock is watched for the observation length and no probability is shown. Active: the model shows a probability next to the base rate and sample size. No signal: the model has no usable edge over the base rate, so nothing is shown.',
  methodologyBacktest:
    'Backtests are hypothetical: they are simulated on past data and are always shown apart from live results.',
} as const

export type SettingsDict = Record<keyof typeof settings, string>
