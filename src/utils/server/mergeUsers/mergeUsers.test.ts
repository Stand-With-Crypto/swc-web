import { expect } from '@jest/globals'
import { UserEmailAddressSource } from '@prisma/client'

import { MERGE_EMAIL_SOURCE_PRIORITY } from './constants'

it('MERGE_EMAIL_SOURCE_PRIORITY contains all values', () => {
  expect(Object.values(UserEmailAddressSource).sort()).toEqual(MERGE_EMAIL_SOURCE_PRIORITY.sort())
})
