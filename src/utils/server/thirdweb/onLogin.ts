import {
  Address,
  CapitolCanaryInstance,
  DataCreationMethod,
  Prisma,
  User,
  UserActionOptInType,
  UserActionType,
  UserCryptoAddress,
  UserEmailAddress,
  UserEmailAddressSource,
  UserInformationVisibility,
} from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import _ from 'lodash'
import { NextApiRequest } from 'next'

import { CAPITOL_CANARY_UPSERT_ADVOCATE_INNGEST_EVENT_NAME } from '@/inngest/functions/upsertAdvocateInCapitolCanary'
import { inngest } from '@/inngest/inngest'
import {
  CapitolCanaryCampaignName,
  getCapitolCanaryCampaignID,
} from '@/utils/server/capitolCanary/campaigns'
import { UpsertAdvocateInCapitolCanaryPayloadRequirements } from '@/utils/server/capitolCanary/payloadRequirements'
import { mergeUsers } from '@/utils/server/mergeUsers/mergeUsers'
import { claimNFT } from '@/utils/server/nft/claimNFT'
import { mintPastActions } from '@/utils/server/nft/mintPastActions'
import { prismaClient } from '@/utils/server/prismaClient'
import {
  forceServerAnalyticsConfig,
  getServerAnalytics,
  getServerPeopleAnalytics,
} from '@/utils/server/serverAnalytics'
import {
  mapLocalUserToUserDatabaseFields,
  parseLocalUserFromCookiesForPageRouter,
  ServerLocalUser,
} from '@/utils/server/serverLocalUser'
import { getUserSessionIdOnPageRouter } from '@/utils/server/serverUserSessionId'
import {
  fetchEmbeddedWalletMetadataFromThirdweb,
  ThirdwebEmbeddedWalletMetadata,
} from '@/utils/server/thirdweb/fetchEmbeddedWalletMetadataFromThirdweb'
import { AuthSessionMetadata } from '@/utils/server/thirdweb/types'
import { mapPersistedLocalUserToAnalyticsProperties } from '@/utils/shared/localUser'
import { getLogger } from '@/utils/shared/logger'
import { prettyLog } from '@/utils/shared/prettyLog'
import { UserActionOptInCampaignName } from '@/utils/shared/userActionCampaigns'

const logger = getLogger('onLogin')
const getLog = (address: string) => (message: string) =>
  logger.info(`address ${address}: ${message}`)

type UpsertedUser = User & {
  address: Address | null
  primaryUserEmailAddress: UserEmailAddress | null
  userEmailAddresses: UserEmailAddress[]
  userCryptoAddresses: UserCryptoAddress[]
}

export async function onLogin(
  cryptoAddress: string,
  req: NextApiRequest,
): Promise<AuthSessionMetadata> {
  const localUser = parseLocalUserFromCookiesForPageRouter(req)
  const log = getLog(cryptoAddress)

  const existingVerifiedUser = await prismaClient.user.findFirst({
    include: {
      address: true,
      primaryUserEmailAddress: true,
      userEmailAddresses: true,
      userCryptoAddresses: true,
    },
    where: {
      userCryptoAddresses: { some: { cryptoAddress, hasBeenVerifiedViaAuth: true } },
    },
  })
  if (existingVerifiedUser) {
    log(`existing user found`)
    getServerAnalytics({ userId: existingVerifiedUser.id, localUser }).track('User Logged In')
    getServerPeopleAnalytics({ userId: existingVerifiedUser.id, localUser }).set({
      'Datetime of Last Login': new Date(),
    })
    return { userId: existingVerifiedUser.id }
  }
  return onNewLogin({
    cryptoAddress,
    localUser,
    getUserSessionId: () => getUserSessionIdOnPageRouter(req),
    injectedFetchEmbeddedWalletMetadataFromThirdweb: fetchEmbeddedWalletMetadataFromThirdweb,
  }).then(res => ({ userId: res.userId }))
}

interface Params {
  cryptoAddress: string
  localUser: ServerLocalUser | null
  getUserSessionId: () => string
  // dependency injecting this in to the function so we can mock it in tests
  injectedFetchEmbeddedWalletMetadataFromThirdweb: typeof fetchEmbeddedWalletMetadataFromThirdweb
}

