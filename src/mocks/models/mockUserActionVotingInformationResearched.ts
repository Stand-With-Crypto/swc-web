import { faker } from '@faker-js/faker'
import { Prisma, UserActionVotingInformationResearched } from '@prisma/client'

import { fakerFields } from '@/mocks/fakerUtils'
import { ORDERED_SUPPORTED_COUNTRIES } from '@/utils/shared/supportedCountries'

export function mockCreateUserActionVotingInformationResearchedInput() {
  return {
    shouldReceiveNotifications: false,
    tenantId: faker.helpers.arrayElement(Object.values(ORDERED_SUPPORTED_COUNTRIES)),
  } satisfies Prisma.UserActionVotingInformationResearchedCreateInput
}

export function mockUserActionVotingInformationResearched(): UserActionVotingInformationResearched {
  return {
    ...mockCreateUserActionVotingInformationResearchedInput(),
    id: fakerFields.id(),
    addressId: fakerFields.id(),
  }
}
