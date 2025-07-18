import { Prisma, UserActionViewKeyRaces } from '@prisma/client'

import { fakerFields } from '@/mocks/fakerUtils'

export function mockCreateUserActionViewKeyRacesInput() {
  return {
    usaState: fakerFields.stateCode({ abbreviated: true }),
    usCongressionalDistrict: fakerFields.electoralZone(),
    electoralZone: fakerFields.electoralZone(),
    stateCode: fakerFields.stateCode({ abbreviated: true }),
    constituency: fakerFields.electoralZone(),
  } satisfies Prisma.UserActionViewKeyRacesCreateInput
}

export function mockUserActionViewKeyRaces(): UserActionViewKeyRaces {
  return {
    ...mockCreateUserActionViewKeyRacesInput(),
    id: fakerFields.id(),
  }
}
