import type { Instrument } from '../types'

export const NKE: Instrument = {
  id: 'NYSE:NKE',
  symbol: 'NKE',
  name: 'Nike',
  exchange: 'NYSE',
  currency: 'USD',
  timeZone: 'America/New_York',
}

export const ADS: Instrument = {
  id: 'XETRA:ADS',
  symbol: 'ADS',
  name: 'Adidas',
  exchange: 'XETRA',
  currency: 'EUR',
  timeZone: 'Europe/Berlin',
}

export const ADDYY: Instrument = {
  id: 'OTC:ADDYY',
  symbol: 'ADDYY',
  name: 'Adidas (ADR)',
  exchange: 'OTC',
  currency: 'USD',
  timeZone: 'America/New_York',
}

const extras: Instrument[] = [
  { id: 'XETRA:PUMA', symbol: 'PUMA', name: 'Puma', exchange: 'XETRA', currency: 'EUR', timeZone: 'Europe/Berlin' },
  { id: 'NYSE:UAA', symbol: 'UAA', name: 'Under Armour', exchange: 'NYSE', currency: 'USD', timeZone: 'America/New_York' },
  { id: 'NASDAQ:LULU', symbol: 'LULU', name: 'Lululemon', exchange: 'NASDAQ', currency: 'USD', timeZone: 'America/New_York' },
  { id: 'NYSE:SKX', symbol: 'SKX', name: 'Skechers', exchange: 'NYSE', currency: 'USD', timeZone: 'America/New_York' },
  { id: 'NYSE:DECK', symbol: 'DECK', name: 'Deckers Outdoor', exchange: 'NYSE', currency: 'USD', timeZone: 'America/New_York' },
  { id: 'NYSE:ONON', symbol: 'ONON', name: 'On Holding', exchange: 'NYSE', currency: 'USD', timeZone: 'America/New_York' },
]

export const ALL_INSTRUMENTS: Instrument[] = [NKE, ADS, ADDYY, ...extras]

/** Last close used to anchor each instrument's generated price history. */
export const END_PRICES: Record<string, number> = {
  'NYSE:NKE': 78.42,
  'XETRA:ADS': 186.3,
  'OTC:ADDYY': 108.15,
  'XETRA:PUMA': 24.6,
  'NYSE:UAA': 6.85,
  'NASDAQ:LULU': 195.4,
  'NYSE:SKX': 62.1,
  'NYSE:DECK': 112.75,
  'NYSE:ONON': 44.3,
}
