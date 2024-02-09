import { fakerFields } from '@/mocks/fakerUtils'
import { Prisma, UserActionCall } from '@prisma/client'

export function mockCreateUserActionCallInput() {
  return {
    recipientDtsiSlug: fakerFields.dtsiSlug(),
    recipientPhoneNumber: fakerFields.phoneNumber(),
  } satisfies Omit<Prisma.UserActionCallCreateInput, 'addressId' | 'address'>
}

export function mockUserActionCall(): UserActionCall {
  return {
    addressId: fakerFields.id(),
    id: fakerFields.id(),
    recipientDtsiSlug: fakerFields.dtsiSlug(),
    recipientPhoneNumber: fakerFields.phoneNumber(),
  }
}
