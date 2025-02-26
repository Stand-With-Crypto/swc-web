'use server'
import 'server-only'

import { NFTCurrency, NFTMintStatus, NFTMintType, User, UserActionType } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import * as Sentry from '@sentry/nextjs'
import { waitUntil } from '@vercel/functions'
import { BigNumber } from 'ethers'
import { nativeEnum, object, z } from 'zod'

import { getClientUser } from '@/clientModels/clientUser/clientUser'
import { getCountryCodeCookie } from '@/utils/server/getCountryCodeCookie'
import { NFT_SLUG_BACKEND_METADATA } from '@/utils/server/nft/constants'
import { prismaClient } from '@/utils/server/prismaClient'
import { throwIfRateLimited } from '@/utils/server/ratelimit/throwIfRateLimited'
import { getServerAnalytics } from '@/utils/server/serverAnalytics'
import { parseLocalUserFromCookies } from '@/utils/server/serverLocalUser'
import { getUserSessionId } from '@/utils/server/serverUserSessionId'
import { withServerActionMiddleware } from '@/utils/server/serverWrappers/withServerActionMiddleware'
import { appRouterGetThirdwebAuthUser } from '@/utils/server/thirdweb/appRouterGetThirdwebAuthUser'
import { thirdwebBaseRPCClient } from '@/utils/server/thirdweb/thirdwebRPCClients'
import { createCountryCodeValidation } from '@/utils/server/userActionValidation/checkCountryCode'
import { withValidations } from '@/utils/server/userActionValidation/withValidations'
import { fromBigNumber } from '@/utils/shared/bigNumber'
import { getCryptoToFiatConversion } from '@/utils/shared/getCryptoToFiatConversion'
import { getLogger } from '@/utils/shared/logger'
import { NFTSlug } from '@/utils/shared/nft'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'
import { UserActionNftMintCampaignName } from '@/utils/shared/userActionCampaigns'

const createActionMintNFTInputValidationSchema = object({
  campaignName: nativeEnum(UserActionNftMintCampaignName),
  transactionHash: z.string().transform(hash => hash as `0x${string}`),
})

export type CreateActionMintNFTInput = z.infer<typeof createActionMintNFTInputValidationSchema>

interface SharedDependencies {
  localUser: Awaited<ReturnType<typeof parseLocalUserFromCookies>>
  sessionId: Awaited<ReturnType<typeof getUserSessionId>>
  analytics: ReturnType<typeof getServerAnalytics>
}

const logger = getLogger(`actionCreateUserActionMintNFT`)
const contractMetadata = NFT_SLUG_BACKEND_METADATA[NFTSlug.STAND_WITH_CRYPTO_SUPPORTER]

export const actionCreateUserActionMintNFT = withServerActionMiddleware(
  'actionCreateUserActionMintNFT',
  withValidations(
    [createCountryCodeValidation(DEFAULT_SUPPORTED_COUNTRY_CODE)],
    _actionCreateUserActionMintNFT,
  ),
)

async function _actionCreateUserActionMintNFT(input: CreateActionMintNFTInput) {
  logger.info('triggered')

  const validatedInput = createActionMintNFTInputValidationSchema.safeParse(input)
  if (!validatedInput.success) {
    return {
      errors: validatedInput.error.flatten().fieldErrors,
    }
  }

  const localUser = await parseLocalUserFromCookies()
  const sessionId = await getUserSessionId()

  const authUser = await appRouterGetThirdwebAuthUser()
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

  logger.info('getting transaction')
  const transaction = await thirdwebBaseRPCClient
    .getTransaction({
      hash: validatedInput.data.transactionHash,
    })
    .catch(err => {
      Sentry.captureException(err, {
        extra: {
          transactionHash: validatedInput.data.transactionHash,
        },
        tags: { domain: 'actionCreateUserActionMintNFT' },
      })
      throw err
    })
  logger.info('got transaction', transaction)

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
  logger.info('validated transaction')

  const ethTransactionValue = fromBigNumber(BigNumber.from(transaction.value.toString()))
  await throwIfRateLimited({ context: 'authenticated' })
  await createAction({
    user,
    validatedInput: validatedInput.data,
    sharedDependencies: { sessionId, analytics },
    ethTransactionValue,
  })

  waitUntil(analytics.flush())
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

  const countryCode = await getCountryCodeCookie()
  const decimalEthTransactionValue = new Decimal(ethTransactionValue)
  await prismaClient.userAction.create({
    data: {
      user: { connect: { id: user.id } },
      actionType: UserActionType.NFT_MINT,
      campaignName: validatedInput.campaignName,
      userCryptoAddress: { connect: { id: user.primaryUserCryptoAddressId! } },
      countryCode,
      nftMint: {
        create: {
          nftSlug: NFTSlug.STAND_WITH_CRYPTO_SUPPORTER,
          mintType: NFTMintType.SWC_PURCHASED,
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

  // Also increment user's total donation USD amount.
  await prismaClient.user.update({
    where: { id: user.id },
    data: {
      totalDonationAmountUsd: {
        increment: decimalEthTransactionValue.mul(ratio),
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
