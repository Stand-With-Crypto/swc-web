import { fakerFields } from '@/mocks/fakerUtils'
import { mockCommonDatetimes } from '@/mocks/mockCommonDatetimes'
import { faker } from '@faker-js/faker'
import { UserActionEmailRecipient } from '@prisma/client'

export function mockUserActionEmailRecipient(): UserActionEmailRecipient {
  return {
    id: fakerFields.id(),
    userActionEmailId: fakerFields.id(),
    dtsiSlug: fakerFields.dtsiSlug(),
  }
}
