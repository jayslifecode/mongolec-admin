import { describe, expect, test } from 'vitest'
import { z } from 'zod'
import { collectFieldErrors } from './field-errors'

const schema = z.object({ a: z.string().min(1, 'A needed'), b: z.string().min(2, 'B short') })

describe('collectFieldErrors', () => {
  test('returns an empty object when the value is valid', () => {
    expect(collectFieldErrors(schema.safeParse({ a: 'x', b: 'yy' }))).toEqual({})
  })

  test('maps each failing field to its first message', () => {
    expect(collectFieldErrors(schema.safeParse({ a: '', b: 'y' }))).toEqual({ a: 'A needed', b: 'B short' })
  })

  test('keeps only the first message per field', () => {
    const s = z.object({ a: z.string().min(3, 'first').regex(/^\d+$/, 'second') })
    expect(collectFieldErrors(s.safeParse({ a: 'x' }))).toEqual({ a: 'first' })
  })
})
