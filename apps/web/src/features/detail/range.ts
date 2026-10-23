import type { BarRange } from '../../api/types'

export const RANGES: BarRange[] = ['1M', '6M', '1Y', '3Y']
export const DEFAULT_RANGE: BarRange = '6M'

/** Any unknown value falls back to the default range. */
export function parseRange(value: unknown): BarRange {
  return RANGES.find((range) => range === value) ?? DEFAULT_RANGE
}
