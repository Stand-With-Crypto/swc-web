import { UserActionType } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'

import { prismaClient } from '@/utils/server/prismaClient'
import { logger } from '@/utils/shared/logger'
import { USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP } from '@/utils/shared/userActionCampaigns'

export async function createReferral({ referralId }: { referralId: string }) {
  logger.info(`createReferral: referralId "${referralId}"`)

  const referrer = await prismaClient.user.findFirst({
    where: { referralId },
    select: {
      id: true,
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
    logger.info(`createReferral: no referrer found with referralId: ${referralId}`)
    Sentry.captureMessage(`createReferral: no referrer found with referralId: ${referralId}`, {
      extra: { referralId },
      tags: {
        domain: 'referral',
      },
    })
    return
  }

  logger.info(`createReferral: found referrer ${referrer.id}`)

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
    logger.info(`createReferral: incremented referral count for referrer ${referrer.id}`)
  } else {
    await prismaClient.userAction.create({
      data: {
        userId: referrer.id,
        actionType: UserActionType.REFER,
        campaignName: USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP[UserActionType.REFER],
        userActionRefer: {
          create: {
            referralsCount: 1,
          },
        },
      },
    })
    logger.info(`createReferral: created REFER action for referrer ${referrer.id}`)
  }
}
