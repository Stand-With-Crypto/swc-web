import { fakerFields } from '@/mocks/fakerUtils'
import { mockCommonDatetimes } from '@/mocks/mockCommonDatetimes'
import { faker } from '@faker-js/faker'
import { NonFungibleToken, NonFungibleTokenCurrency } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

export function mockNonFungibleToken(): NonFungibleToken {
  return {
    ...mockCommonDatetimes(),
    id: fakerFields.id(),
    name: faker.internet.userName(),
    cost: new Decimal(faker.number.float({ min: 0.01, max: 0.2, precision: 0.01 })),
    costCurrencyCode: NonFungibleTokenCurrency.ETH,
  }
}