/*
*****************************
*****************************
********* IMPORTANT *********
*****************************
*****************************
IF YOU MODIFY THIS FUNCTION, PLEASE VERIFY THE SMOKE TESTS IN "npm run ts src/bin/smokeTests/onNewLogin" PASS
*****************************
*****************************
********* IMPORTANT *********
*****************************
*****************************

This logic governs all the user matching/creation/updating/merge logic that may occur when a user logs in to our website. Below is the desired behavior of this function:

@function queryMatchingUsers:
If not, we want to find any existing users in our system that
- has a session with the same id as the session id that was passed in the headers
- OR has a verified email address that matches the embedded wallet email address of the crypto address (if the address is associated with a thirdweb embedded wallet)
  - This embedded wallet use case is necessary for the scenario where a user signs up on the coinbase app, and then "signs in" on the SWC website later on.
    In this case, because we have confidence that coinbase verified the email, and TW verified the email, we can link the users
- OR has an unverified crypto address that matches the crypto address that was passed in
  - This use case is necessary because some of our legacy user actions are associated with a crypto wallet, but that wallet wasn't necessarily verified
    (users previously requested a wallet to airdrop to)

@function findUsersToMerge:
If we find any users using the method above 
- we should merge them using the following logic:
  - any users found that match the unverified crypto address should be merged
  - any users found that match via verified email should be merged UNLESS the user already has a verified crypto address
  - any users found that match via session id should be merged UNLESS the user already has a verified crypto address
- situations we want to avoid merging (which is why we check for verified crypto address) because it would be confusing for the user and it's unclear whether that's their intent:
  - a user logs in to multiple crypto wallets with the same session id
  - a user creates a web3 wallet with a verified email from CB and then creates an embedded wallet with the same email
  
@function mergeUsers:
This function gets trigger if there are users to merge, and will:
- reassign all the actions to a single user
- delete any legacy users
- perform any capital canary clean up needed for the deleted users

@function createUser:
If we don't have a user at this point, create a new one

@function maybeUpsertCryptoAddress:
- If we have the existing crypto address (which should only occur if it was previously unverified), update it
- Otherwise create one and link it to the user

@function maybeUpsertEmbeddedWalletEmailAddress:
Now that we have an existing or new user, there's a bunch of upsert logic that we need to cover if they have a embedded wallet email address:
- If the user doesn't currently have a matching email address, we want to create one and link to crypto address
- If the user does currently have a matching email address, but its not linked to the crypto address, we need to link it
- We need to set this email as their primary

@function upsertCapitalCanaryAdvocate:
If the user isn't already in capital canary, or is but now has a new email address, we'll need to upsert them

@function triggerPostLoginUserActionSteps:
This function will ensure we create a user opt-in action if one does not already exist and will trigger any nft mints that need to occur
*/

