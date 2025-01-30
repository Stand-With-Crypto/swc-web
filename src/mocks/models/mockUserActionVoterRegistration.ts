import { faker } from '@faker-js/faker'
import { Prisma, UserActionVoterRegistration } from '@prisma/client'

import { fakerFields } from '@/mocks/fakerUtils'
import { ORDERED_SUPPORTED_COUNTRIES } from '@/utils/shared/supportedCountries'

export function mockCreateUserActionVoterRegistrationInput() {
  return {
    usaState: fakerFields.stateCode(),
    tenantId: faker.helpers.arrayElement(Object.values(ORDERED_SUPPORTED_COUNTRIES)),
  } satisfies Prisma.UserActionVoterRegistrationCreateInput
}

export function mockUserActionVoterRegistration(): UserActionVoterRegistration {
  return {
    ...mockCreateUserActionVoterRegistrationInput(),
    id: fakerFields.id(),
  }
}
