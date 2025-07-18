'use server'
import 'server-only'

import { Prisma, User, UserActionType } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import { waitUntil } from '@vercel/functions'
import { nativeEnum, object, z } from 'zod'

import { getClientUser } from '@/clientModels/clientUser/clientUser'
import { getUserAccessLocationCookie } from '@/utils/server/getUserAccessLocationCookie'
import { claimNFTAndSendEmailNotification } from '@/utils/server/nft/claimNFT'
import { prismaClient } from '@/utils/server/prismaClient'
import { getRequestRateLimiter } from '@/utils/server/ratelimit/throwIfRateLimited'
import { getServerAnalytics, getServerPeopleAnalytics } from '@/utils/server/serverAnalytics'
import { parseLocalUserFromCookies } from '@/utils/server/serverLocalUser'
import { getUserSessionId } from '@/utils/server/serverUserSessionId'
import { withServerActionMiddleware } from '@/utils/server/serverWrappers/withServerActionMiddleware'
import { appRouterGetThirdwebAuthUser } from '@/utils/server/thirdweb/appRouterGetThirdwebAuthUser'
import { createCountryCodeValidation } from '@/utils/server/userActionValidation/checkCountryCode'
import { withValidations } from '@/utils/server/userActionValidation/withValidations'
import { getLogger } from '@/utils/shared/logger'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'
import { USUserActionClaimNftCampaignName } from '@/utils/shared/userActionCampaigns/us/usUserActionCampaigns'

const getCreateActionClaimNFTInputValidationSchema = () =>
  object({
    campaignName: nativeEnum(USUserActionClaimNftCampaignName),
  })

export type CreateActionClaimNFTInput = z.infer<
  ReturnType<typeof getCreateActionClaimNFTInputValidationSchema>
>

const logger = getLogger(`actionCreateUserActionClaimNFT`)

export const actionCreateUserActionClaimNFT = withServerActionMiddleware(
  'actionCreateUserActionClaimNFT',
  withValidations(
    [createCountryCodeValidation(DEFAULT_SUPPORTED_COUNTRY_CODE)],
    _actionCreateUserActionClaimNFT,
  ),
)

async function _actionCreateUserActionClaimNFT(input: CreateActionClaimNFTInput) {
  logger.info('triggered')
  const { triggerRateLimiterAtMostOnce } = getRequestRateLimiter({
    context: 'authenticated',
  })

  const countryCode = await getUserAccessLocationCookie()

  const validatedInput = getCreateActionClaimNFTInputValidationSchema().safeParse(input)
  if (!validatedInput.success) {
    return {
      errors: validatedInput.error.flatten().fieldErrors,
    }
  }

  const localUser = await parseLocalUserFromCookies()
  const sessionId = await getUserSessionId()

  const authUser = await appRouterGetThirdwebAuthUser()
  if (!authUser) {
    const error = new Error('Create User Action Claim NFT - Not authenticated')
    Sentry.captureException(error, {
      tags: { domain: 'actionCreateUserActionClaimNFT' },
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

  const peopleAnalytics = getServerPeopleAnalytics({
    localUser,
    userId: user.id,
  })
  const analytics = getServerAnalytics({
    userId: user.id,
    localUser,
  })
  const beforeFinish = () => Promise.all([analytics.flush(), peopleAnalytics.flush()])

  const recentUserAction = await getRecentUserActionByUserId(user.id, validatedInput)
  if (recentUserAction) {
    logSpamActionSubmissions({
      validatedInput,
      analytics,
    })
    waitUntil(beforeFinish())
    return { user: getClientUser(user) }
  }

  await triggerRateLimiterAtMostOnce()
  const { userAction } = await createAction({
    user,
    validatedInput: validatedInput.data,
    analytics,
    countryCode,
  })

  if (user.primaryUserCryptoAddress !== null) {
    await claimNFTAndSendEmailNotification({
      userAction,
      userCryptoAddress: user.primaryUserCryptoAddress,
      countryCode,
    })
  }

  waitUntil(beforeFinish())
  return { user: getClientUser(user) }
}

async function getRecentUserActionByUserId(
  userId: User['id'],
  validatedInput: z.SafeParseSuccess<CreateActionClaimNFTInput>,
) {
  return prismaClient.userAction.findFirst({
    where: {
      actionType: UserActionType.CLAIM_NFT,
      campaignName: validatedInput.data.campaignName,
      userId: userId,
    },
  })
}

function logSpamActionSubmissions({
  validatedInput,
  analytics,
}: {
  validatedInput: z.SafeParseSuccess<CreateActionClaimNFTInput>
  analytics: ReturnType<typeof getServerAnalytics>
}) {
  analytics.trackUserActionCreatedIgnored({
    actionType: UserActionType.CLAIM_NFT,
    campaignName: validatedInput.data.campaignName,
    reason: 'Too Many Recent',
    userState: 'Existing',
  })
}

async function createAction({
  user,
  validatedInput,
  analytics,
  countryCode,
}: {
  user: Prisma.UserGetPayload<{
    include: {
      primaryUserCryptoAddress: true
    }
  }>
  validatedInput: CreateActionClaimNFTInput
  analytics: ReturnType<typeof getServerAnalytics>
  countryCode: string
}) {
  if (!user?.primaryUserCryptoAddress?.id) {
    throw new Error('User does not have a primary crypto address to claim NFT')
  }
  const userAction = await prismaClient.userAction.create({
    data: {
      user: { connect: { id: user.id } },
      actionType: UserActionType.CLAIM_NFT,
      campaignName: validatedInput.campaignName,
      userCryptoAddress: { connect: { id: user.primaryUserCryptoAddress.id } },
      countryCode,
    },
  })

  logger.info('created user action and updated user')

  analytics.trackUserActionCreated({
    actionType: UserActionType.CLAIM_NFT,
    campaignName: validatedInput.campaignName,
    userState: 'Existing',
  })

  return { userAction }
}