export async function onNewLogin(props: Params) {
  const { cryptoAddress, localUser } = props
  const log = getLog(cryptoAddress)

  // queryMatchingUsers logic
  const { existingUsersWithSource, embeddedWalletEmailAddress } = await queryMatchingUsers(props)
  if (existingUsersWithSource.length) {
    log(
      `queryMatchingUsers: found existing users:\n${Object.entries(
        _.groupBy(existingUsersWithSource, x => x.sourceOfExistingUser),
      )
        .map(([key, val]) => `- ${key}: ${val.length}`)
        .join('\n')}`,
    )
  }

  // findUsersToMerge logic
  const merge = findUsersToMerge(existingUsersWithSource)
  let maybeUser: UpsertedUser | null = merge?.userToKeep?.user || null
  if (merge?.usersToDelete.length) {
    log(`findUsersToMerge: ${merge.usersToDelete.length} users to merge`)
    for (const userToDelete of merge.usersToDelete) {
      log(
        `findUsersToMerge: merging user ${userToDelete.user.id} into user ${merge.userToKeep.user.id}`,
      )
      await mergeUsers({
        persist: true,
        userToDeleteId: userToDelete.user.id,
        userToKeepId: merge.userToKeep.user.id,
      })
    }
    maybeUser = await prismaClient.user.findFirstOrThrow({
      where: { id: merge.userToKeep.user.id },
      include: {
        address: true,
        primaryUserEmailAddress: true,
        userEmailAddresses: true,
        userCryptoAddresses: true,
      },
    })
  } else {
    log(`findUsersToMerge: no users to merge`)
  }

  // createUser logic
  let wasUserCreated = false
  if (!maybeUser) {
    log(`createUser: creating user`)
    maybeUser = await createUser({ localUser })
    wasUserCreated = true
  } else {
    log(`createUser: no users to create`)
  }
  let user: UpsertedUser = maybeUser

  // maybeUpsertCryptoAddress logic
  const maybeUpsertCryptoAddressResult = await maybeUpsertCryptoAddress({
    user,
    localUser,
    cryptoAddress: cryptoAddress,
  })
  user = maybeUpsertCryptoAddressResult.user
  const userCryptoAddress =
    maybeUpsertCryptoAddressResult.updatedCryptoAddress ||
    maybeUpsertCryptoAddressResult.newCryptoAddress

  // maybeUpsertEmbeddedWalletEmailAddress logic
  const maybeUpsertEmbeddedWalletEmailAddressResult =
    embeddedWalletEmailAddress &&
    (await maybeUpsertEmbeddedWalletEmailAddress({
      user,
      cryptoAddressAssociatedWithEmail: userCryptoAddress,
      embeddedWalletEmailAddress,
    }))
  if (maybeUpsertEmbeddedWalletEmailAddressResult) {
    user = maybeUpsertEmbeddedWalletEmailAddressResult.user
  }

  // upsertCapitalCanaryAdvocate logic
  const didCapitalCanaryUpsert =
    maybeUpsertEmbeddedWalletEmailAddressResult &&
    (await upsertCapitalCanaryAdvocate({
      cryptoAddress,
      user,
      updatedUsersPrimaryEmailAddress: Boolean(
        user.primaryUserEmailAddressId &&
          maybeUpsertEmbeddedWalletEmailAddressResult.originalUserPrimaryUserEmailAddressId !==
            user.primaryUserEmailAddressId,
      ),
    }))

  // triggerPostLoginUserActionSteps logic
  const postLoginUserActionSteps = await triggerPostLoginUserActionSteps({
    user,
    userCryptoAddress,
    localUser,
  })
  if (localUser) {
    getServerPeopleAnalytics({ userId: user.id, localUser }).setOnce(
      mapPersistedLocalUserToAnalyticsProperties(localUser.persisted),
    )
  }

  getServerAnalytics(forceServerAnalyticsConfig({ userId: user.id, localUser })).track(
    'User Logged In',
    {
      'Is First Time': true,
      'Existing Users Found Ids': existingUsersWithSource.map(x => x.user.id),
      'Existing Users Found Sources': existingUsersWithSource.map(x => x.sourceOfExistingUser),
      'Has Embedded Wallet Email Address': !!embeddedWalletEmailAddress,
      'Users Deleted Ids': merge?.usersToDelete.map(x => x.user.id),
      'Was User Created': wasUserCreated,
      'User Crypto Address Result': maybeUpsertCryptoAddressResult.newCryptoAddress
        ? 'Created'
        : 'Updated',
      'User Email Address Result': maybeUpsertEmbeddedWalletEmailAddressResult?.wasCreated
        ? 'Created'
        : maybeUpsertEmbeddedWalletEmailAddressResult?.updatedFields
          ? 'Updated'
          : undefined,
      'Did Capital Canary Upsert': !!didCapitalCanaryUpsert,
      'Had Opt In User Action': postLoginUserActionSteps.hadOptInUserAction,
      'Count Past Actions Minted': postLoginUserActionSteps.pastActionsMinted.length,
    },
  )
  getServerPeopleAnalytics({ userId: user.id, localUser }).set({
    'Datetime of Last Login': new Date(),
  })

  return {
    userId: user.id,
    user,
    existingUsersWithSource,
    embeddedWalletEmailAddress,
    merge,
    wasUserCreated,
    maybeUpsertCryptoAddressResult,
    maybeUpsertEmbeddedWalletEmailAddressResult,
    didCapitalCanaryUpsert,
    postLoginUserActionSteps,
  }
}

