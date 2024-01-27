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
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'
import {
  CapitolCanaryCampaignId,
  SandboxCapitolCanaryCampaignId,
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

  // Create subscriber advocate in Capitol Canary if primary email exists.
  if (primaryUserEmailAddress) {
    const campaignId: number =
      NEXT_PUBLIC_ENVIRONMENT === 'production'
        ? CapitolCanaryCampaignId.DEFAULT_SUBSCRIBER
        : SandboxCapitolCanaryCampaignId.DEFAULT_SUBSCRIBER
    const payload: CreateAdvocateInCapitolCanaryPayloadRequirements = {
      campaignId,
      user: {
        ...updatedUser,
        address,
      },
      userEmailAddress: primaryUserEmailAddress,
      opts: {
        isEmailOptin: true,
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
