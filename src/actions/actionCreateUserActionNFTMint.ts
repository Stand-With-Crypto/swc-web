'use server'
import 'server-only'

import { NFTCurrency, NFTMintStatus, User, UserActionType } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import * as Sentry from '@sentry/nextjs'
import { nativeEnum, object, z } from 'zod'

import { getClientUser } from '@/clientModels/clientUser/clientUser'
import { NFT_SLUG_BACKEND_METADATA } from '@/utils/server/nft/constants'
import { prismaClient } from '@/utils/server/prismaClient'
import { throwIfRateLimited } from '@/utils/server/ratelimit/throwIfRateLimited'
import { getServerAnalytics } from '@/utils/server/serverAnalytics'
import { parseLocalUserFromCookies } from '@/utils/server/serverLocalUser'
import { getUserSessionId } from '@/utils/server/serverUserSessionId'
import { appRouterGetAuthUser } from '@/utils/server/thirdweb/appRouterGetAuthUser'
import { withServerActionMiddleware } from '@/utils/server/withServerActionMiddleware'
import { getCryptoToFiatConversion } from '@/utils/shared/getCryptoToFiatConversion'
import { getLogger } from '@/utils/shared/logger'
import { NFTSlug } from '@/utils/shared/nft'
import { UserActionNftMintCampaignName } from '@/utils/shared/userActionCampaigns'

const createActionMintNFTInputValidationSchema = object({
  campaignName: nativeEnum(UserActionNftMintCampaignName),
  transactionHash: z.string(),
})

export type CreateActionMintNFTInput = z.infer<typeof createActionMintNFTInputValidationSchema>

interface SharedDependencies {
  localUser: ReturnType<typeof parseLocalUserFromCookies>
  sessionId: ReturnType<typeof getUserSessionId>
  analytics: ReturnType<typeof getServerAnalytics>
}

const logger = getLogger(`actionCreateUserActionMintNFT`)

export const actionCreateUserActionMintNFT = withServerActionMiddleware(
  'actionCreateUserActionMintNFT',
  _actionCreateUserActionMintNFT,
)

async function _actionCreateUserActionMintNFT(input: CreateActionMintNFTInput) {
  logger.info('triggered')

  const validatedInput = createActionMintNFTInputValidationSchema.safeParse(input)
  if (!validatedInput.success) {
    return {
      errors: validatedInput.error.flatten().fieldErrors,
    }
  }

  const localUser = parseLocalUserFromCookies()
  const sessionId = getUserSessionId()

  const authUser = await appRouterGetAuthUser()
  if (!authUser) {
    const error = new Error('Create User Action NFT Mint - Not authenticated')
    Sentry.captureException(error, {
      tags: { domain: 'actionCreateUserActionMintNFT' },
      extra: {
        sessionId,
      },
    })

    throw error
  }

  const user = await prismaClient.user.findFirstOrThrow({
    where: {
      id: authUser.userId,
    },
    include: {
      primaryUserCryptoAddress: true,
      address: true,
    },
  })

  const analytics = getServerAnalytics({
    userId: user.id,
    localUser,
  })

  /**
   * LATER-TASK validate that:
   * - the transaction is valid
   * - the transaction hash is not already in the database (create a new field to store the hash if necessary)
   * - the transaction is related to the Shield NFT contract
   *
   * If any of there conditions fail, return an error
   */

  await throwIfRateLimited({ context: 'authenticated' })
  await createAction({
    user,
    validatedInput: validatedInput.data,
    sharedDependencies: { sessionId, analytics },
  })

  return { user: getClientUser(user) }
}

async function createAction<U extends User>({
  user,
  validatedInput,
  sharedDependencies,
}: {
  user: U
  validatedInput: z.infer<typeof createActionMintNFTInputValidationSchema>
  sharedDependencies: Pick<SharedDependencies, 'sessionId' | 'analytics'>
}) {
  const ratio = await getCryptoToFiatConversion(NFTCurrency.ETH)
    .then(res => {
      return res?.data.amount ? res?.data.amount : new Decimal(0)
    })
    .catch(e => {
      logger.error(e)
      return new Decimal(0)
    })

  await prismaClient.userAction.create({
    data: {
      user: { connect: { id: user.id } },
      actionType: UserActionType.NFT_MINT,
      campaignName: validatedInput.campaignName,
      userCryptoAddress: { connect: { id: user.primaryUserCryptoAddressId! } },
      nftMint: {
        create: {
          nftSlug: NFTSlug.SWC_SHIELD,
          // LATER-TASK get data from the related transaction
          status: NFTMintStatus.CLAIMED,
          costAtMint: 0.00435,
          contractAddress: NFT_SLUG_BACKEND_METADATA[NFTSlug.SWC_SHIELD].contractAddress,
          costAtMintCurrencyCode: NFTCurrency.ETH,
          costAtMintUsd: new Decimal(0.00435).mul(ratio),
        },
      },
    },
  })

  logger.info('created user action')

  sharedDependencies.analytics.trackUserActionCreated({
    actionType: UserActionType.NFT_MINT,
    campaignName: validatedInput.campaignName,
    userState: 'Existing',
  })
}
