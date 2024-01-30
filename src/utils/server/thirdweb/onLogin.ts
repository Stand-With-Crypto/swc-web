import { prismaClient } from '@/utils/server/prismaClient'
import { getUserSessionIdOnPageRouter } from '@/utils/server/serverUserSessionId'
import { getServerAnalytics, getServerPeopleAnalytics } from '@/utils/server/serverAnalytics'
import {
  ServerLocalUser,
  mapLocalUserToUserDatabaseFields,
  parseLocalUserFromCookiesForPageRouter,
} from '@/utils/server/serverLocalUser'
import { mapPersistedLocalUserToAnalyticsProperties } from '@/utils/shared/localUser'
import {
  User,
  UserActionOptInType,
  UserActionType,
  UserCryptoAddress,
  UserEmailAddressSource,
  UserInformationVisibility,
} from '@prisma/client'
import {
  ThirdwebEmbeddedWalletMetadata,
  fetchEmbeddedWalletMetadataFromThirdweb,
} from '@/utils/server/thirdweb/fetchEmbeddedWalletMetadataFromThirdweb'
import { NextApiRequest } from 'next'
import { AuthSessionMetadata } from '@/utils/server/thirdweb/types'
import { AnalyticProperties } from '@/utils/shared/sharedAnalytics'
import _ from 'lodash'
import { UserActionOptInCampaignName } from '@/utils/shared/userActionCampaigns'
import {
  CapitolCanaryCampaignName,
  getCapitolCanaryCampaignID,
} from '@/utils/server/capitolCanary/campaigns'
import { CreateAdvocateInCapitolCanaryPayloadRequirements } from '@/utils/server/capitolCanary/payloadRequirements'
import { inngest } from '@/inngest/inngest'
import { CREATE_CAPITOL_CANARY_ADVOCATE_INNGEST_EVENT_NAME } from '@/inngest/functions/createAdvocateInCapitolCanary'

