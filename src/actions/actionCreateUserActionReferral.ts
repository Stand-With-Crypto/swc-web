'use server'
import 'server-only'

import { Address, User, UserAction, UserActionRefer, UserActionType } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import { waitUntil } from '@vercel/functions'
import { z } from 'zod'

import { getClientUser } from '@/clientModels/clientUser/clientUser'
import { prismaClient } from '@/utils/server/prismaClient'
import { getServerAnalytics } from '@/utils/server/serverAnalytics'
import { getLocalUserFromUser } from '@/utils/server/serverLocalUser'
import { getLogger } from '@/utils/shared/logger'
import { US_USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP } from '@/utils/shared/userActionCampaigns/us/usUserActionCampaigns'
import { withSafeParseWithMetadata } from '@/utils/shared/zod'
import { zodReferralId } from '@/validation/fields/zodReferrald'

const logger = getLogger(`actionCreateUserActionReferral`)

const zodUserActionReferralInput = z.object({
  referralId: zodReferralId,
  newUserId: z.string().uuid('Invalid user ID format'),
})

type Input = z.infer<typeof zodUserActionReferralInput>

async function createReferralRecord({
  referrerId,
  addressId,
  countryCode,
  analytics,
  districtInfo,
}: {
  referrerId: string
  addressId: string | null
  countryCode: string
  analytics: ReturnType<typeof getServerAnalytics>
  districtInfo?: {
    state: string
    district: string
  }
}) {
  const userActionReferData = addressId
    ? {
        referralsCount: 1,
        addressId,
      }
    : {
        referralsCount: 1,
      }

  const userAction = await prismaClient.userAction.create({
    data: {
      userId: referrerId,
      actionType: UserActionType.REFER,
      campaignName: US_USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP[UserActionType.REFER],
      countryCode,
      userActionRefer: {
        create: userActionReferData,
      },
    },
  })

  analytics.trackUserActionCreated({
    actionType: UserActionType.REFER,
    campaignName: US_USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP[UserActionType.REFER],
    creationMethod: 'On Site',
    userState: 'Existing',
  })

  if (districtInfo) {
    const { state, district } = districtInfo
    logger.info(
      `Created REFER action for referrer ${referrerId} in district ${state}-${district} with address ${addressId ?? 'no-address'}`,
    )
  } else {
    logger.info(`Created REFER action for referrer ${referrerId} without district attribution`)
  }

  return userAction
}

async function incrementExistingReferral({
  existingActionId,
  referrerId,
  addressId,
  analytics,
  districtInfo,
}: {
  existingActionId: string
  referrerId: string
  addressId: string | null
  analytics: ReturnType<typeof getServerAnalytics>
  districtInfo?: { state: string; district: string }
}) {
  const userAction = await prismaClient.userAction.update({
    where: { id: existingActionId },
    data: {
      userActionRefer: {
        update: {
          referralsCount: { increment: 1 },
        },
      },
    },
  })

  analytics.trackUserActionUpdated({
    actionType: UserActionType.REFER,
    campaignName: US_USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP[UserActionType.REFER],
    userState: 'Existing',
    actionId: existingActionId,
  })

  const districtStr = districtInfo
    ? ` in district ${districtInfo.state}-${districtInfo.district}`
    : ''
  logger.info(
    `Incremented referral count for referrer ${referrerId}${districtStr} with address ${addressId ?? 'no-address'}`,
  )

  return userAction
}

