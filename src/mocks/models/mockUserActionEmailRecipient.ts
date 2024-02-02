import { fakerFields } from '@/mocks/fakerUtils'
import { Prisma, UserActionEmailRecipient } from '@prisma/client'

export function mockCreateUserActionEmailRecipientInput() {
  return {
    dtsiSlug: fakerFields.dtsiSlug(),
  } satisfies Omit<
    Prisma.UserActionEmailRecipientCreateInput,
    'userActionEmailId' | 'userActionEmail'
  >
}
export function mockUserActionEmailRecipient(): UserActionEmailRecipient {
  return {
    ...mockCreateUserActionEmailRecipientInput(),
    id: fakerFields.id(),
    userActionEmailId: fakerFields.id(),
  }
}
