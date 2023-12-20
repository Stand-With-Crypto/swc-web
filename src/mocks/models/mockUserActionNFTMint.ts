import { fakerFields } from '@/mocks/fakerUtils'
import { MOCK_CURRENT_ETH_USD_EXCHANGE_RATE } from '@/utils/shared/exchangeRate'
import { faker } from '@faker-js/faker'
import { NonFungibleTokenCurrency, UserActionNFTMint } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

export function mockUserActionNFTMint(): UserActionNFTMint {
  const costAtMint = new Decimal(faker.number.float({ min: 0.01, max: 0.2, precision: 0.01 }))
  return {
    id: fakerFields.id(),
    nftId: fakerFields.id(),
    costAtMint,
    costAtMintCurrencyCode: NonFungibleTokenCurrency.ETH,
    constAtMintUsd: costAtMint.times(MOCK_CURRENT_ETH_USD_EXCHANGE_RATE),
  }
}
