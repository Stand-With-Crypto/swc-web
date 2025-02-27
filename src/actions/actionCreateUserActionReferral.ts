'use server'
import 'server-only'

import { Address, User, UserAction, UserActionRefer, UserActionType } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import { waitUntil } from '@vercel/functions'
import { z } from 'zod'

import { getClientUser } from '@/clientModels/clientUser/clientUser'
import { prismaClient } from '@/utils/server/prismaClient'
import { getServerAnalytics } from '@/utils/server/serverAnalytics'
import { ServerLocalUser, zodServerLocalUser } from '@/utils/server/serverLocalUser'
import { getLogger } from '@/utils/shared/logger'
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

/**
 * Creates a referral record with optional address attribution
 */
async function createReferralRecord({
  referrerId,
  addressData,
  countryCode,
  analytics,
}: {
  referrerId: string
  countryCode: string
  addressData?: {
    addressId: string
    districtInfo?: {
      state: string
      district: string
    }
  }
  analytics: ReturnType<typeof getServerAnalytics>
}) {
  const userActionReferData = addressData
    ? {
        referralsCount: 1,
        addressId: addressData.addressId,
      }
    : {
        referralsCount: 1,
      }

  const userAction = await prismaClient.userAction.create({
    data: {
      userId: referrerId,
      actionType: UserActionType.REFER,
      campaignName: USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP[UserActionType.REFER],
      countryCode,
      userActionRefer: {
        create: userActionReferData,
      },
    },
  })

  analytics.trackUserActionCreated({
    actionType: UserActionType.REFER,
    campaignName: USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP[UserActionType.REFER],
    creationMethod: 'On Site',
    userState: 'Existing',
  })

  if (addressData?.districtInfo) {
    const { state, district } = addressData.districtInfo
    logger.info(
      `Created REFER action for referrer ${referrerId} in district ${state}-${district} with address ${addressData.addressId}`,
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
  addressId: string
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
    campaignName: USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP[UserActionType.REFER],
    userState: 'Existing',
    actionId: existingActionId,
  })

  const districtStr = districtInfo
    ? ` in district ${districtInfo.state}-${districtInfo.district}`
    : ''
  logger.info(
    `Incremented referral count for referrer ${referrerId}${districtStr} with address ${addressId}`,
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
  // For users without an address, find an existing record without an address
  if (!referrer.address) {
    logger.warn(`Referrer ${referrer.id} has no address, can't attribute to a district`)

    // Look for an existing referral without an address
    const existingReferWithoutAddress = referrer.userActions.find(
      action =>
        action.actionType === UserActionType.REFER && action.userActionRefer?.address === null,
    )

    if (existingReferWithoutAddress) {
      return await incrementExistingReferral({
        existingActionId: existingReferWithoutAddress.id,
        referrerId: referrer.id,
        addressId: 'no-address', // This is just for logging
        analytics,
      })
    } else {
      return await createReferralRecord({
        referrerId: referrer.id,
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

  if (!state || !district) {
    logger.warn(
      `Address ${addressId} doesn't have valid district information, creating record without district attribution`,
    )

    // Look for an existing referral with this address but without district info
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
        countryCode,
      })
    }
  }

  // Look for an existing referral with district info
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
      addressData: {
        addressId,
        districtInfo,
      },
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
    include: {
      address: true,
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
        userId,
      },
      level: 'error',
    })
    waitUntil(beforeFinish())
    return { errors: { referralId: ['Referrer not found'] } }
  }

  logger.info(`found referrer ${referrer.id}`)

  const countryCode = getCountryCode(user, localUser)
  if (!countryCode) {
    logger.error('no country code found')
    Sentry.captureMessage('no country code found', {
      tags: { domain: 'referrals' },
      extra: { userId },
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
    user: getClientUser(user),
    wasActionCreated: !hasExistingReferActions,
    action: userAction,
  }
}

function getCountryCode(user: User | null, localUser: ServerLocalUser | null) {
  return (
    user?.countryCode || localUser?.persisted?.countryCode || localUser?.currentSession?.countryCode
  )
}
