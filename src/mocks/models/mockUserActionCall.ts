import { fakerFields } from '@/mocks/fakerUtils'
import { normalizePhoneNumber } from '@/utils/shared/normalizePhoneNumber'
import { faker } from '@faker-js/faker'
import { UserActionCall } from '@prisma/client'

export function mockUserActionCall(): UserActionCall {
  return {
    id: fakerFields.id(),
    recipientPhoneNumber: normalizePhoneNumber(faker.phone.number()),
    recipientDtsiSlug: fakerFields.dtsiSlug(),
  }
}
