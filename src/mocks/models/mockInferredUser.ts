import { fakerFields } from '@/mocks/fakerUtils'
import { mockCommonDatetimes } from '@/mocks/mockCommonDatetimes'
import { InferredUser } from '@prisma/client'

export function mockInferredUser(): InferredUser {
  return {
    ...mockCommonDatetimes(),
    id: fakerFields.id(),
  }
}
