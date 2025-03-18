import { UserActionPoll } from '@prisma/client'

import { fakerFields } from '@/mocks/fakerUtils'

export function mockUserActionPoll(): UserActionPoll {
  return {
    id: fakerFields.id(),
  }
}
