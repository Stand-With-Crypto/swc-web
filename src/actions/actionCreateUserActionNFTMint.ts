'use server'
import 'server-only'

import { NFTCurrency, NFTMintStatus, User, UserActionType } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import * as Sentry from '@sentry/nextjs'
import { BigNumber } from 'ethers'
import { nativeEnum, object, z } from 'zod'

import { getClientUser } from '@/clientModels/clientUser/clientUser'
import { NFT_SLUG_BACKEND_METADATA } from '@/utils/server/nft/constants'
import { prismaClient } from '@/utils/server/prismaClient'
import { throwIfRateLimited } from '@/utils/server/ratelimit/throwIfRateLimited'
import { getServerAnalytics } from '@/utils/server/serverAnalytics'
import { parseLocalUserFromCookies } from '@/utils/server/serverLocalUser'
import { getUserSessionId } from '@/utils/server/serverUserSessionId'
import { appRouterGetAuthUser } from '@/utils/server/thirdweb/appRouterGetAuthUser'
import { thirdwebBaseRPCClient } from '@/utils/server/thirdweb/thirdwebRPCClient'
import { withServerActionMiddleware } from '@/utils/server/withServerActionMiddleware'
import { fromBigNumber } from '@/utils/shared/bigNumber'
import { getCryptoToFiatConversion } from '@/utils/shared/getCryptoToFiatConversion'
import { getLogger } from '@/utils/shared/logger'
import { NFTSlug } from '@/utils/shared/nft'
import { UserActionNftMintCampaignName } from '@/utils/shared/userActionCampaigns'

const createActionMintNFTInputValidationSchema = object({
  campaignName: nativeEnum(UserActionNftMintCampaignName),
  transactionHash: z.string().transform(hash => hash as `0x${string}`),
})

export type CreateActionMintNFTInput = z.infer<typeof createActionMintNFTInputValidationSchema>

interface SharedDependencies {
  localUser: ReturnType<typeof parseLocalUserFromCookies>
  sessionId: ReturnType<typeof getUserSessionId>
  analytics: ReturnType<typeof getServerAnalytics>
}

const logger = getLogger(`actionCreateUserActionMintNFT`)
const contractMetadata = NFT_SLUG_BACKEND_METADATA[NFTSlug.STAND_WITH_CRYPTO_SUPPORTER]

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

  const transaction = await thirdwebBaseRPCClient.getTransaction({
    hash: validatedInput.data.transactionHash,
  })

  await validateTransaction(transaction).catch(err => {
    Sentry.captureException(err, {
      extra: {
        transactionHash: validatedInput.data.transactionHash,
        transactionTo: transaction.to,
        expectedTo: contractMetadata.contractAddress,
        transactionFrom: transaction.from,
        expectedFrom: contractMetadata.associatedWallet,
      },
      tags: { domain: 'validateTransaction' },
    })
    throw new Error('Invalid transaction')
  })

  const ethTransactionValue = fromBigNumber(BigNumber.from(transaction.value.toString()))
  await throwIfRateLimited({ context: 'authenticated' })
  await createAction({
    user,
    validatedInput: validatedInput.data,
    sharedDependencies: { sessionId, analytics },
    ethTransactionValue,
  })

  await analytics.flush()
  return { user: getClientUser(user) }
}

async function createAction<U extends User>({
  user,
  validatedInput,
  sharedDependencies,
  ethTransactionValue,
}: {
  user: U
  validatedInput: z.infer<typeof createActionMintNFTInputValidationSchema>
  sharedDependencies: Pick<SharedDependencies, 'sessionId' | 'analytics'>
  ethTransactionValue: string
}) {
  const ratio = await getCryptoToFiatConversion(NFTCurrency.ETH)
    .then(res => {
      return res?.data.amount ? res?.data.amount : new Decimal(0)
    })
    .catch(e => {
      logger.error(e)
      return new Decimal(0)
    })

  const decimalEthTransactionValue = new Decimal(ethTransactionValue)
  await prismaClient.userAction.create({
    data: {
      user: { connect: { id: user.id } },
      actionType: UserActionType.NFT_MINT,
      campaignName: validatedInput.campaignName,
      userCryptoAddress: { connect: { id: user.primaryUserCryptoAddressId! } },
      nftMint: {
        create: {
          nftSlug: NFTSlug.SWC_SHIELD,
          status: NFTMintStatus.CLAIMED,
          costAtMint: decimalEthTransactionValue,
          contractAddress: contractMetadata.contractAddress,
          costAtMintCurrencyCode: NFTCurrency.ETH,
          costAtMintUsd: decimalEthTransactionValue.mul(ratio),
          transactionHash: validatedInput.transactionHash,
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

const parseHex = (hex: string) => hex.toLowerCase().trim()

async function validateTransaction(
  transaction: Awaited<ReturnType<typeof thirdwebBaseRPCClient.getTransaction>>,
) {
  if (parseHex(transaction.from) !== parseHex(contractMetadata.associatedWallet)) {
    throw new Error('Invalid transaction origin wallet')
  }

  if (!transaction.to || parseHex(transaction.to) !== parseHex(contractMetadata.contractAddress)) {
    throw new Error('Invalid associated contract')
  }

  const registeredTransaction = await prismaClient.nFTMint.findFirst({
    where: { transactionHash: transaction.hash },
  })
  if (registeredTransaction) {
    throw new Error('Transaction already registered')
  }

  const confirmations = await thirdwebBaseRPCClient.getTransactionConfirmations({
    hash: transaction.hash,
  })
  if (!Number(confirmations)) {
    throw new Error('Transaction not processed yet')
  }
}