async function queryMatchingUsers({
  cryptoAddress,
  getUserSessionId,
  injectedFetchEmbeddedWalletMetadataFromThirdweb,
}: Params) {
  const log = getLog(cryptoAddress)
  const userSessionId = getUserSessionId()
  const embeddedWalletEmailAddress =
    await injectedFetchEmbeddedWalletMetadataFromThirdweb(cryptoAddress)
  if (embeddedWalletEmailAddress) {
    log(`queryMatchingUsers: found embedded wallet email address`)
  }
  const existingUsers: UpsertedUser[] = await prismaClient.user.findMany({
    include: {
      address: true,
      primaryUserEmailAddress: true,
      userEmailAddresses: true,
      userCryptoAddresses: true,
    },
    where: {
      OR: _.compact([
        {
          userCryptoAddresses: {
            some: { cryptoAddress, hasBeenVerifiedViaAuth: false },
          },
        },
        { userSessions: { some: { id: userSessionId } } },
        embeddedWalletEmailAddress && {
          userEmailAddresses: {
            some: { emailAddress: embeddedWalletEmailAddress.email, isVerified: true },
          },
        },
        embeddedWalletEmailAddress && {
          userEmailAddresses: {
            some: {
              emailAddress: embeddedWalletEmailAddress.email,
              isVerified: false,
              dataCreationMethod: DataCreationMethod.INITIAL_BACKFILL,
            },
          },
        },
      ]),
    },
  })
  prettyLog(existingUsers)
  const existingUsersWithSource = existingUsers.map(user => {
    const existingUnverifiedUserCryptoAddress = user.userCryptoAddresses.find(
      addr => addr.cryptoAddress === cryptoAddress && !addr.hasBeenVerifiedViaAuth,
    )
    if (existingUnverifiedUserCryptoAddress) {
      return {
        user,
        sourceOfExistingUser: 'Unverified User Crypto Address' as const,
        existingUnverifiedUserCryptoAddress,
      }
    }
    const existingEmailAddressMatchedToEmbeddedWallet = embeddedWalletEmailAddress
      ? user.userEmailAddresses.find(addr => addr.emailAddress === embeddedWalletEmailAddress.email)
      : undefined
    if (existingEmailAddressMatchedToEmbeddedWallet) {
      return {
        user,
        sourceOfExistingUser: 'Embedded Wallet Email Address' as const,
        existingEmailAddressMatchedToEmbeddedWallet,
      }
    }
    return { user, sourceOfExistingUser: 'Session Id' as const }
  })
  return { embeddedWalletEmailAddress, existingUsersWithSource }
}

function findUsersToMerge(
  existingUsersWithSource: Awaited<
    ReturnType<typeof queryMatchingUsers>
  >['existingUsersWithSource'],
) {
  if (!existingUsersWithSource.length) {
    return null
  }
  if (existingUsersWithSource.length === 1) {
    return { userToKeep: existingUsersWithSource[0], usersToDelete: [] }
  }
  const usersToMerge = existingUsersWithSource.filter(user => {
    if (user.sourceOfExistingUser === 'Unverified User Crypto Address') {
      return true
    }
    if (user.sourceOfExistingUser === 'Embedded Wallet Email Address') {
      return !user.user.primaryUserCryptoAddressId
    }
    if (user.sourceOfExistingUser === 'Session Id') {
      return !user.user.primaryUserCryptoAddressId
    }
  })
  const userToKeep =
    usersToMerge.find(x => x.sourceOfExistingUser === 'Embedded Wallet Email Address') ||
    usersToMerge.find(x => x.sourceOfExistingUser === 'Unverified User Crypto Address') ||
    usersToMerge[0]
  const usersToDelete = usersToMerge.filter(x => x.user.id !== userToKeep.user.id)
  return { userToKeep, usersToDelete }
}

