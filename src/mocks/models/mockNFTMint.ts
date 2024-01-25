import { fakerFields } from '@/mocks/fakerUtils'
import { mockCommonDatetimes } from '@/mocks/mockCommonDatetimes'
import { MOCK_CURRENT_ETH_USD_EXCHANGE_RATE } from '@/utils/shared/exchangeRate'
import { faker } from '@faker-js/faker'
import { $Enums, NFTCurrency, NFTMint } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import {
  CallYourRepresentativeSept11ThirdWebNFT,
  SWCShieldThirdWebNFT,
} from '@/utils/server/airdrop/nfts'
import NFTMintStatus = $Enums.NFTMintStatus

export function mockNFTMint(): NFTMint {
  const status = faker.helpers.arrayElement(Object.values(NFTMintStatus))
  const transactionHash = status === NFTMintStatus.CLAIMED ? faker.git.commitSha() : ''
  const nft = faker.helpers.arrayElement([SWCShieldThirdWebNFT, CallYourRepresentativeSept11ThirdWebNFT])
  const costAtMint = new Decimal(faker.number.float({ min: 0.01, max: 0.2, precision: 0.01 }))
  return {
    ...mockCommonDatetimes(),
    id: fakerFields.id(),
    nftSlug: nft.slug,
    contractAddress: nft.contractAddress,
    transactionHash,
    status: status,
    costAtMint: costAtMint,
    costAtMintCurrencyCode: NFTCurrency.ETH,
    costAtMintUsd: costAtMint.times(MOCK_CURRENT_ETH_USD_EXCHANGE_RATE),
  }
}
