import { faker } from '@faker-js/faker'
import { Prisma, UserActionOptIn, UserActionOptInType } from '@prisma/client'

import { fakerFields } from '@/mocks/fakerUtils'
import { ORDERED_SUPPORTED_COUNTRIES } from '@/utils/shared/supportedCountries'

export function mockCreateUserActionOptInInput() {
  return {
    optInType: faker.helpers.arrayElement(Object.values(UserActionOptInType)),
    tenantId: faker.helpers.arrayElement(Object.values(ORDERED_SUPPORTED_COUNTRIES)),
  } satisfies Prisma.UserActionOptInCreateInput
}

export function mockUserActionOptIn(): UserActionOptIn {
  return {
    ...mockCreateUserActionOptInInput(),
    id: fakerFields.id(),
  }
}
