import { fakerFields } from '@/mocks/fakerUtils'
import { mockCommonDatetimes } from '@/mocks/mockCommonDatetimes'
import { faker } from '@faker-js/faker'
import { Address, Prisma } from '@prisma/client'

export function mockCreateAddressInput() {
  const partial = {
    administrativeAreaLevel1: faker.location.state(),
    administrativeAreaLevel2: '',
    countryCode: faker.location.countryCode(),
    googlePlaceId: faker.string.uuid(),
    locality: faker.location.city(),
    postalCode: faker.location.zipCode(),
    postalCodeSuffix: '',
    route: faker.location.street(),
    streetNumber: faker.location.buildingNumber(),
    subpremise: faker.location.secondaryAddress(),
  } satisfies Partial<Prisma.AddressCreateInput>
  return {
    ...partial,
    formattedDescription: `${partial.streetNumber} ${partial.route}, ${partial.subpremise}, ${partial.locality} ${partial.administrativeAreaLevel1}, ${partial.postalCode} ${partial.countryCode}`,
  } satisfies Prisma.AddressCreateInput
}
export function mockAddress(): Address {
  return {
    ...mockCreateAddressInput(),
    ...mockCommonDatetimes(),
    id: fakerFields.id(),
  }
}
