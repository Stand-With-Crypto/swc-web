import { fakerFields } from '@/mocks/fakerUtils'
import { mockCommonDatetimes } from '@/mocks/mockCommonDatetimes'
import { MOCK_CURRENT_ETH_USD_EXCHANGE_RATE } from '@/utils/shared/exchangeRate'
import { faker } from '@faker-js/faker'
import { NFTCurrency, NFTMint } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

export function mockNFTMint(): NFTMint {
  const costAtMint = new Decimal(faker.number.float({ min: 0.01, max: 0.2, precision: 0.01 }))
  return {
    ...mockCommonDatetimes(),
    id: fakerFields.id(),
    nftId: fakerFields.id(),
    costAtMint,
    costAtMintCurrencyCode: NFTCurrency.ETH,
    constAtMintUsd: costAtMint.times(MOCK_CURRENT_ETH_USD_EXCHANGE_RATE),
  }
}
