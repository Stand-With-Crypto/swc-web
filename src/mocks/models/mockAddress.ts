import { faker } from '@faker-js/faker'
import { Address, Prisma } from '@prisma/client'

import { fakerFields } from '@/mocks/fakerUtils'
import { mockCommonDatetimes } from '@/mocks/mockCommonDatetimes'
import { ORDERED_SUPPORTED_COUNTRIES } from '@/utils/shared/supportedCountries'
import { US_STATE_CODE_TO_DISTRICT_COUNT_MAP } from '@/utils/shared/usStateDistrictUtils'
import { USStateCode } from '@/utils/shared/usStateUtils'

const getDistrict = (stateCode: USStateCode) => {
  const stateDistrictCount = US_STATE_CODE_TO_DISTRICT_COUNT_MAP[stateCode]

  if (stateDistrictCount === 0) {
    return null
  }

  // Faker number.int throws when there are no integers between min and max
  if (stateDistrictCount === 1) {
    return '1'
  }

  return faker.number.int({ min: 1, max: stateDistrictCount }).toString()
}

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
    countryCode: countryCode.toUpperCase(),
    usCongressionalDistrict: '12',
    tenantId: countryCode,
  } satisfies Partial<Prisma.AddressCreateInput>
  return {
    ...partial,
    formattedDescription: `${partial.streetNumber} ${partial.route}, ${partial.subpremise}, ${partial.locality} ${partial.administrativeAreaLevel1}, ${partial.postalCode} ${partial.countryCode}`,
  } satisfies Prisma.AddressCreateInput
}

export function mockCreateAddressInputWithDC() {
  const countryCode = faker.helpers.arrayElement(Object.values(ORDERED_SUPPORTED_COUNTRIES))

  const stateCode =
    faker.helpers.maybe(() => 'DC', { probability: 0.05 }) ||
    faker.location.state({ abbreviated: true })
  const district = getDistrict(stateCode as USStateCode)

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
    countryCode: countryCode.toUpperCase(),
    usCongressionalDistrict: district,
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
