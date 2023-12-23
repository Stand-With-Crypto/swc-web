import { fakerFields } from '@/mocks/fakerUtils'
import { mockCommonDatetimes } from '@/mocks/mockCommonDatetimes'
import { UserSession } from '@prisma/client'

export function mockUserSession(): UserSession {
  return {
    ...mockCommonDatetimes(),
    id: fakerFields.id(),
    userId: fakerFields.id(),
  }
}
