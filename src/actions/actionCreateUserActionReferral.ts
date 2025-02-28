'use server'
import 'server-only'

import { UserActionType } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import { waitUntil } from '@vercel/functions'
import { z } from 'zod'

import { getClientUser } from '@/clientModels/clientUser/clientUser'
import { prismaClient } from '@/utils/server/prismaClient'
import { getServerAnalytics } from '@/utils/server/serverAnalytics'
import { zodServerLocalUser } from '@/utils/server/serverLocalUser'
import { getLogger } from '@/utils/shared/logger'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'
import { USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP } from '@/utils/shared/userActionCampaigns'
import { withSafeParseWithMetadata } from '@/utils/shared/zod'
import { zodReferralId } from '@/validation/fields/zodReferrald'

const logger = getLogger(`actionCreateUserActionReferral`)

const zodUserActionReferralInput = z.object({
  referralId: zodReferralId,
  userId: z.string().uuid('Invalid user ID format'),
  /**
   * Calling the server action from Nextjs `after` may not have the client cookies.
   * This is why we accept the localUser as an optional parameter.
   */
  localUser: zodServerLocalUser.nullable(),
})

type Input = z.infer<typeof zodUserActionReferralInput>

export async function actionCreateUserActionReferral(input: Input) {
  logger.info('triggered', input)

  const validatedFields = withSafeParseWithMetadata(zodUserActionReferralInput, input)
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      errorsMetadata: validatedFields.errorsMetadata,
    }
  }
  const { referralId, userId, localUser } = validatedFields.data

  const user = await prismaClient.user.findFirstOrThrow({
    where: { id: userId },
    include: {
      primaryUserCryptoAddress: true,
      address: true,
    },
  })
  if (!user) {
    logger.error('user not found', { userId })
    return {
      errors: { userId: ['User not found'] },
    }
  }

  const analytics = getServerAnalytics({
    userId: user.id,
    localUser,
  })
  const beforeFinish = () => Promise.all([analytics.flush()])

  const referrer = await prismaClient.user.findFirst({
    where: { referralId },
    select: {
      id: true,
      countryCode: true,
      userActions: {
        select: {
          id: true,
          actionType: true,
          campaignName: true,
          userActionRefer: true,
        },
      },
    },
  })

  if (!referrer) {
    logger.info(`no referrer found with referralId: ${validatedFields.data.referralId}`)
    Sentry.captureMessage(`no referrer found with referralId: ${validatedFields.data.referralId}`, {
      tags: {
        domain: 'actionCreateUserActionReferral',
      },
      extra: {
        referralId,
        userId,
      },
      level: 'error',
    })
    waitUntil(beforeFinish())
    return { user: getClientUser(user) }
  }

  logger.info(`found referrer ${referrer.id}`)

  const countryCode =
    referrer.countryCode ||
    localUser?.persisted.countryCode ||
    localUser?.currentSession.countryCode ||
    DEFAULT_SUPPORTED_COUNTRY_CODE

  const existingReferAction = referrer.userActions.find(
    action => action.actionType === UserActionType.REFER,
  )

  if (existingReferAction?.userActionRefer) {
    await prismaClient.userActionRefer.update({
      where: { id: existingReferAction.id },
      data: {
        referralsCount: { increment: 1 },
      },
    })
    logger.info(`incremented referral count for referrer ${referrer.id}`)
  } else {
    await prismaClient.userAction.create({
      data: {
        userId: referrer.id,
        actionType: UserActionType.REFER,
        campaignName: USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP[UserActionType.REFER],
        countryCode,
        userActionRefer: {
          create: {
            referralsCount: 1,
          },
        },
      },
    })
    logger.info(`created REFER action for referrer ${referrer.id}`)
  }

  analytics.trackUserActionCreated({
    actionType: UserActionType.REFER,
    campaignName: USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP[UserActionType.REFER],
    creationMethod: 'On Site',
    userState: 'Existing',
  })

  waitUntil(beforeFinish())
  return { user: getClientUser(user) }
}
