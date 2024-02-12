import { UserSession } from '@prisma/client'

import { fakerFields } from '@/mocks/fakerUtils'
import { mockCommonDatetimes } from '@/mocks/mockCommonDatetimes'

export function mockUserSession(): UserSession {
  return {
    ...mockCommonDatetimes(),
    id: fakerFields.id(),
    userId: fakerFields.id(),
  }
}
