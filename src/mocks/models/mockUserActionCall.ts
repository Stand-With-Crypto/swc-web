import { fakerFields } from '@/mocks/fakerUtils'
import { Prisma, UserActionCall } from '@prisma/client'

export function mockCreateUserActionCallInput() {
  return {
    recipientPhoneNumber: fakerFields.phoneNumber(),
    recipientDtsiSlug: fakerFields.dtsiSlug(),
  } satisfies Omit<Prisma.UserActionCallCreateInput, 'addressId' | 'address'>
}

export function mockUserActionCall(): UserActionCall {
  return {
    id: fakerFields.id(),
    recipientPhoneNumber: fakerFields.phoneNumber(),
    recipientDtsiSlug: fakerFields.dtsiSlug(),
    addressId: fakerFields.id(),
  }
}
