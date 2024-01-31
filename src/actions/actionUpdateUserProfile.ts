'use server'
import { getClientAddress } from '@/clientModels/clientAddress'
import { getClientUserWithENSData } from '@/clientModels/clientUser/clientUser'
import { getENSDataFromCryptoAddressAndFailGracefully } from '@/data/web3/getENSDataFromCryptoAddress'
import { CAPITOL_CANARY_CREATE_ADVOCATE_INNGEST_EVENT_NAME } from '@/inngest/functions/createAdvocateInCapitolCanary'
import { CAPITOL_CANARY_UPDATE_ADVOCATE_INNGEST_EVENT_NAME } from '@/inngest/functions/updateAdvocateInCapitolCanary'
import { inngest } from '@/inngest/inngest'
import {
  CapitolCanaryCampaignName,
  getCapitolCanaryCampaignID,
} from '@/utils/server/capitolCanary/campaigns'
import {
  CreateAdvocateInCapitolCanaryPayloadRequirements,
  UpdateAdvocateInCapitolCanaryPayloadRequirements,
} from '@/utils/server/capitolCanary/payloadRequirements'
import { prismaClient } from '@/utils/server/prismaClient'
import { getServerPeopleAnalytics } from '@/utils/server/serverAnalytics'
import { parseLocalUserFromCookies } from '@/utils/server/serverLocalUser'
import { appRouterGetAuthUser } from '@/utils/server/thirdweb/appRouterGetAuthUser'
import { convertAddressToAnalyticsProperties } from '@/utils/shared/sharedAnalytics'
import { userFullName } from '@/utils/shared/userFullName'
import { zodUpdateUserProfileFormAction } from '@/validation/forms/zodUpdateUserProfile/zodUpdateUserProfileFormAction'
import {
  Address,
  CapitolCanaryInstance,
  User,
  UserCryptoAddress,
  UserEmailAddress,
  UserEmailAddressSource,
} from '@prisma/client'
import 'server-only'
import { z } from 'zod'

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
      address: true,
      primaryUserCryptoAddress: true,
    },
  })

  await handleCapitolCanaryAdvocateUpdate(
    updatedUser,
    primaryUserEmailAddress,
    hasOptedInToSms,
    user,
  )

  return {
    user: {
      ...getClientUserWithENSData(
        updatedUser,
        await getENSDataFromCryptoAddressAndFailGracefully(
          updatedUser.primaryUserCryptoAddress!.cryptoAddress,
        ),
      ),
      address: updatedUser.address && getClientAddress(updatedUser.address),
    },
  }
}

/**
 * If the user does NOT have an advocate ID, or if the instance is from the legacy Stand with Crypto, then create a new advocate profile and update the database.
 * Otherwise, update the existing advocate profile appropriately (and no need to update database).
 *
 * TODO (Benson): Handle CC membership toggling options: https://github.com/Stand-With-Crypto/swc-web/issues/173
 */
async function handleCapitolCanaryAdvocateUpdate(
  updatedUser: User & { address: Address | null } & {
    primaryUserCryptoAddress: UserCryptoAddress | null
  },
  primaryUserEmailAddress: UserEmailAddress | null | undefined,
  hasOptedInToSms: boolean,
  oldUser: User & { address: Address | null } & {
    primaryUserEmailAddress: UserEmailAddress | null
  } & { userEmailAddresses: UserEmailAddress[] },
) {
  // We should only send the payload if the updated user has an email address or phone number.
  if (!primaryUserEmailAddress && !updatedUser.phoneNumber) {
    return
  }

  const commonPayloadData = {
    campaignId: getCapitolCanaryCampaignID(CapitolCanaryCampaignName.DEFAULT_SUBSCRIBER),
    user: {
      ...updatedUser,
      address: updatedUser.address,
    },
    userEmailAddress: primaryUserEmailAddress!,
    opts: {
      isEmailOptin: true,
      isSmsOptin: hasOptedInToSms,
      shouldSendSmsOptinConfirmation: hasOptedInToSms,
    },
  }

  // Create a new advocate if we have no SWC advocate ID.
  if (
    !updatedUser.capitolCanaryAdvocateId ||
    updatedUser.capitolCanaryInstance == CapitolCanaryInstance.LEGACY
  ) {
    const payload: CreateAdvocateInCapitolCanaryPayloadRequirements = {
      ...commonPayloadData,
    }
    await inngest.send({
      name: CAPITOL_CANARY_CREATE_ADVOCATE_INNGEST_EVENT_NAME,
      data: payload,
    })
    return
  }

  // Otherwise, we attempt to update the existing advocate.
  // If there is no change in name, address, email, and phone number, then we can return early.
  if (
    oldUser.firstName === updatedUser.firstName &&
    oldUser.lastName === updatedUser.lastName &&
    oldUser.address?.googlePlaceId === updatedUser.address?.googlePlaceId &&
    oldUser.primaryUserEmailAddress?.emailAddress === primaryUserEmailAddress?.emailAddress &&
    oldUser.phoneNumber === updatedUser.phoneNumber
  ) {
    return
  }

  // Else, we should proceed with the payloads.
  // Unsubscribe old email/phone number if applicable.
  const unsubscribePayload: UpdateAdvocateInCapitolCanaryPayloadRequirements = {
    advocateId: updatedUser.capitolCanaryAdvocateId,
    campaignId: getCapitolCanaryCampaignID(CapitolCanaryCampaignName.DEFAULT_SUBSCRIBER),
    user: {
      ...updatedUser, // Always use new user information.
      address: updatedUser.address, // Always use new user information.
    },
    userEmailAddress: oldUser.primaryUserEmailAddress!, // Old email must exist if advocate ID exists.
    opts: {
      isEmailOptout:
        oldUser.primaryUserEmailAddress?.emailAddress !== primaryUserEmailAddress?.emailAddress
          ? true
          : false, // Opt-out of email if email changed.
      isSmsOptout:
        oldUser.phoneNumber && oldUser.phoneNumber !== updatedUser.phoneNumber ? true : false, // Opt-out of SMS if phone number changed.
    },
  }
  await inngest.send({
    name: CAPITOL_CANARY_UPDATE_ADVOCATE_INNGEST_EVENT_NAME,
    data: unsubscribePayload,
  })

  // Subscribe with new email/phone number.
  const payload: UpdateAdvocateInCapitolCanaryPayloadRequirements = {
    ...commonPayloadData,
    advocateId: updatedUser.capitolCanaryAdvocateId,
  }
  await inngest.send({
    name: CAPITOL_CANARY_UPDATE_ADVOCATE_INNGEST_EVENT_NAME,
    data: payload,
  })
}
