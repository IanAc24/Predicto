import type { Instrument } from '../../api/types'

/** "ADS · XETRA · EUR": symbol, exchange and currency identify one listing. */
export function listingMeta(instrument: Instrument): string {
  return `${instrument.symbol} · ${instrument.exchange} · ${instrument.currency}`
}