/*
The desired behavior of this function:
- If there is a user associated with this crypto address, return that user
- If not, we want to find any existing user in our system that has a session with the same id as the session id that was passed in the headers
  OR we want to find any existing user in our system that has a verified email address that matches the email address of the crypto address, if the address 
  is associated with a thirdweb embedded wallet.
    - This embedded wallet use cases is necessary for the scenario where a user signs up on the coinbase app, and then "signs in" on the SWC website later on.
      In this case, because we have confidence that coinbase verified the email, and TW verified the email, we can link the users
- If we find a user using the method above, create the crypto address and link it to the user
  If we don't find a user, create a new one and link the crypto address to it
- If there was an embedded wallet email address, link it to the existing user or the newly created user
*/
export async function onLogin(address: string, req: NextApiRequest): Promise<AuthSessionMetadata> {
  const localUser = parseLocalUserFromCookiesForPageRouter(req)
  /**
   * Try and get the existing user linked to the provided crypto address.
   * Also fetch existing user's address if that information is available.
   */
  let existingUser = await prismaClient.user.findFirst({
    include: {
      address: true,
    },
    where: { userCryptoAddresses: { some: { cryptoAddress: address } } },
  })
  if (existingUser) {
    trackUserLogin({
      existingUser,
      localUser,
      isNewlyCreatedUser: false,
    })
    return { userId: existingUser.id }
  }
  const userSessionId = getUserSessionIdOnPageRouter(req)
  const embeddedWalletEmailAddress = await fetchEmbeddedWalletMetadataFromThirdweb(address)
  existingUser = await prismaClient.user.findFirst({
    include: {
      address: true,
    },
    where: embeddedWalletEmailAddress
      ? {
          OR: [
            { userSessions: { some: { id: userSessionId } } },
            {
              userEmailAddresses: {
                some: { emailAddress: embeddedWalletEmailAddress.email, isVerified: true },
              },
            },
          ],
        }
      : { userSessions: { some: { id: userSessionId } } },
  })
  const userCryptoAddress = await prismaClient.userCryptoAddress.create({
    data: {
      cryptoAddress: address,
      user: existingUser
        ? { connect: { id: existingUser.id } }
        : {
            create: {
              informationVisibility: UserInformationVisibility.ANONYMOUS,
              hasOptedInToEmails: true,
              hasOptedInToMembership: false,
              hasOptedInToSms: false,
              ...mapLocalUserToUserDatabaseFields(localUser),
            },
          },
    },
    include: { user: true },
  })

  let primaryUserEmailAddressId: null | string = null

  /**
   * If the authenticated crypto address came from a thirdweb embedded wallet, we want to create a user email address
   * and link it to the wallet so we know it's an embedded address
   */
  if (embeddedWalletEmailAddress) {
    const email = await upsertEmbeddedWalletEmailAddress(
      embeddedWalletEmailAddress,
      userCryptoAddress,
    )
    if (!userCryptoAddress.user.primaryUserEmailAddressId) {
      primaryUserEmailAddressId = email.id
    }

    // Create subscriber advocate in Capitol Canary.
    const payload: CreateAdvocateInCapitolCanaryPayloadRequirements = {
      campaignId: getCapitolCanaryCampaignID(CapitolCanaryCampaignName.DEFAULT_MEMBERSHIP),
      user: {
        ...userCryptoAddress.user,
        address: existingUser?.address || null,
      },
      userEmailAddress: email,
      opts: {
        isEmailOptin: true,
      },
    }
    await inngest.send({
      name: CREATE_CAPITOL_CANARY_ADVOCATE_INNGEST_EVENT_NAME,
      data: payload,
    })
  }

  /**
   * Ensure subscriber opt-in user action exists for this logged-in user (user can be new or existing).
   * Create if opt-in action does not exist.
   */
  const existingOptInUserAction = await prismaClient.userAction.findFirst({
    where: {
      userId: userCryptoAddress.userId,
      campaignName: UserActionOptInCampaignName.DEFAULT,
      actionType: UserActionType.OPT_IN,
      userActionOptIn: {
        optInType: UserActionOptInType.SWC_SIGN_UP_AS_SUBSCRIBER,
      },
    },
  })
  if (!existingOptInUserAction) {
    await prismaClient.userAction.create({
      data: {
        user: { connect: { id: userCryptoAddress.userId } },
        actionType: UserActionType.OPT_IN,
        campaignName: UserActionOptInCampaignName.DEFAULT,
        userActionOptIn: {
          create: {
            optInType: UserActionOptInType.SWC_SIGN_UP_AS_SUBSCRIBER,
          },
        },
      },
    })
  }

  await prismaClient.user.update({
    where: { id: userCryptoAddress.userId },
    data: {
      primaryUserCryptoAddressId: userCryptoAddress.id,
      ...(primaryUserEmailAddressId ? { primaryUserEmailAddressId } : {}),
    },
  })
  trackUserLogin({
    existingUser: userCryptoAddress.user,
    localUser,
    isNewlyCreatedUser: !existingUser,
  })

  return { userId: userCryptoAddress.user.id }
}

function trackUserLogin({
  existingUser,
  localUser,
  isNewlyCreatedUser,
  props,
}: {
  existingUser: User
  isNewlyCreatedUser: boolean
  localUser: ServerLocalUser | null
  props?: AnalyticProperties
}) {
  if (isNewlyCreatedUser && localUser) {
    getServerPeopleAnalytics({ userId: existingUser.id, localUser }).setOnce(
      mapPersistedLocalUserToAnalyticsProperties(localUser.persisted),
    )
  }
  getServerAnalytics({ userId: existingUser.id, localUser }).track('User Logged In', {
    'Is First Time': isNewlyCreatedUser,
    ...props,
  })
  getServerPeopleAnalytics({ userId: existingUser.id, localUser }).set({
    'Datetime of Last Login': new Date(),
  })
}

async function upsertEmbeddedWalletEmailAddress(
  embeddedWalletEmailAddress: ThirdwebEmbeddedWalletMetadata,
  userCryptoAddress: UserCryptoAddress & { user: User },
) {
  let email = await prismaClient.userEmailAddress.findFirst({
    where: {
      emailAddress: embeddedWalletEmailAddress.email.toLowerCase(),
      userId: userCryptoAddress.userId,
    },
  })
  if (!email) {
    email = await prismaClient.userEmailAddress.create({
      data: {
        isVerified: true,
        source: UserEmailAddressSource.THIRDWEB_EMBEDDED_AUTH,
        emailAddress: embeddedWalletEmailAddress.email.toLowerCase(),
        userId: userCryptoAddress.userId,
      },
    })
  }
  await prismaClient.userCryptoAddress.update({
    where: { id: userCryptoAddress.id },
    data: {
      embeddedWalletUserEmailAddressId: email.id,
    },
  })
  return email
}
