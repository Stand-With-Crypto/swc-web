import { faker } from '@faker-js/faker'
import { Prisma, UserActionViewKeyRaces } from '@prisma/client'

import { fakerFields } from '@/mocks/fakerUtils'
import { ORDERED_SUPPORTED_COUNTRIES } from '@/utils/shared/supportedCountries'

export function mockCreateUserActionViewKeyRacesInput() {
  return {
    usaState: fakerFields.stateCode({ abbreviated: true }),
    usCongressionalDistrict: fakerFields.usCongressionalDistrict(),
    tenantId: faker.helpers.arrayElement(Object.values(ORDERED_SUPPORTED_COUNTRIES)),
  } satisfies Prisma.UserActionViewKeyRacesCreateInput
}

export function mockUserActionViewKeyRaces(): UserActionViewKeyRaces {
  return {
    ...mockCreateUserActionViewKeyRacesInput(),
    id: fakerFields.id(),
  }
}
