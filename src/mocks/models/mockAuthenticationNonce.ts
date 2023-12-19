import { fakerFields } from '@/mocks/fakerUtils'
import { AuthenticationNonce } from '@prisma/client'

export function mockAuthenticationNonce(): AuthenticationNonce {
  return {
    id: fakerFields.id(),
  }
}
