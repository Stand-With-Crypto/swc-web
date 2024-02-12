import { Prisma, UserActionEmailRecipient } from '@prisma/client'

import { fakerFields } from '@/mocks/fakerUtils'

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
