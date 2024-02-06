import { fakerFields } from '@/mocks/fakerUtils'
import { AuthenticationNonce, Prisma } from '@prisma/client'

export function mockCreateAuthenticationNonceInput() {
  return {
    id: fakerFields.id(),
  } satisfies Prisma.AuthenticationNonceCreateInput
}

export function mockAuthenticationNonce(): AuthenticationNonce {
  return {
    ...mockCreateAuthenticationNonceInput(),
  }
}
