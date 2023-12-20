import { fakerFields } from '@/mocks/fakerUtils'
import { mockCommonDatetimes } from '@/mocks/mockCommonDatetimes'
import { SessionUser } from '@prisma/client'

export function mockSessionUser(): SessionUser {
  return {
    ...mockCommonDatetimes(),
    id: fakerFields.id(),
    inferredUserId: fakerFields.id(),
  }
}
