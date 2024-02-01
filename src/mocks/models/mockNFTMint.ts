import { fakerFields } from '@/mocks/fakerUtils'
import { mockCommonDatetimes } from '@/mocks/mockCommonDatetimes'
import { NFT_CONTRACT_ADDRESS } from '@/utils/server/nft/contractAddress'
import { MOCK_CURRENT_ETH_USD_EXCHANGE_RATE } from '@/utils/shared/exchangeRate'
import { NFTSlug } from '@/utils/shared/nft'
import { faker } from '@faker-js/faker'
import { NFTCurrency, NFTMint, NFTMintStatus } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

export function mockNFTMint(): NFTMint {
  const status = faker.helpers.arrayElement(Object.values(NFTMintStatus))
  const transactionHash = status === NFTMintStatus.CLAIMED ? faker.git.commitSha() : ''
  const nftSlug = faker.helpers.arrayElement(Object.values(NFTSlug))
  const costAtMint = new Decimal(faker.number.float({ min: 0.01, max: 0.2, precision: 0.01 }))
  return {
    ...mockCommonDatetimes(),
    id: fakerFields.id(),
    nftSlug,
    contractAddress: NFT_CONTRACT_ADDRESS[nftSlug],
    transactionHash,
    status: status,
    costAtMint: costAtMint,
    costAtMintCurrencyCode: NFTCurrency.ETH,
    costAtMintUsd: costAtMint.times(MOCK_CURRENT_ETH_USD_EXCHANGE_RATE),
  }
}
