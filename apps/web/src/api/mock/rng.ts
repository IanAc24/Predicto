// Deterministic helpers so fixtures are identical on every load. Never use Math.random in fixtures.

/** Small seeded PRNG (mulberry32). Returns a function giving numbers in [0, 1). */
export function createRng(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Stable 32-bit hash of a string, used to derive a seed per instrument. */
export function hashString(text: string): number {
  let hash = 2166136261
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

/** Standard normal sample (Box-Muller). */
export function gaussian(rng: () => number): number {
  const u = Math.max(rng(), 1e-12)
  const v = rng()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

const DAY_MS = 24 * 60 * 60 * 1000

/** Adds calendar days to a 'YYYY-MM-DD' date. */
export function addDays(date: string, days: number): string {
  return new Date(Date.parse(`${date}T00:00:00Z`) + days * DAY_MS).toISOString().slice(0, 10)
}

/** 0 = Sunday ... 6 = Saturday, for a 'YYYY-MM-DD' date. */
export function weekday(date: string): number {
  return new Date(`${date}T00:00:00Z`).getUTCDay()
}

/** Monday of the week containing the given 'YYYY-MM-DD' date. */
export function weekStart(date: string): string {
  const day = weekday(date)
  return addDays(date, day === 0 ? -6 : 1 - day)
}
