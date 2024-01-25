import { fakerFields } from '@/mocks/fakerUtils'
import { mockCommonDatetimes } from '@/mocks/mockCommonDatetimes'
import { MOCK_CURRENT_ETH_USD_EXCHANGE_RATE } from '@/utils/shared/exchangeRate'
import { faker } from '@faker-js/faker'
import { $Enums, NFTCurrency, NFTMint } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { CallYourRepresentativeSept11ThirdWebNFT, SWCShieldThirdWebNFT } from "@/utils/server/airdrop/nfts";
import NFTMintStatus = $Enums.NFTMintStatus;

export function mockNFTMint(): NFTMint {
  let index= Math.floor(Math.random() * Object.keys(NFTMintStatus).length*2);
  let status :NFTMintStatus
  if (index>=Object.keys(NFTMintStatus).length){
    status = NFTMintStatus.CLAIMED
  }else {
    status= Object.values(NFTMintStatus)[index];
  }
  let transactionHash=""
  if (status == NFTMintStatus.CLAIMED){
    transactionHash=faker.git.commitSha()
  }
  const nfts = [SWCShieldThirdWebNFT,CallYourRepresentativeSept11ThirdWebNFT]
  index=  Math.floor(Math.random() * nfts.length);
  const nft = nfts[index]

  const costAtMint = new Decimal(faker.number.float({ min: 0.01, max: 0.2, precision: 0.01 }));
  return {
    ...mockCommonDatetimes(),
    id: fakerFields.id(),
    nftSlug:nft.Slug,
    contractAddress:nft.ContractAddress,
    transactionHash:transactionHash,
    status:status,
    costAtMint: costAtMint,
    costAtMintCurrencyCode: NFTCurrency.ETH,
    costAtMintUsd: costAtMint.times(MOCK_CURRENT_ETH_USD_EXCHANGE_RATE),
  }
}
