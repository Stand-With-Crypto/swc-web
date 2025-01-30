import { faker } from '@faker-js/faker'
import { Prisma, UserActionVotingDay } from '@prisma/client'

import { fakerFields } from '@/mocks/fakerUtils'
import { ORDERED_SUPPORTED_COUNTRIES } from '@/utils/shared/supportedCountries'

export function mockCreateUserActionVotingDayInput() {
  return {
    usaState: fakerFields.stateCode({ abbreviated: true }),
    votingYear: new Date().getFullYear().toString(),
    tenantId: faker.helpers.arrayElement(Object.values(ORDERED_SUPPORTED_COUNTRIES)),
  } satisfies Prisma.UserActionVotingDayCreateInput
}

export function mockUserActionVotingDay(): UserActionVotingDay {
  return {
    ...mockCreateUserActionVotingDayInput(),
    id: fakerFields.id(),
  }
}
