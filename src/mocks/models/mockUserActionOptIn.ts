import { fakerFields } from '@/mocks/fakerUtils'
import { mockCommonDatetimes } from '@/mocks/mockCommonDatetimes'
import { SupportedFiatCurrencyCodes } from '@/utils/shared/currency'
import { faker } from '@faker-js/faker'
import { UserActionOptIn, UserActionOptInType } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

export function mockUserActionOptIn(): UserActionOptIn {
  return {
    id: fakerFields.id(),
    optInType: faker.helpers.arrayElement(Object.values(UserActionOptInType)),
  }
}