async function createUser({ localUser }: { localUser: ServerLocalUser | null }) {
  return prismaClient.user.create({
    include: {
      address: true,
      primaryUserEmailAddress: true,
      userEmailAddresses: true,
      userCryptoAddresses: true,
    },
    data: {
      informationVisibility: UserInformationVisibility.ANONYMOUS,
      hasOptedInToEmails: true,
      hasOptedInToMembership: false,
      hasOptedInToSms: false,
      ...mapLocalUserToUserDatabaseFields(localUser),
    },
  })
}

async function maybeUpsertCryptoAddress({
  user,
  localUser,
  cryptoAddress,
}: {
  cryptoAddress: string
  user: UpsertedUser
  localUser: ServerLocalUser | null
}) {
  const log = getLog(cryptoAddress)
  const existingUserCryptoAddress = user.userCryptoAddresses.find(
    addr => addr.cryptoAddress === cryptoAddress,
  )
  if (existingUserCryptoAddress) {
    if (existingUserCryptoAddress.hasBeenVerifiedViaAuth) {
      Sentry.captureMessage(
        'maybeUpsertCryptoAddress: invalid logic, we should only hit this point if the crypto address is unverified',
        { extra: { cryptoAddress, user, localUser } },
      )
    }
    if (user?.primaryUserCryptoAddressId) {
      Sentry.captureMessage(
        'maybeUpsertCryptoAddress: User had different primary primaryUserCryptoAddressId',
        { extra: { cryptoAddress, user, localUser } },
      )
    }
    log(`maybeUpsertCryptoAddress: updating existing crypto address to be verified`)
    await prismaClient.userCryptoAddress.update({
      where: { id: existingUserCryptoAddress.id },
      data: {
        hasBeenVerifiedViaAuth: true,
        ...(user.primaryUserCryptoAddressId
          ? {}
          : { asPrimaryUserCryptoAddress: { connect: { id: user.id } } }),
      },
    })
    existingUserCryptoAddress.hasBeenVerifiedViaAuth = true
    user.primaryUserCryptoAddressId =
      user.primaryUserCryptoAddressId || existingUserCryptoAddress.id
    return { user, updatedCryptoAddress: existingUserCryptoAddress }
  }
  log(`maybeUpsertCryptoAddress: creating new crypto address`)
  const newCryptoAddress = await prismaClient.userCryptoAddress.create({
    data: {
      cryptoAddress,
      hasBeenVerifiedViaAuth: true,
      user: { connect: { id: user.id } },
      asPrimaryUserCryptoAddress: { connect: { id: user.id } },
    },
    include: {
      user: {
        include: {
          address: true,
          primaryUserEmailAddress: true,
          userEmailAddresses: true,
          userCryptoAddresses: true,
        },
      },
    },
  })
  return { user, newCryptoAddress: newCryptoAddress }
}

async function maybeUpsertEmbeddedWalletEmailAddress({
  user,
  cryptoAddressAssociatedWithEmail,
  embeddedWalletEmailAddress,
}: {
  user: UpsertedUser
  cryptoAddressAssociatedWithEmail: UserCryptoAddress
  embeddedWalletEmailAddress: ThirdwebEmbeddedWalletMetadata
}) {
  const log = getLog(cryptoAddressAssociatedWithEmail.cryptoAddress)
  let email = user.userEmailAddresses.find(
    addr => addr.emailAddress.toLowerCase() === embeddedWalletEmailAddress.email.toLowerCase(),
  )
  let wasCreated = false
  let updatedFields: Prisma.UserEmailAddressUncheckedUpdateInput | null = {}
  const originalUserPrimaryUserEmailAddressId = user.primaryUserEmailAddress?.id
  if (!email) {
    email = await prismaClient.userEmailAddress.create({
      data: {
        isVerified: true,
        source: UserEmailAddressSource.THIRDWEB_EMBEDDED_AUTH,
        emailAddress: embeddedWalletEmailAddress.email.toLowerCase(),
        userId: user.id,
        asPrimaryUserEmailAddress: { connect: { id: user.id } },
      },
    })
    log(`maybeUpsertEmbeddedWalletEmailAddress: user email address created from embedded wallet`)
    wasCreated = true
  } else {
    log(
      `maybeUpsertEmbeddedWalletEmailAddress: user email address already existed for embedded wallet`,
    )
    if (user.primaryUserEmailAddressId !== email.id) {
      updatedFields.asPrimaryUserEmailAddress = { connect: { id: user.id } }
    }
    if (!email.isVerified) {
      updatedFields.isVerified = true
    }
    if (Object.keys(updatedFields).length) {
      log(
        `maybeUpsertEmbeddedWalletEmailAddress: user email address updated with the following fields: ${Object.keys(
          updatedFields,
        ).join(', ')}`,
      )
      email = await prismaClient.userEmailAddress.update({
        where: { id: email.id },
        data: updatedFields,
      })
    } else {
      updatedFields = null
    }
  }
  const result = await prismaClient.userCryptoAddress.update({
    where: { id: cryptoAddressAssociatedWithEmail.id },
    data: {
      embeddedWalletUserEmailAddressId: email.id,
    },
    include: {
      user: {
        include: {
          address: true,
          primaryUserEmailAddress: true,
          userEmailAddresses: true,
          userCryptoAddresses: true,
        },
      },
    },
  })
  return {
    email,
    updatedFields,
    wasCreated,
    user: result.user,
    originalUserPrimaryUserEmailAddressId,
  }
}

