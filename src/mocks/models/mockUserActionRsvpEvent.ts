import { faker } from '@faker-js/faker'
import { Prisma, UserActionRsvpEvent } from '@prisma/client'

import { fakerFields } from '@/mocks/fakerUtils'
import { ORDERED_SUPPORTED_COUNTRIES } from '@/utils/shared/supportedCountries'

export function mockCreateUserActionRsvpEventInput() {
  return {
    eventSlug: faker.string.uuid(),
    eventState: fakerFields.stateCode(),
    shouldReceiveNotifications: false,
    tenantId: faker.helpers.arrayElement(Object.values(ORDERED_SUPPORTED_COUNTRIES)),
  } satisfies Prisma.UserActionRsvpEventCreateInput
}
export function mockUserActionRsvpEvent(): UserActionRsvpEvent {
  return {
    ...mockCreateUserActionRsvpEventInput(),
    id: fakerFields.id(),
  }
}
