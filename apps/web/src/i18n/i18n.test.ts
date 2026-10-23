import { expect, test } from 'vitest'
import { en, es, translate } from './index'

test('Spanish has exactly the same keys as English', () => {
  expect(Object.keys(es).sort()).toEqual(Object.keys(en).sort())
  for (const namespace of Object.keys(en) as (keyof typeof en)[]) {
    expect(Object.keys(es[namespace]).sort(), namespace).toEqual(
      Object.keys(en[namespace]).sort(),
    )
  }
})

test('no translation is empty', () => {
  for (const dict of [en, es]) {
    for (const [namespace, entries] of Object.entries(dict)) {
      for (const [key, value] of Object.entries(entries)) {
        expect(value, `${namespace}.${key}`).not.toBe('')
      }
    }
  }
})

test('placeholders match between languages', () => {
  const params = (text: string) => (text.match(/\{\w+\}/g) ?? []).sort()
  for (const namespace of Object.keys(en) as (keyof typeof en)[]) {
    const english = en[namespace] as Record<string, string>
    const spanish = es[namespace] as Record<string, string>
    for (const key of Object.keys(english)) {
      expect(params(spanish[key]), `${namespace}.${key}`).toEqual(params(english[key]))
    }
  }
})

test('translate fills params', () => {
  expect(translate('en', 'common.stateObserving', { day: 12, total: 30 })).toBe(
    'Observing · day 12 of 30',
  )
  expect(translate('es', 'common.stateObserving', { day: 12, total: 30 })).toBe(
    'Observando · día 12 de 30',
  )
})
