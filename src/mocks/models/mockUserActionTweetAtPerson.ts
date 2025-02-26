import { Prisma, UserActionTweetAtPerson } from '@prisma/client'

import { fakerFields } from '@/mocks/fakerUtils'

export function mockUserActionTweetAtPersonInput() {
  return {
    recipientDtsiSlug: fakerFields.dtsiSlug(),
  } satisfies Prisma.UserActionTweetAtPersonCreateInput
}

export function mockUserActionTweetAtPerson(): UserActionTweetAtPerson {
  return {
    ...mockUserActionTweetAtPersonInput(),
    id: fakerFields.id(),
  }
}
