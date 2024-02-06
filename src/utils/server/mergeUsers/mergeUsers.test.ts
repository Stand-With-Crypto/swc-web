import { MERGE_EMAIL_SOURCE_PRIORITY } from './constants'
import { UserEmailAddressSource } from '@prisma/client'
import { expect } from '@jest/globals'

it('MERGE_EMAIL_SOURCE_PRIORITY contains all values', () => {
  expect(Object.values(UserEmailAddressSource).sort()).toEqual(MERGE_EMAIL_SOURCE_PRIORITY.sort())
})