async function findOrCreateUserActionRefer({
  referrer,
  analytics,
  countryCode,
}: {
  referrer: User & {
    address: Address | null
    userActions: (UserAction & {
      userActionRefer:
        | (UserActionRefer & {
            address: Address | null
          })
        | null
    })[]
  }
  analytics: ReturnType<typeof getServerAnalytics>
  countryCode: string
}) {
  /**
   * For users without an address,
   * find an existing record without an address or create the first without address
   */
  if (!referrer.address) {
    logger.warn(`Referrer ${referrer.id} has no address, can't attribute to a district`)

    const existingReferWithoutAddress = referrer.userActions.find(
      action =>
        action.actionType === UserActionType.REFER && action.userActionRefer?.address === null,
    )

    if (existingReferWithoutAddress) {
      return await incrementExistingReferral({
        existingActionId: existingReferWithoutAddress.id,
        referrerId: referrer.id,
        addressId: referrer.addressId,
        analytics,
      })
    } else {
      return await createReferralRecord({
        referrerId: referrer.id,
        addressId: referrer.addressId,
        analytics,
        countryCode,
      })
    }
  }

  const {
    id: addressId,
    administrativeAreaLevel1: state,
    usCongressionalDistrict: district,
  } = referrer.address

  /**
   * If the address doesn't have valid district information,
   * create a record without district attribution or update an existing record
   */
  if (!state || !district) {
    logger.warn(
      `Address ${addressId} doesn't have valid district information, creating record without district attribution`,
    )

    const existingReferWithAddressButNoDistrict = referrer.userActions.find(
      action =>
        action.actionType === UserActionType.REFER &&
        action.userActionRefer?.address?.id === addressId,
    )

    if (existingReferWithAddressButNoDistrict) {
      return await incrementExistingReferral({
        existingActionId: existingReferWithAddressButNoDistrict.id,
        referrerId: referrer.id,
        addressId,
        analytics,
      })
    } else {
      return await createReferralRecord({
        referrerId: referrer.id,
        analytics,
        addressId,
        countryCode,
      })
    }
  }

  /**
   * For Users with valid district info,
   * look for an existing referral with district info or create a new one
   */
  const existingReferForDistrict = referrer.userActions.find(
    action =>
      action.actionType === UserActionType.REFER &&
      action.userActionRefer?.address?.administrativeAreaLevel1 === state &&
      action.userActionRefer?.address?.usCongressionalDistrict === district,
  )

  const districtInfo = {
    state,
    district,
  }

  if (existingReferForDistrict) {
    return await incrementExistingReferral({
      existingActionId: existingReferForDistrict.id,
      referrerId: referrer.id,
      addressId,
      analytics,
      districtInfo,
    })
  } else {
    return await createReferralRecord({
      referrerId: referrer.id,
      analytics,
      addressId,
      districtInfo,
      countryCode,
    })
  }
}

export async function actionCreateUserActionReferral(input: Input) {
  logger.info('triggered', input)

  const validatedFields = withSafeParseWithMetadata(zodUserActionReferralInput, input)
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      errorsMetadata: validatedFields.errorsMetadata,
    }
  }
  const { referralId, newUserId } = validatedFields.data

  const referredUser = await prismaClient.user.findFirstOrThrow({
    where: { id: newUserId },
    include: {
      primaryUserCryptoAddress: true,
      address: true,
    },
  })
  if (!referredUser) {
    logger.error('Referred user not found', { newUserId })
    return {
      errors: { newUserId: ['Referred user not found'] },
    }
  }

  const referrer = await prismaClient.user.findFirst({
    where: { referralId },
    include: {
      address: true,
      primaryUserCryptoAddress: true,
      userActions: {
        where: {
          actionType: UserActionType.REFER,
        },
        include: {
          userActionRefer: {
            include: {
              address: true,
            },
          },
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
        newUserId,
      },
      level: 'error',
    })
    return { errors: { referralId: ['Referrer not found'] } }
  }

  logger.info(`found referrer ${referrer.id}`)

  const analytics = getServerAnalytics({
    userId: referrer.id,
    localUser: getLocalUserFromUser(referrer),
  })
  const beforeFinish = () => Promise.all([analytics.flush()])

  const countryCode = referrer.countryCode
  if (!countryCode) {
    logger.error('no country code found')
    Sentry.captureMessage('no country code found', {
      tags: { domain: 'referrals' },
      extra: { newUserId, referrer },
    })
    return {
      errors: { countryCode: ['No country code found'] },
    }
  }

  const userAction = await findOrCreateUserActionRefer({
    referrer,
    analytics,
    countryCode,
  })

  const hasExistingReferActions = referrer.userActions.length > 0

  waitUntil(beforeFinish())

  return {
    user: getClientUser(referrer),
    wasActionCreated: !hasExistingReferActions,
    action: userAction,
  }
}
