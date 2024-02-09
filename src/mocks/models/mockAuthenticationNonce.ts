import { AuthenticationNonce, Prisma } from '@prisma/client'

import { fakerFields } from '@/mocks/fakerUtils'

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
