import { fakerFields } from '@/mocks/fakerUtils'
import { mockCommonDatetimes } from '@/mocks/mockCommonDatetimes'
import { NFT_CONTRACT_ADDRESS } from '@/utils/server/nft/contractAddress'
import { MOCK_CURRENT_ETH_USD_EXCHANGE_RATE } from '@/utils/shared/exchangeRate'
import { NFTSlug } from '@/utils/shared/nft'
import { faker } from '@faker-js/faker'
import { NFTCurrency, NFTMint, NFTMintStatus, Prisma } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

export function mockCreateNFTMintInput() {
  const status = faker.helpers.arrayElement(Object.values(NFTMintStatus))
  const transactionHash = status === NFTMintStatus.CLAIMED ? faker.git.commitSha() : ''
  const nftSlug = faker.helpers.arrayElement(Object.values(NFTSlug))
  const costAtMint = new Decimal(faker.number.float({ max: 0.2, min: 0.01, precision: 0.01 }))
  return {
    contractAddress: NFT_CONTRACT_ADDRESS[nftSlug],
    costAtMint: costAtMint,
    costAtMintCurrencyCode: NFTCurrency.ETH,
    costAtMintUsd: costAtMint.times(MOCK_CURRENT_ETH_USD_EXCHANGE_RATE),
    nftSlug,
    status: status,
    transactionHash,
  } satisfies Prisma.NFTMintCreateInput
}
export function mockNFTMint(): NFTMint {
  return {
    ...mockCreateNFTMintInput(),
    ...mockCommonDatetimes(),
    id: fakerFields.id(),
  }
}
