'use server'
import 'server-only'

import { User, UserAction, UserActionType, UserInformationVisibility } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import { nativeEnum, object, z } from 'zod'

import { getClientUser } from '@/clientModels/clientUser/clientUser'
import {
  getMaybeUserAndMethodOfMatch,
  UserAndMethodOfMatch,
} from '@/utils/server/getMaybeUserAndMethodOfMatch'
import { prismaClient } from '@/utils/server/prismaClient'
import { throwIfRateLimited } from '@/utils/server/ratelimit/throwIfRateLimited'
import { getServerAnalytics, getServerPeopleAnalytics } from '@/utils/server/serverAnalytics'
import {
  mapLocalUserToUserDatabaseFields,
  parseLocalUserFromCookies,
} from '@/utils/server/serverLocalUser'
import { getUserSessionId } from '@/utils/server/serverUserSessionId'
import { withServerActionMiddleware } from '@/utils/server/withServerActionMiddleware'
import { mapPersistedLocalUserToAnalyticsProperties } from '@/utils/shared/localUser'
import { getLogger } from '@/utils/shared/logger'
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

  const userMatch = await getMaybeUserAndMethodOfMatch({
    include: { primaryUserCryptoAddress: true },
  })
  const user = userMatch.user
  if (!user) {
    const error = new Error('Create User Action NFT Mint - Not authenticated')
    Sentry.captureException(error, {
      tags: { domain: 'actionCreateUserActionMintNFT' },
      extra: {
        sessionId,
      },
    })

    throw error
  }

  await throwIfRateLimited()

  const analytics = getServerAnalytics({
    userId: user.id,
    localUser,
  })

  const recentUserAction = await getRecentUserActionForCampaignByUserId(
    user.id,
    validatedInput.data.campaignName,
  )
  if (recentUserAction) {
    logSpamActionSubmissions({
      validatedInput,
      userAction: recentUserAction,
      userId: user.id,
      sharedDependencies: { analytics },
    })
    return { user: getClientUser(user) }
  }

  await createAction({
    user,
    isNewUser: !userMatch.user,
    validatedInput: validatedInput.data,
    userMatch,
    sharedDependencies: { sessionId, analytics },
  })

  return { user: getClientUser(user) }
}

async function getRecentUserActionForCampaignByUserId(
  userId: User['id'],
  campaignName: UserActionNftMintCampaignName,
) {
  return prismaClient.userAction.findFirst({
    where: {
      actionType: UserActionType.NFT_MINT,
      campaignName,
      userId: userId,
    },
  })
}

function logSpamActionSubmissions({
  validatedInput,
  userAction,
  userId,
  sharedDependencies,
}: {
  validatedInput: z.SafeParseSuccess<z.infer<typeof createActionMintNFTInputValidationSchema>>
  userAction: UserAction
  userId: User['id']
  sharedDependencies: Pick<SharedDependencies, 'analytics'>
}) {
  const { campaignName } = validatedInput.data

  sharedDependencies.analytics.trackUserActionCreatedIgnored({
    actionType: UserActionType.NFT_MINT,
    campaignName,
    reason: 'Too Many Recent',
    userState: 'Existing',
  })
  Sentry.captureMessage(
    `duplicate ${UserActionType.NFT_MINT} user action for campaign ${campaignName} submitted`,
    {
      extra: { validatedInput: validatedInput.data, userAction },
      user: { id: userId },
    },
  )
}

async function createAction<U extends User>({
  user,
  validatedInput,
  userMatch,
  sharedDependencies,
  isNewUser,
}: {
  user: U
  isNewUser: boolean
  validatedInput: z.infer<typeof createActionMintNFTInputValidationSchema>
  userMatch: UserAndMethodOfMatch
  sharedDependencies: Pick<SharedDependencies, 'sessionId' | 'analytics'>
}) {
  await prismaClient.userAction.create({
    data: {
      user: { connect: { id: user.id } },
      actionType: UserActionType.NFT_MINT,
      campaignName: validatedInput.campaignName,
      ...('userCryptoAddress' in userMatch
        ? {
            userCryptoAddress: { connect: { id: userMatch.userCryptoAddress.id } },
          }
        : { userSession: { connect: { id: sharedDependencies.sessionId } } }),
    },
  })

  logger.info('created user action')

  sharedDependencies.analytics.trackUserActionCreated({
    actionType: UserActionType.NFT_MINT,
    campaignName: validatedInput.campaignName,
    userState: isNewUser ? 'New' : 'Existing',
  })
}
