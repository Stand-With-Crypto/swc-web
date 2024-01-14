import { MERGE_EMAIL_SOURCE_PRIORITY } from '@/utils/server/mergeUsers'
import { UserEmailAddressSource } from '@prisma/client'

it('MERGE_EMAIL_SOURCE_PRIORITY contains all values', () => {
  expect(Object.values(UserEmailAddressSource).sort()).toEqual(MERGE_EMAIL_SOURCE_PRIORITY.sort())
})
