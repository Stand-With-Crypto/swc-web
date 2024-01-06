import { fakerFields } from '@/mocks/fakerUtils'
import { mockCommonDatetimes } from '@/mocks/mockCommonDatetimes'
import { faker } from '@faker-js/faker'
import { Address } from '@prisma/client'

export function mockAddress(): Address {
  const fields = {
    ...mockCommonDatetimes(),
    id: fakerFields.id(),
    googlePlaceId: faker.string.uuid(),
    streetNumber: faker.location.buildingNumber(),
    route: faker.location.street(),
    subpremise: faker.location.secondaryAddress(),
    locality: faker.location.city(),
    administrativeAreaLevel1: faker.location.state(),
    administrativeAreaLevel2: '',
    postalCode: faker.location.zipCode(),
    postalCodeSuffix: '',
    countryCode: faker.location.countryCode(),
  } satisfies Partial<Address>
  return {
    ...fields,
    formattedDescription: `${fields.streetNumber} ${fields.route}, ${fields.subpremise}, ${fields.locality} ${fields.administrativeAreaLevel1}, ${fields.postalCode} ${fields.countryCode}`,
  }
}
