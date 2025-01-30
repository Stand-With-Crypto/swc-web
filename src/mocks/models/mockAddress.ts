import { faker } from '@faker-js/faker'
import { Address, Prisma } from '@prisma/client'

import { fakerFields } from '@/mocks/fakerUtils'
import { mockCommonDatetimes } from '@/mocks/mockCommonDatetimes'
import { ORDERED_SUPPORTED_COUNTRIES } from '@/utils/shared/supportedCountries'

export function mockCreateAddressInput() {
  const countryCode = faker.helpers.arrayElement(Object.values(ORDERED_SUPPORTED_COUNTRIES))

  const partial = {
    googlePlaceId: null,
    streetNumber: faker.location.buildingNumber(),
    route: faker.location.street(),
    subpremise: faker.location.secondaryAddress(),
    locality: faker.location.city(),
    administrativeAreaLevel1: faker.location.state({ abbreviated: true }),
    administrativeAreaLevel2: '',
    postalCode: faker.location.zipCode(),
    postalCodeSuffix: '',
    countryCode: countryCode,
    usCongressionalDistrict: '12',
    tenantId: countryCode,
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
