import { NFTCurrency, NFTMintStatus, UserActionOptInType, UserActionType } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

import { runBin } from '@/bin/runBin'
import { parseThirdwebAddress } from '@/hooks/useThirdwebAddress/parseThirdwebAddress'
import { AIRDROP_NFT_INNGEST_EVENT_NAME } from '@/inngest/functions/airdropNFT/airdropNFT'
import { inngest } from '@/inngest/inngest'
import { NFT_SLUG_BACKEND_METADATA } from '@/utils/server/nft/constants'
import { prismaClient } from '@/utils/server/prismaClient'
import { NFTSlug } from '@/utils/shared/nft'
import { requiredEnv } from '@/utils/shared/requiredEnv'
import { UserActionOptInCampaignName } from '@/utils/shared/userActionCampaigns'

const LOCAL_USER_CRYPTO_ADDRESS = parseThirdwebAddress(
  requiredEnv(process.env.LOCAL_USER_CRYPTO_ADDRESS, 'LOCAL_USER_CRYPTO_ADDRESS'),
)

/*
Run this script only after you have the app running on localhost:3000
*/
async function smokeTestAirdropNFTWithInngest() {
  const user = await prismaClient.user.findFirstOrThrow({
    where: { primaryUserCryptoAddress: { cryptoAddress: LOCAL_USER_CRYPTO_ADDRESS } },
  })

  const action = await prismaClient.userAction.create({
    data: {
      user: { connect: { id: user.id } },
      nftMint: {
        create: {
          nftSlug: NFTSlug.SWC_SHIELD,
          status: NFTMintStatus.REQUESTED,
          costAtMint: 0.0,
          contractAddress: NFT_SLUG_BACKEND_METADATA[NFTSlug.SWC_SHIELD].contractAddress,
          costAtMintCurrencyCode: NFTCurrency.ETH,
          costAtMintUsd: new Decimal(0),
        },
      },
      actionType: UserActionType.OPT_IN,
      campaignName: UserActionOptInCampaignName.DEFAULT,
      userActionOptIn: {
        create: {
          optInType: UserActionOptInType.SWC_SIGN_UP_AS_SUBSCRIBER,
        },
      },
    },
  })

  await inngest.send({
    name: AIRDROP_NFT_INNGEST_EVENT_NAME,
    data: {
      nftMintId: action.nftMintId!,
      nftSlug: NFTSlug.SWC_SHIELD,
      recipientWalletAddress: LOCAL_USER_CRYPTO_ADDRESS,
      userId: user.id,
    },
  })
}

void runBin(smokeTestAirdropNFTWithInngest)
