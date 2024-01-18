import { fakerFields } from '@/mocks/fakerUtils'
import { UserActionCall } from '@prisma/client'

export function mockUserActionCall(): UserActionCall {
  return {
    id: fakerFields.id(),
    recipientPhoneNumber: fakerFields.phoneNumber(),
    recipientDtsiSlug: fakerFields.dtsiSlug(),
    addressId: fakerFields.id(),
  }
}
