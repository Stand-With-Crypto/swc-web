import { fakerFields } from '@/mocks/fakerUtils'
import { UserActionEmailRecipient } from '@prisma/client'

export function mockUserActionEmailRecipient(): UserActionEmailRecipient {
  return {
    id: fakerFields.id(),
    userActionEmailId: fakerFields.id(),
    dtsiSlug: fakerFields.dtsiSlug(),
  }
}
