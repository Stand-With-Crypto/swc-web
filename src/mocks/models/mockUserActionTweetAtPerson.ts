import { faker } from '@faker-js/faker'
import { Prisma, UserActionTweetAtPerson } from '@prisma/client'

import { fakerFields } from '@/mocks/fakerUtils'
import { ORDERED_SUPPORTED_COUNTRIES } from '@/utils/shared/supportedCountries'

export function mockUserActionTweetAtPersonInput() {
  return {
    recipientDtsiSlug: fakerFields.dtsiSlug(),
    tenantId: faker.helpers.arrayElement(Object.values(ORDERED_SUPPORTED_COUNTRIES)),
  } satisfies Prisma.UserActionTweetAtPersonCreateInput
}

export function mockUserActionTweetAtPerson(): UserActionTweetAtPerson {
  return {
    ...mockUserActionTweetAtPersonInput(),
    id: fakerFields.id(),
  }
}
