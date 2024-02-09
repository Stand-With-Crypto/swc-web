'use server'
import { getClientAddress } from '@/clientModels/clientAddress'
import { getClientUserWithENSData } from '@/clientModels/clientUser/clientUser'
import { getENSDataFromCryptoAddressAndFailGracefully } from '@/data/web3/getENSDataFromCryptoAddress'
import { CAPITOL_CANARY_UPSERT_ADVOCATE_INNGEST_EVENT_NAME } from '@/inngest/functions/upsertAdvocateInCapitolCanary'
import { inngest } from '@/inngest/inngest'
import {
  CapitolCanaryCampaignName,
  getCapitolCanaryCampaignID,
} from '@/utils/server/capitolCanary/campaigns'
import { UpsertAdvocateInCapitolCanaryPayloadRequirements } from '@/utils/server/capitolCanary/payloadRequirements'
import { prismaClient } from '@/utils/server/prismaClient'
import { getServerPeopleAnalytics } from '@/utils/server/serverAnalytics'
import { parseLocalUserFromCookies } from '@/utils/server/serverLocalUser'
import { appRouterGetAuthUser } from '@/utils/server/thirdweb/appRouterGetAuthUser'
import { withServerActionMiddleware } from '@/utils/server/withServerActionMiddleware'
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
  const user = await prismaClient.user.findFirstOrThrow({
    include: {
      address: true,
      primaryUserEmailAddress: true,
      userEmailAddresses: true,
    },
    where: {
      id: authUser.userId,
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
        create: {
          ...validatedFields.data.address,
        },
        update: {},
        where: {
          googlePlaceId: validatedFields.data.address.googlePlaceId,
        },
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
            isVerified: false,
            source: UserEmailAddressSource.USER_ENTERED,
            user: {
              connect: {
                id: user.id,
              },
            },
          },
        })
      : existingUserEmailAddress
  const localUser = parseLocalUserFromCookies()
  const peopleAnalytics = getServerPeopleAnalytics({ localUser, userId: authUser.userId })
  peopleAnalytics.set({
    ...(address ? convertAddressToAnalyticsProperties(address) : {}),
    // https://docs.mixpanel.com/docs/data-structure/user-profiles#reserved-user-properties
    $email: emailAddress,
    $name: userFullName(validatedFields.data),
    $phone: phoneNumber,
    'Has Opted In To Membership': hasOptedInToMembership,
    'Has Opted In To Sms': hasOptedInToSms,
  })

  const updatedUser = await prismaClient.user.update({
    data: {
      addressId: address?.id || null,
      firstName,
      hasOptedInToMembership,
      hasOptedInToSms,
      lastName,
      phoneNumber,
      primaryUserEmailAddressId: primaryUserEmailAddress?.id || null,
    },
    include: {
      address: true,
      primaryUserCryptoAddress: true,
    },
    where: {
      id: user.id,
    },
  })

  await handleCapitolCanaryAdvocateUpsert(
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

// TODO (Benson): Handle CC membership toggling options: https://github.com/Stand-With-Crypto/swc-web/issues/173
async function handleCapitolCanaryAdvocateUpsert(
  updatedUser: User & { address: Address | null } & {
    primaryUserCryptoAddress: UserCryptoAddress | null
  },
  primaryUserEmailAddress: UserEmailAddress | null | undefined,
  hasOptedInToSms: boolean,
  oldUser: User & { address: Address | null } & {
    primaryUserEmailAddress: UserEmailAddress | null
  } & { userEmailAddresses: UserEmailAddress[] },
) {
  // Send unsubscribe payload if the old email address or phone number has changed, or if the user removed their old email or phone number.
  if (
    oldUser.primaryUserEmailAddress?.emailAddress !== primaryUserEmailAddress?.emailAddress ||
    oldUser.phoneNumber !== updatedUser.phoneNumber ||
    primaryUserEmailAddress === null ||
    (oldUser.phoneNumber && !updatedUser.phoneNumber)
  ) {
    const unsubscribePayload: UpsertAdvocateInCapitolCanaryPayloadRequirements = {
      campaignId: getCapitolCanaryCampaignID(CapitolCanaryCampaignName.DEFAULT_SUBSCRIBER),
      // Using old email here.
opts: {
        isEmailOptout:
          oldUser.primaryUserEmailAddress?.emailAddress !== primaryUserEmailAddress?.emailAddress ||
          primaryUserEmailAddress === null
            ? true
            : false,
        isSmsOptout:
          oldUser.phoneNumber !== updatedUser.phoneNumber ||
          (oldUser.phoneNumber && !updatedUser.phoneNumber)
            ? true
            : false,
      },
      
user: {
        ...updatedUser, // Always use new user information.
        address: updatedUser.address, // Always use new user information.
      }, 
      userEmailAddress: oldUser.primaryUserEmailAddress,
    }
    await inngest.send({
      data: unsubscribePayload,
      name: CAPITOL_CANARY_UPSERT_ADVOCATE_INNGEST_EVENT_NAME,
    })
  }

  // Only send updating payload if we do not have an SwC advocate ID
  // or there has been a changed field (name, address, email address, phone number, and opt-ins/outs),
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
      oldUser.hasOptedInToSms !== updatedUser.hasOptedInToSms) &&
    (primaryUserEmailAddress || updatedUser.phoneNumber)
  ) {
    const payload: UpsertAdvocateInCapitolCanaryPayloadRequirements = {
      campaignId: getCapitolCanaryCampaignID(CapitolCanaryCampaignName.DEFAULT_SUBSCRIBER),
      opts: {
        isEmailOptin: true,
        isSmsOptin: hasOptedInToSms,
        isSmsOptout: oldUser.hasOptedInToSms && !hasOptedInToSms, // Only opt-out of SMS if the user has opted in before and now they are opting out.
      },
      user: {
        ...updatedUser,
        address: updatedUser.address,
      },
      userEmailAddress: primaryUserEmailAddress,
    }
    await inngest.send({
      data: payload,
      name: CAPITOL_CANARY_UPSERT_ADVOCATE_INNGEST_EVENT_NAME,
    })
  }
}
