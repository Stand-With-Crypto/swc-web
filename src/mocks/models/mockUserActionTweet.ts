import { fakerFields } from '@/mocks/fakerUtils'
import { UserActionTweet } from '@prisma/client'

export function mockUserActionTweet(): UserActionTweet {
  return {
    id: fakerFields.id(),
  }
}
