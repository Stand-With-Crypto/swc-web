import { Prisma } from '@prisma/client'

import { fakerFields } from '@/mocks/fakerUtils'

export function mockUserActionTweetAtPersonInput() {
  return {
    recipientDtsiSlug: fakerFields.dtsiSlug(),
  } satisfies Prisma.UserActionTweetAtPersonCreateInput
}
