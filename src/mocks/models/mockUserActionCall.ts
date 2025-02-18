import { faker } from '@faker-js/faker'
import { Prisma, UserActionCall } from '@prisma/client'

import { fakerFields } from '@/mocks/fakerUtils'
import { ORDERED_SUPPORTED_COUNTRIES } from '@/utils/shared/supportedCountries'

export function mockCreateUserActionCallInput() {
  return {
    recipientPhoneNumber: fakerFields.phoneNumber(),
    recipientDtsiSlug: fakerFields.dtsiSlug(),
    tenantId: faker.helpers.arrayElement(Object.values(ORDERED_SUPPORTED_COUNTRIES)),
  } satisfies Omit<Prisma.UserActionCallCreateInput, 'addressId' | 'address'>
}

export function mockUserActionCall(): UserActionCall {
  return {
    id: fakerFields.id(),
    recipientPhoneNumber: fakerFields.phoneNumber(),
    recipientDtsiSlug: fakerFields.dtsiSlug(),
    addressId: fakerFields.id(),
    tenantId: faker.helpers.arrayElement(Object.values(ORDERED_SUPPORTED_COUNTRIES)),
  }
}
