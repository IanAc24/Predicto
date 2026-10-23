import { expect, test } from 'vitest'
import { mondayOf } from './dates'

test('mondayOf returns the Monday of the same week', () => {
  expect(mondayOf('2026-10-19')).toBe('2026-10-19') // Monday
  expect(mondayOf('2026-10-21')).toBe('2026-10-19') // Wednesday
  expect(mondayOf('2026-10-25')).toBe('2026-10-19') // Sunday belongs to the week before
})

test('mondayOf crosses month and year boundaries', () => {
  expect(mondayOf('2026-01-01')).toBe('2025-12-29')
  expect(mondayOf('2026-11-01')).toBe('2026-10-26')
})
