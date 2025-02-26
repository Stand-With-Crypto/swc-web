import { faker } from '@faker-js/faker'
import { Prisma, UserActionRsvpEvent } from '@prisma/client'

import { fakerFields } from '@/mocks/fakerUtils'

export function mockCreateUserActionRsvpEventInput() {
  return {
    eventSlug: faker.string.uuid(),
    eventState: fakerFields.stateCode(),
    shouldReceiveNotifications: false,
  } satisfies Prisma.UserActionRsvpEventCreateInput
}
export function mockUserActionRsvpEvent(): UserActionRsvpEvent {
  return {
    ...mockCreateUserActionRsvpEventInput(),
    id: fakerFields.id(),
  }
}
