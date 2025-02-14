import { faker } from '@faker-js/faker'
import { Prisma, UserActionPoll } from '@prisma/client'

import { fakerFields } from '@/mocks/fakerUtils'
import { ORDERED_SUPPORTED_COUNTRIES } from '@/utils/shared/supportedCountries'

export function mockCreateUserActionPollInput() {
  return {
    tenantId: faker.helpers.arrayElement(Object.values(ORDERED_SUPPORTED_COUNTRIES)),
  } satisfies Omit<Prisma.UserActionPollCreateInput, 'userActionId'>
}

export function mockUserActionPoll(): UserActionPoll {
  return {
    ...mockCreateUserActionPollInput(),
    id: fakerFields.id(),
  }
}
