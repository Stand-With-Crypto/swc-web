'use server'
import { appRouterGetAuthUser } from '@/utils/server/thirdweb/appRouterGetAuthUser'
import { prismaClient } from '@/utils/server/prismaClient'
import { parseLocalUserFromCookies } from '@/utils/server/serverLocalUser'
import { getServerPeopleAnalytics } from '@/utils/server/serverAnalytics'
import { convertAddressToAnalyticsProperties } from '@/utils/shared/sharedAnalytics'
import { zodUpdateUserProfileFormAction } from '@/validation/forms/zodUpdateUserProfile'
import { UserEmailAddressSource } from '@prisma/client'
import 'server-only'
import { z } from 'zod'
import { getClientUser } from '@/clientModels/clientUser/clientUser'
import { userFullName } from '@/utils/shared/userFullName'
import {
  CapitolCanaryCampaignName,
  getCapitolCanaryCampaignID,
} from '@/utils/server/capitolCanary/campaigns'
import { CreateAdvocateInCapitolCanaryPayloadRequirements } from '@/utils/server/capitolCanary/payloadRequirements'
import { inngest } from '@/inngest/inngest'
import { CREATE_CAPITOL_CANARY_ADVOCATE_INNGEST_EVENT_NAME } from '@/inngest/functions/createAdvocateInCapitolCanary'

export async function actionUpdateUserProfile(
  data: z.infer<typeof zodUpdateUserProfileFormAction>,
) {
  const authUser = await appRouterGetAuthUser()
  if (!authUser) {
    throw new Error('Unauthenticated')
  }
  const validatedFields = zodUpdateUserProfileFormAction.safeParse(data)
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }
  const user = await prismaClient.user.findFirstOrThrow({
    where: {
      id: authUser.userId,
    },
    include: {
      userEmailAddresses: true,
      primaryUserEmailAddress: true,
    },
  })
  const {
    firstName,
    lastName,
    emailAddress,
    phoneNumber,
    hasOptedInToSms,
    hasOptedInToMembership,
  } = validatedFields.data
  const address = validatedFields.data.address
    ? await prismaClient.address.upsert({
        where: {
          googlePlaceId: validatedFields.data.address.googlePlaceId,
        },
        create: {
          ...validatedFields.data.address,
        },
        update: {},
      })
    : null
  const existingUserEmailAddress = emailAddress
    ? user.userEmailAddresses.find(addr => addr.emailAddress === emailAddress)
    : null
  const primaryUserEmailAddress =
    emailAddress && !existingUserEmailAddress
      ? await prismaClient.userEmailAddress.create({
          data: {
            emailAddress,
            source: UserEmailAddressSource.USER_ENTERED,
            isVerified: false,
            user: {
              connect: {
                id: user.id,
              },
            },
          },
        })
      : existingUserEmailAddress
  const localUser = parseLocalUserFromCookies()
  const peopleAnalytics = getServerPeopleAnalytics({ userId: authUser.userId, localUser })
  peopleAnalytics.set({
    ...(address ? convertAddressToAnalyticsProperties(address) : {}),
    // https://docs.mixpanel.com/docs/data-structure/user-profiles#reserved-user-properties
    $email: emailAddress,
    $phone: phoneNumber,
    $name: userFullName(validatedFields.data),
    'Has Opted In To Membership': hasOptedInToMembership,
    'Has Opted In To Sms': hasOptedInToSms,
  })

  const updatedUser = await prismaClient.user.update({
    where: {
      id: user.id,
    },
    data: {
      firstName,
      lastName,
      phoneNumber,
      hasOptedInToMembership,
      hasOptedInToSms,
      addressId: address?.id || null,
      primaryUserEmailAddressId: primaryUserEmailAddress?.id || null,
    },
    include: {
      primaryUserCryptoAddress: true,
    },
  })

  // TODO: Handle membership toggling options: https://github.com/Stand-With-Crypto/swc-web/issues/173

  /**
   * Subscribe new email address and phone number to Capitol Canary.
   * UI requires non-empty email address within its validation, so we can use email safely.
   */
  const campaignId = getCapitolCanaryCampaignID(CapitolCanaryCampaignName.DEFAULT_MEMBERSHIP)
  let payload: CreateAdvocateInCapitolCanaryPayloadRequirements = {
    campaignId,
    user: {
      ...updatedUser,
      address,
    },
    userEmailAddress: primaryUserEmailAddress!,
    opts: {
      isEmailOptin: true,
      isSmsOptin: updatedUser.hasOptedInToSms,
      isSmsOptinConfirmed: true,
    },
  }
  await inngest.send({
    name: CREATE_CAPITOL_CANARY_ADVOCATE_INNGEST_EVENT_NAME,
    data: payload,
  })

  /**
   * Unsubscribe old phone number from Capitol Canary if the old differs from the new.
   * UI requires non-empty email address within its validation, so we can use primary email safely if needed.
   */
  if (user.phoneNumber !== '' && user.phoneNumber !== updatedUser.phoneNumber) {
    payload = {
      campaignId,
      user: {
        ...user,
        address,
      },
      userEmailAddress: existingUserEmailAddress
        ? existingUserEmailAddress
        : primaryUserEmailAddress!,
      opts: {
        isSmsOptout: true,
      },
    }
    await inngest.send({
      name: CREATE_CAPITOL_CANARY_ADVOCATE_INNGEST_EVENT_NAME,
      data: payload,
    })
  }

  /**
   * Unsubscribe old email address from Capitol Canary if the old differs from the new.
   * Only can perform if the old email address exists.
   */
  if (
    user.primaryUserEmailAddress &&
    user.primaryUserEmailAddress?.emailAddress !== primaryUserEmailAddress?.emailAddress
  ) {
    payload = {
      campaignId,
      user: {
        ...user,
        address,
      },
      userEmailAddress: user.primaryUserEmailAddress,
      opts: {
        isEmailOptout: true,
      },
    }
    await inngest.send({
      name: CREATE_CAPITOL_CANARY_ADVOCATE_INNGEST_EVENT_NAME,
      data: payload,
    })
  }

  return {
    user: getClientUser(updatedUser),
  }
}
