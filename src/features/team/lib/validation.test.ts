import { describe, expect, test } from 'vitest'
import { validateTeamMemberForm, type TeamMemberFormValues } from './validation'

function values(overrides: Partial<TeamMemberFormValues> = {}): TeamMemberFormValues {
  return {
    name: 'Anna',
    role: 'Director',
    bio: '',
    photo: '',
    email: '',
    linkedinUrl: '',
    twitterUrl: '',
    displayOrder: 0,
    isActive: true,
    ...overrides,
  }
}

describe('validateTeamMemberForm', () => {
  test('accepts a member with only name and role', () => {
    expect(validateTeamMemberForm(values())).toEqual({})
  })

  test('requires name and role', () => {
    expect(Object.keys(validateTeamMemberForm(values({ name: ' ', role: '' }))).sort()).toEqual(['name', 'role'])
  })

  test('checks the email when given', () => {
    expect(validateTeamMemberForm(values({ email: 'nope' })).email).toBeDefined()
    expect(validateTeamMemberForm(values({ email: 'a@b.org' }))).toEqual({})
  })

  test('requires full http(s) links for LinkedIn, Twitter and photo', () => {
    for (const key of ['linkedinUrl', 'twitterUrl', 'photo'] as const) {
      expect(validateTeamMemberForm(values({ [key]: 'linkedin.com/in/x' }))[key]).toBeDefined()
      expect(validateTeamMemberForm(values({ [key]: 'javascript:alert(1)' }))[key]).toBeDefined()
      expect(validateTeamMemberForm(values({ [key]: 'https://example.com/x' }))).toEqual({})
    }
  })

  test('rejects a negative or non-whole display order', () => {
    expect(validateTeamMemberForm(values({ displayOrder: -2 })).displayOrder).toBeDefined()
    expect(validateTeamMemberForm(values({ displayOrder: Number.NaN })).displayOrder).toBeDefined()
  })
})
