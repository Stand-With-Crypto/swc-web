import { prismaClient } from '@/utils/server/prismaClient'
import { getUserSessionIdOnPageRouter } from '@/utils/server/serverUserSessionId'
import { getServerAnalytics, getServerPeopleAnalytics } from '@/utils/server/serverAnalytics'
import * as Sentry from '@sentry/nextjs'
import {
  ServerLocalUser,
  mapLocalUserToUserDatabaseFields,
  parseLocalUserFromCookiesForPageRouter,
} from '@/utils/server/serverLocalUser'
import { mapPersistedLocalUserToAnalyticsProperties } from '@/utils/shared/localUser'
import {
  CapitolCanaryInstance,
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
import { UpsertAdvocateInCapitolCanaryPayloadRequirements } from '@/utils/server/capitolCanary/payloadRequirements'
import { inngest } from '@/inngest/inngest'
import { CAPITOL_CANARY_UPSERT_ADVOCATE_INNGEST_EVENT_NAME } from '@/inngest/functions/upsertAdvocateInCapitolCanary'
import { getLogger } from '@/utils/shared/logger'
import { CREATE_CAPITOL_CANARY_ADVOCATE_INNGEST_EVENT_NAME } from '@/inngest/functions/createAdvocateInCapitolCanary'
import { mintPastActions } from '@/utils/server/airdrop'

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

const logger = getLogger('onLogin')

export async function onLogin(address: string, req: NextApiRequest): Promise<AuthSessionMetadata> {
  const logWithAddress = (message: string) => logger.info(`address ${address}: ${message}`)
  logWithAddress(`triggered`)
  const localUser = parseLocalUserFromCookiesForPageRouter(req)
  /**
   * Try and get the existing user linked to the provided crypto address.
   * Also fetch existing user's address if that information is available.
   */
  let existingUser = await prismaClient.user.findFirst({
    include: {
      address: true,
      primaryUserEmailAddress: true,
      userEmailAddresses: true,
    },
    where: { userCryptoAddresses: { some: { cryptoAddress: address } } },
  })
  logWithAddress(`existing user found`)
  // If a proper user already exists (e.g. has a crypto address associated with it), return the user.
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
  if (embeddedWalletEmailAddress) {
    logWithAddress(`found embedded wallet email address`)
  }
  existingUser = await prismaClient.user.findFirst({
    include: {
      address: true,
      primaryUserEmailAddress: true,
      userEmailAddresses: true,
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
  const sourceOfExistingUser = existingUser?.userEmailAddresses.find(
    addr => addr.emailAddress === embeddedWalletEmailAddress?.email,
  )
    ? 'email'
    : 'session'
  if (existingUser) {
    logWithAddress(`found existing user via ${sourceOfExistingUser}`)
  }
  /*
  The situation below will occur when:
  - a user logs in to multiple crypto wallets with the same session id
  - a user creates a web3 wallet with a verified email from CB and then creates an embedded wallet with the same email
  we should not associate those wallets with the same user. We could, but it would be confusing for the user and it's unclear whether that's their intent
  */
  if (existingUser && existingUser.primaryUserCryptoAddressId) {
    getServerAnalytics({ userId: existingUser.id, localUser }).track('Separate User Created', {
      Reason: 'Different Wallet Address',
      'New Crypto Wallet Address': address,
    })
    Sentry.captureMessage(
      'User found via verified email/session id unassociated from this crypto address',
      { extra: { embeddedWalletEmailAddress, address, userSessionId, existingUser } },
    )
    existingUser = null
  }
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
  logWithAddress(`user crypto address created`)

  if (existingUser !== null) {
    await mintPastActions(existingUser.id, userCryptoAddress.cryptoAddress)
  }

  let primaryUserEmailAddressId: null | string = null

  /**
   * If the authenticated crypto address came from a thirdweb embedded wallet, we want to create a user email address
   * and link it to the wallet so we know it's an embedded address
   */
  if (embeddedWalletEmailAddress) {
    const { email, wasCreated } = await upsertEmbeddedWalletEmailAddress(
      embeddedWalletEmailAddress,
      userCryptoAddress,
    )
    if (wasCreated) {
      logWithAddress(`user email address created from embedded wallet`)
    }

    // Always use the embedded wallet email address as the primary email address.
    primaryUserEmailAddressId = email.id

    // Note: we want to create if we don't have a SwC advocate ID,
    // and we want to update if the stored primary email address is different than the embedded wallet email address.
    if (
      !userCryptoAddress.user.capitolCanaryAdvocateId ||
      userCryptoAddress.user.capitolCanaryInstance === CapitolCanaryInstance.LEGACY ||
      existingUser?.primaryUserEmailAddress?.emailAddress !== email.emailAddress
    ) {
      const payload: UpsertAdvocateInCapitolCanaryPayloadRequirements = {
        campaignId: getCapitolCanaryCampaignID(CapitolCanaryCampaignName.DEFAULT_SUBSCRIBER),
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
        name: CAPITOL_CANARY_UPSERT_ADVOCATE_INNGEST_EVENT_NAME,
        data: payload,
      })
      logWithAddress(`metadata added to capital canary`)
    }
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
    logWithAddress(`opt in user action created`)
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
  let wasCreated = false
  if (!email) {
    email = await prismaClient.userEmailAddress.create({
      data: {
        isVerified: true,
        source: UserEmailAddressSource.THIRDWEB_EMBEDDED_AUTH,
        emailAddress: embeddedWalletEmailAddress.email.toLowerCase(),
        userId: userCryptoAddress.userId,
      },
    })
    wasCreated = true
  }
  await prismaClient.userCryptoAddress.update({
    where: { id: userCryptoAddress.id },
    data: {
      embeddedWalletUserEmailAddressId: email.id,
    },
  })
  return { email, wasCreated }
}
