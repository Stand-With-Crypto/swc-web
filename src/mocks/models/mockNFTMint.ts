import { faker } from '@faker-js/faker'
import { NFTCurrency, NFTMint, NFTMintStatus, NFTMintType, Prisma } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

import { fakerFields } from '@/mocks/fakerUtils'
import { mockCommonDatetimes } from '@/mocks/mockCommonDatetimes'
import { NFT_SLUG_BACKEND_METADATA } from '@/utils/server/nft/constants'
import { MOCK_CURRENT_ETH_USD_EXCHANGE_RATE } from '@/utils/shared/exchangeRate'
import { NFTSlug } from '@/utils/shared/nft'
import { ORDERED_SUPPORTED_COUNTRIES } from '@/utils/shared/supportedCountries'

export function mockCreateNFTMintInput() {
  const status = faker.helpers.arrayElement(Object.values(NFTMintStatus))
  const transactionHash = status === NFTMintStatus.CLAIMED ? faker.git.commitSha() : ''
  const nftSlug = faker.helpers.arrayElement(Object.values(NFTSlug))
  const costAtMint =
    (nftSlug === NFTSlug.STAND_WITH_CRYPTO_LEGACY ||
      nftSlug === NFTSlug.STAND_WITH_CRYPTO_SUPPORTER) &&
    status === NFTMintStatus.CLAIMED
      ? new Decimal(faker.number.float({ min: 0.01, max: 0.2, multipleOf: 0.01 }))
      : new Decimal(0)
  const mintType =
    nftSlug === NFTSlug.STAND_WITH_CRYPTO_LEGACY || nftSlug === NFTSlug.STAND_WITH_CRYPTO_SUPPORTER
      ? NFTMintType.SWC_PURCHASED
      : NFTMintType.SWC_AIRDROPPED
  return {
    nftSlug,
    mintType,
    transactionHash,
    status: status,
    costAtMint: costAtMint,
    costAtMintCurrencyCode: NFTCurrency.ETH,
    contractAddress: NFT_SLUG_BACKEND_METADATA[nftSlug].contractAddress,
    costAtMintUsd: costAtMint.times(MOCK_CURRENT_ETH_USD_EXCHANGE_RATE),
    tenantId: faker.helpers.arrayElement(Object.values(ORDERED_SUPPORTED_COUNTRIES)),
  } satisfies Prisma.NFTMintCreateInput
}
export function mockNFTMint(): NFTMint {
  return {
    ...mockCreateNFTMintInput(),
    ...mockCommonDatetimes(),
    id: fakerFields.id(),
  }
}
