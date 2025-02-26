import { Prisma, UserActionVoterAttestation } from '@prisma/client'

import { fakerFields } from '@/mocks/fakerUtils'

export function mockCreateUserActionVoterAttestationInput() {
  return {
    usaState: fakerFields.stateCode(),
  } satisfies Prisma.UserActionVoterAttestationCreateInput
}

export function mockUserActionVoterAttestation(): UserActionVoterAttestation {
  return {
    ...mockCreateUserActionVoterAttestationInput(),
    id: fakerFields.id(),
  }
}
