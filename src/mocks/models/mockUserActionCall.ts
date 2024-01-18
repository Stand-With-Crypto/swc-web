import { fakerFields } from '@/mocks/fakerUtils'
import { normalizePhoneNumber } from '@/utils/shared/phoneNumber'
import { faker } from '@faker-js/faker'
import { UserActionCall } from '@prisma/client'

export function mockUserActionCall(): UserActionCall {
  return {
    id: fakerFields.id(),
    recipientPhoneNumber: fakerFields.phoneNumber(),
    recipientDtsiSlug: fakerFields.dtsiSlug(),
    addressId: fakerFields.id(),
  }
}