async function upsertCapitalCanaryAdvocate({
  cryptoAddress,
  user,
  updatedUsersPrimaryEmailAddress,
}: {
  cryptoAddress: string
  updatedUsersPrimaryEmailAddress: boolean
  user: UpsertedUser
}) {
  // Note: we want to create if we don't have a SwC advocate ID,
  // and we want to update if the stored primary email address is different than the embedded wallet email address.
  if (
    user.capitolCanaryAdvocateId &&
    user.capitolCanaryInstance !== CapitolCanaryInstance.LEGACY &&
    !updatedUsersPrimaryEmailAddress
  ) {
    return false
  }
  const payload: UpsertAdvocateInCapitolCanaryPayloadRequirements = {
    campaignId: getCapitolCanaryCampaignID(CapitolCanaryCampaignName.DEFAULT_SUBSCRIBER),
    user: {
      ...user,
      address: user.address || null,
    },
    userEmailAddress: user.primaryUserEmailAddress,
    opts: {
      isEmailOptin: true,
    },
  }
  await inngest.send({
    name: CAPITOL_CANARY_UPSERT_ADVOCATE_INNGEST_EVENT_NAME,
    data: payload,
  })
  getLog(cryptoAddress)(`upsertCapitalCanaryAdvocate: metadata added to capital canary`)
  return true
}

async function triggerPostLoginUserActionSteps({
  user,
  userCryptoAddress,
  localUser,
}: {
  user: UpsertedUser
  userCryptoAddress: UserCryptoAddress
  localUser: ServerLocalUser | null
}) {
  const log = getLog(userCryptoAddress.cryptoAddress)
  /**
   * Ensure subscriber opt-in user action exists for this logged-in user (user can be new or existing).
   * Create if opt-in action does not exist.
   */
  let optInUserAction = await prismaClient.userAction.findFirst({
    where: {
      userId: user.id,
      campaignName: UserActionOptInCampaignName.DEFAULT,
      actionType: UserActionType.OPT_IN,
      userActionOptIn: {
        optInType: UserActionOptInType.SWC_SIGN_UP_AS_SUBSCRIBER,
      },
    },
  })
  const hadOptInUserAction = !!optInUserAction
  if (!optInUserAction) {
    optInUserAction = await prismaClient.userAction.create({
      data: {
        user: { connect: { id: user.id } },
        actionType: UserActionType.OPT_IN,
        campaignName: UserActionOptInCampaignName.DEFAULT,
        userActionOptIn: {
          create: {
            optInType: UserActionOptInType.SWC_SIGN_UP_AS_SUBSCRIBER,
          },
        },
      },
    })
    log(`triggerPostLoginUserActionSteps: opt in user action created`)
    await claimNFT(optInUserAction, userCryptoAddress)
  } else {
    log(`triggerPostLoginUserActionSteps: opt in user action previously existed`)
  }
  const pastActionsMinted = await mintPastActions(user.id, userCryptoAddress, localUser)
  return { pastActionsMinted, hadOptInUserAction, optInUserAction }
}
