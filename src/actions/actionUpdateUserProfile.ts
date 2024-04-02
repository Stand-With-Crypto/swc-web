'use server'
import 'server-only'

import {
  Address,
  CapitolCanaryInstance,
  User,
  UserCryptoAddress,
  UserEmailAddress,
  UserEmailAddressSource,
} from '@prisma/client'
import { z } from 'zod'

import { getClientAddress } from '@/clientModels/clientAddress'
import { getClientUserWithENSData } from '@/clientModels/clientUser/clientUser'
import { getENSDataFromCryptoAddressAndFailGracefully } from '@/data/web3/getENSDataFromCryptoAddress'
import { CAPITOL_CANARY_UPSERT_ADVOCATE_INNGEST_EVENT_NAME } from '@/inngest/functions/capitolCanary/upsertAdvocateInCapitolCanary'
import { inngest } from '@/inngest/inngest'
import { appRouterGetAuthUser } from '@/utils/server/authentication/appRouterGetAuthUser'
import {
  CapitolCanaryCampaignName,
  getCapitolCanaryCampaignID,
} from '@/utils/server/capitolCanary/campaigns'
import { UpsertAdvocateInCapitolCanaryPayloadRequirements } from '@/utils/server/capitolCanary/payloadRequirements'
import { prismaClient } from '@/utils/server/prismaClient'
import { throwIfRateLimited } from '@/utils/server/ratelimit/throwIfRateLimited'
import { getServerPeopleAnalytics } from '@/utils/server/serverAnalytics'
import { parseLocalUserFromCookies } from '@/utils/server/serverLocalUser'
import { withServerActionMiddleware } from '@/utils/server/withServerActionMiddleware'
import { convertAddressToAnalyticsProperties } from '@/utils/shared/sharedAnalytics'
import { userFullName } from '@/utils/shared/userFullName'
import { zodUpdateUserProfileFormAction } from '@/validation/forms/zodUpdateUserProfile/zodUpdateUserProfileFormAction'

export const actionUpdateUserProfile = withServerActionMiddleware(
  'actionUpdateUserProfile',
  _actionUpdateUserProfile,
)

async function _actionUpdateUserProfile(data: z.infer<typeof zodUpdateUserProfileFormAction>) {
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

  await throwIfRateLimited({ context: 'authenticated' })

  const user = await prismaClient.user.findFirstOrThrow({
    where: {
      id: authUser.userId,
    },
    include: {
      userEmailAddresses: true,
      primaryUserEmailAddress: true,
      address: true,
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
  await getServerPeopleAnalytics({
    userId: authUser.userId,
    localUser: parseLocalUserFromCookies(),
  }).set({
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
      address: true,
      primaryUserCryptoAddress: true,
    },
  })

  await handleCapitolCanaryAdvocateUpsert(updatedUser, primaryUserEmailAddress, user)

  return {
    user: {
      ...getClientUserWithENSData(
        updatedUser,
        updatedUser.primaryUserCryptoAddress
          ? await getENSDataFromCryptoAddressAndFailGracefully(
              updatedUser.primaryUserCryptoAddress.cryptoAddress,
            )
          : null,
      ),
      address: updatedUser.address && getClientAddress(updatedUser.address),
    },
  }
}

async function handleCapitolCanaryAdvocateUpsert(
  updatedUser: User & { address: Address | null } & {
    primaryUserCryptoAddress: UserCryptoAddress | null
  },
  primaryUserEmailAddress: UserEmailAddress | null | undefined,
  oldUser: User & { address: Address | null } & {
    primaryUserEmailAddress: UserEmailAddress | null
  } & { userEmailAddresses: UserEmailAddress[] },
) {
  // Send unsubscribe payload if the old email address or phone number has changed, or if the user removed their old email or phone number.
  // `hasChangedEmail` is true if an old email address exists and the new email address is different from the old email address.
  const hasChangedEmail =
    !!oldUser.primaryUserEmailAddress &&
    (!primaryUserEmailAddress ||
      oldUser.primaryUserEmailAddress.emailAddress !== primaryUserEmailAddress.emailAddress)
  if (hasChangedEmail) {
    const unsubscribePayload: UpsertAdvocateInCapitolCanaryPayloadRequirements = {
      campaignId: getCapitolCanaryCampaignID(CapitolCanaryCampaignName.DEFAULT_SUBSCRIBER),
      user: {
        ...updatedUser, // Use new user information EXCEPT for the phone number.
        address: updatedUser.address,
      },
      userEmailAddress: oldUser.primaryUserEmailAddress, // Using old email here.
      opts: {
        isEmailOptout: hasChangedEmail,
      },
    }
    await inngest.send({
      name: CAPITOL_CANARY_UPSERT_ADVOCATE_INNGEST_EVENT_NAME,
      data: unsubscribePayload,
    })
  }

  // Only send updating payload if we do not have an SwC advocate ID
  // or there has been a changed field (name, address, email address, phone number, opt-ins/outs, and joining C4 Member),
  // and we at least have email or phone number.
  // Breaking early if nothing has been changed.
  if (
    (!updatedUser.capitolCanaryAdvocateId ||
      updatedUser.capitolCanaryInstance === CapitolCanaryInstance.LEGACY ||
      oldUser.firstName !== updatedUser.firstName ||
      oldUser.lastName !== updatedUser.lastName ||
      oldUser.address?.googlePlaceId !== updatedUser.address?.googlePlaceId ||
      oldUser.primaryUserEmailAddress?.emailAddress !== primaryUserEmailAddress?.emailAddress ||
      oldUser.phoneNumber !== updatedUser.phoneNumber ||
      oldUser.hasOptedInToSms !== updatedUser.hasOptedInToSms ||
      (!oldUser.hasOptedInToMembership && updatedUser.hasOptedInToMembership)) &&
    (primaryUserEmailAddress || updatedUser.phoneNumber)
  ) {
    const payload: UpsertAdvocateInCapitolCanaryPayloadRequirements = {
      campaignId: getCapitolCanaryCampaignID(CapitolCanaryCampaignName.DEFAULT_SUBSCRIBER),
      user: {
        ...updatedUser, // Using new user information (including new phone number).
        address: updatedUser.address,
      },
      userEmailAddress: primaryUserEmailAddress, // Using new email here.
      opts: {
        isEmailOptin: true,
        isSmsOptin: updatedUser.hasOptedInToSms,
      },
    }
    if (!oldUser.hasOptedInToMembership && updatedUser.hasOptedInToMembership) {
      payload.metadata = {
        tags: ['C4 Member'],
      }
    }
    await inngest.send({
      name: CAPITOL_CANARY_UPSERT_ADVOCATE_INNGEST_EVENT_NAME,
      data: payload,
    })
  }
}
