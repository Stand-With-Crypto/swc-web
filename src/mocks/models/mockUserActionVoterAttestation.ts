import { faker } from '@faker-js/faker'
import { Prisma, UserActionVoterAttestation } from '@prisma/client'

import { fakerFields } from '@/mocks/fakerUtils'
import { ORDERED_SUPPORTED_COUNTRIES } from '@/utils/shared/supportedCountries'

export function mockCreateUserActionVoterAttestationInput() {
  return {
    usaState: fakerFields.stateCode(),
    tenantId: faker.helpers.arrayElement(Object.values(ORDERED_SUPPORTED_COUNTRIES)),
  } satisfies Prisma.UserActionVoterAttestationCreateInput
}

export function mockUserActionVoterAttestation(): UserActionVoterAttestation {
  return {
    ...mockCreateUserActionVoterAttestationInput(),
    id: fakerFields.id(),
  }
}
