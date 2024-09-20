'use server'

import {
  Address,
  CapitolCanaryInstance,
  DataCreationMethod,
  Prisma,
  SMSStatus,
  User,
  UserActionOptInType,
  UserActionType,
  UserCryptoAddress,
  UserEmailAddress,
  UserEmailAddressSource,
  UserInformationVisibility,
} from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import { waitUntil } from '@vercel/functions'
import { compact, groupBy } from 'lodash-es'
import { cookies } from 'next/headers'
import { VerifyLoginPayloadParams } from 'thirdweb/auth'

import { parseThirdwebAddress } from '@/hooks/useThirdwebAddress/parseThirdwebAddress'
import { CAPITOL_CANARY_UPSERT_ADVOCATE_INNGEST_EVENT_NAME } from '@/inngest/functions/capitolCanary/upsertAdvocateInCapitolCanary'
import { INITIAL_SIGNUP_USER_COMMUNICATION_JOURNEY_INNGEST_EVENT_NAME } from '@/inngest/functions/initialSignupUserCommunicationJourney/initialSignupUserCommunicationJourney'
import { inngest } from '@/inngest/inngest'
import {
  CapitolCanaryCampaignName,
  getCapitolCanaryCampaignID,
} from '@/utils/server/capitolCanary/campaigns'
import { UpsertAdvocateInCapitolCanaryPayloadRequirements } from '@/utils/server/capitolCanary/payloadRequirements'
import { mergeUsers } from '@/utils/server/mergeUsers/mergeUsers'
import { claimNFTAndSendEmailNotification } from '@/utils/server/nft/claimNFT'
import { mintPastActions } from '@/utils/server/nft/mintPastActions'
import { prismaClient } from '@/utils/server/prismaClient'
import {
  getServerAnalytics,
  getServerPeopleAnalytics,
  ServerAnalytics,
} from '@/utils/server/serverAnalytics'
import {
  mapLocalUserToUserDatabaseFields,
  parseLocalUserFromCookies,
  ServerLocalUser,
} from '@/utils/server/serverLocalUser'
import { getUserSessionId as _getUserSessionId } from '@/utils/server/serverUserSessionId'
import * as smsActions from '@/utils/server/sms/actions'
import {
  fetchEmbeddedWalletMetadataFromThirdweb,
  ThirdwebEmbeddedWalletMetadata,
} from '@/utils/server/thirdweb/fetchEmbeddedWalletMetadataFromThirdweb'
import { thirdwebAuth } from '@/utils/server/thirdweb/thirdwebAuthClient'
import { mapPersistedLocalUserToAnalyticsProperties } from '@/utils/shared/localUser'
import { logger } from '@/utils/shared/logger'
import { prettyLog } from '@/utils/shared/prettyLog'
import { generateReferralId } from '@/utils/shared/referralId'
import { THIRDWEB_AUTH_TOKEN_COOKIE_PREFIX } from '@/utils/shared/thirdwebAuthToken'
import { UserActionOptInCampaignName } from '@/utils/shared/userActionCampaigns'

type UpsertedUser = User & {
  address: Address | null
  primaryUserEmailAddress: UserEmailAddress | null
  userEmailAddresses: UserEmailAddress[]
  userCryptoAddresses: UserCryptoAddress[]
}

const getLog = (address: string) => (message: string) =>
  logger.info(`address ${address}: ${message}`)

export async function login(payload: VerifyLoginPayloadParams) {
  const verifiedPayload = await thirdwebAuth.verifyPayload(payload)

  if (!verifiedPayload.valid) return

  const { address } = payload.payload

  const cryptoAddress = parseThirdwebAddress(address)

  const localUser = parseLocalUserFromCookies()
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
      userActions: { some: { actionType: UserActionType.OPT_IN } },
    },
  })

  if (existingVerifiedUser) {
    log('existing verified user found')

    await onExistingUserLogin({
      existingVerifiedUser,
      cryptoAddress,
      localUser,
    })

    await Promise.all([
      getServerAnalytics({ userId: existingVerifiedUser.id, localUser })
        .track('User Logged In')
        .flush(),
      getServerPeopleAnalytics({ userId: existingVerifiedUser.id, localUser })
        .set({
          'Datetime of Last Login': new Date(),
        })
        .flush(),
    ])

    const jwt = await thirdwebAuth.generateJWT({
      payload: verifiedPayload.payload,
      context: {
        userId: existingVerifiedUser.id,
        address,
      },
    })

    cookies().set(THIRDWEB_AUTH_TOKEN_COOKIE_PREFIX, jwt)

    return
  }

  const decreaseCommunicationTimersCookie = cookies().get(
    'SWC_DECREASE_COMMUNICATION_TIMERS',
  )?.value

  const user = await onNewLogin({
    cryptoAddress,
    localUser,
    getUserSessionId: () => _getUserSessionId(),
    injectedFetchEmbeddedWalletMetadataFromThirdweb: fetchEmbeddedWalletMetadataFromThirdweb,
    decreaseCommunicationTimers: decreaseCommunicationTimersCookie === 'true',
  })
    .then(res => ({ userId: res.userId }))
    .catch(e => {
      Sentry.captureException(e, {
        tags: { domain: 'onLogin' },
        extra: { cryptoAddress, localUser },
      })
      throw e
    })

  const jwt = await thirdwebAuth.generateJWT({
    payload: verifiedPayload.payload,
    context: {
      userId: user.userId,
      address,
    },
  })

  cookies().set(THIRDWEB_AUTH_TOKEN_COOKIE_PREFIX, jwt)
}

type ExistingUserLoginParams = {
  existingVerifiedUser: User
  cryptoAddress: string
  localUser: ServerLocalUser | null
}

/**
 * Merges any existing users that have the same session id as the client that just logged in.
 */
async function onExistingUserLogin({
  existingVerifiedUser,
  cryptoAddress,
  localUser,
}: ExistingUserLoginParams) {
  const log = getLog(cryptoAddress)

  const { existingUsersWithSource } = await queryMatchingUsers({
    cryptoAddress,
    localUser,
    getUserSessionId: () => _getUserSessionId(),
    injectedFetchEmbeddedWalletMetadataFromThirdweb: fetchEmbeddedWalletMetadataFromThirdweb,
  })
  if (existingUsersWithSource.length === 0) {
    log('onExistingUserLogin: no users to merge')
    return
  }

  log(
    `onExistingUserLogin: proceeding with potential ${existingUsersWithSource.length} users to merge`,
  )
  const userToKeepId = existingVerifiedUser.id
  const merge = findUsersToMerge(existingUsersWithSource, {
    userToKeepId,
  })

  if (!merge?.usersToDelete?.length) {
    log('onExistingUserLogin: no users to merge')
    return
  }

  for (const userToDelete of merge.usersToDelete) {
    if (userToDelete.user.id === userToKeepId) {
      Sentry.captureMessage(
        'onExistingUserLogin: invalid logic, user to keep is the same as user to delete',
        { extra: { cryptoAddress, existingVerifiedUser, localUser } },
      )
      log(
        `onExistingUserLogin: user ${userToDelete.user.id} is the same as the user to keep ${userToKeepId}`,
      )
      continue
    }
    log(`onExistingUserLogin: merging user ${userToDelete.user.id} into user ${userToKeepId}`)
    await mergeUsers({
      persist: true,
      userToKeepId,
      userToDeleteId: userToDelete.user.id,
    })
  }
}

interface NewLoginParams {
  cryptoAddress: string
  localUser: ServerLocalUser | null
  getUserSessionId: () => string | null
  decreaseCommunicationTimers?: boolean
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

This logic governs all the user matching/creation/updating/merge logic that may occur when a user logs in to our website.
This logic only runs when a user logs in and we can't find a verified cryptoAddress to match the thirdweb-authenticated crypto address to
Below is the desired behavior of this function:

@function queryMatchingUsers:
find any existing users in our system that
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
  - if an `userToKeepId` is provided, it will be used as the user to keep and all other users will be merged into this user, according to the above logic
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

export async function onNewLogin(props: NewLoginParams) {
  const { cryptoAddress: _cryptoAddress, localUser } = props
  const cryptoAddress = parseThirdwebAddress(_cryptoAddress)
  const log = getLog(cryptoAddress)

  // queryMatchingUsers logic
  const { existingUsersWithSource, embeddedWalletUserDetails } = await queryMatchingUsers(props)
  if (existingUsersWithSource.length) {
    log(
      `queryMatchingUsers: found existing users:\n${Object.entries(
        groupBy(existingUsersWithSource, x => x.sourceOfExistingUser),
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
  const hasSignedInWithEmail =
    !!embeddedWalletUserDetails?.email && !embeddedWalletUserDetails?.phone

  if (!maybeUser) {
    log(`createUser: creating user`)
    maybeUser = await createUser({
      localUser,
      hasSignedInWithEmail,
      sessionId: props.getUserSessionId(),
    })
    wasUserCreated = true
  } else {
    log(`createUser: no users to create`)
  }
  let user: UpsertedUser = maybeUser

  const maybeUpsertCryptoAddressResult = await maybeUpsertCryptoAddress({
    user,
    localUser,
    cryptoAddress: cryptoAddress,
  })
  user = maybeUpsertCryptoAddressResult.user
  const userCryptoAddress =
    maybeUpsertCryptoAddressResult.updatedCryptoAddress ||
    maybeUpsertCryptoAddressResult.newCryptoAddress

  const maybeUpsertPhoneNumberResult =
    !hasSignedInWithEmail && embeddedWalletUserDetails?.phone
      ? await maybeUpsertPhoneNumber({
          user,
          embeddedWalletUserDetails,
        })
      : null

  if (maybeUpsertPhoneNumberResult) {
    user = maybeUpsertPhoneNumberResult.user
  }

  const maybeUpsertEmbeddedWalletEmailAddressResult =
    hasSignedInWithEmail && embeddedWalletUserDetails?.email
      ? await maybeUpsertEmbeddedWalletEmailAddress({
          user,
          cryptoAddressAssociatedWithEmail: userCryptoAddress,
          embeddedWalletUserDetails,
        })
      : null

  if (maybeUpsertEmbeddedWalletEmailAddressResult) {
    user = maybeUpsertEmbeddedWalletEmailAddressResult.user
  }

  const didCapitalCanaryUpsert =
    maybeUpsertEmbeddedWalletEmailAddressResult &&
    maybeUpsertEmbeddedWalletEmailAddressResult.email &&
    (await upsertCapitalCanaryAdvocate({
      cryptoAddress,
      user,
      updatedUsersPrimaryEmailAddress: Boolean(
        user.primaryUserEmailAddressId &&
          maybeUpsertEmbeddedWalletEmailAddressResult.originalUserPrimaryUserEmailAddressId !==
            user.primaryUserEmailAddressId,
      ),
    }))

  const peopleAnalytics = getServerPeopleAnalytics({ userId: user.id, localUser })
  const analytics = getServerAnalytics({ userId: user.id, localUser })
  const beforeFinish = () => Promise.all([analytics.flush(), peopleAnalytics.flush()])

  // triggerPostLoginUserActionSteps logic
  const postLoginUserActionSteps = await triggerPostLoginUserActionSteps({
    user,
    userCryptoAddress,
    localUser,
    wasUserCreated,
    analytics,
    sessionId: props.getUserSessionId(),
    embeddedWalletUserDetails,
    decreaseCommunicationTimers: props.decreaseCommunicationTimers,
  })

  if (localUser) {
    peopleAnalytics.setOnce(mapPersistedLocalUserToAnalyticsProperties(localUser.persisted))
  }

  analytics.track('User Logged In', {
    'Is First Time': true,
    'Existing Users Found Ids': existingUsersWithSource.map(x => x.user.id),
    'Existing Users Found Sources': existingUsersWithSource.map(x => x.sourceOfExistingUser),
    'Has Embedded Wallet Email Address': !!embeddedWalletUserDetails?.email,
    'Has Embedded Wallet Phone Number': !!embeddedWalletUserDetails?.phone,
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
  })
  peopleAnalytics.set({
    'Datetime of Last Login': new Date(),
  })

  waitUntil(beforeFinish())
  return {
    userId: user.id,
    user,
    existingUsersWithSource,
    embeddedWalletUserDetails,
    merge,
    wasUserCreated,
    maybeUpsertCryptoAddressResult,
    maybeUpsertEmbeddedWalletEmailAddressResult,
    maybeUpsertPhoneNumberResult,
    didCapitalCanaryUpsert,
    postLoginUserActionSteps,
    hasSignedInWithEmail,
  }
}

async function queryMatchingUsers({
  cryptoAddress,
  getUserSessionId,
  injectedFetchEmbeddedWalletMetadataFromThirdweb,
}: NewLoginParams) {
  const log = getLog(cryptoAddress)
  const userSessionId = getUserSessionId()
  const embeddedWalletUserDetails =
    await injectedFetchEmbeddedWalletMetadataFromThirdweb(cryptoAddress)
  if (embeddedWalletUserDetails) {
    log(`queryMatchingUsers: found embedded wallet user details`)
  }
  const existingUsers: UpsertedUser[] = await prismaClient.user.findMany({
    include: {
      address: true,
      primaryUserEmailAddress: true,
      userEmailAddresses: true,
      userCryptoAddresses: true,
    },
    where: {
      OR: compact([
        {
          userCryptoAddresses: {
            some: { cryptoAddress, hasBeenVerifiedViaAuth: false },
          },
        },
        userSessionId && { userSessions: { some: { id: userSessionId } } },
        embeddedWalletUserDetails?.email && {
          userEmailAddresses: {
            some: { emailAddress: embeddedWalletUserDetails.email, isVerified: true },
          },
        },
        embeddedWalletUserDetails?.email && {
          userEmailAddresses: {
            some: {
              emailAddress: embeddedWalletUserDetails.email,
              isVerified: false,
              dataCreationMethod: DataCreationMethod.INITIAL_BACKFILL,
            },
          },
        },
        embeddedWalletUserDetails?.phone && {
          phoneNumber: embeddedWalletUserDetails.phone,
          smsStatus: SMSStatus.OPTED_IN_HAS_REPLIED,
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
    const existingEmailAddressMatchedToEmbeddedWallet = embeddedWalletUserDetails?.email
      ? user.userEmailAddresses.find(addr => addr.emailAddress === embeddedWalletUserDetails.email)
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
  return { embeddedWalletUserDetails, existingUsersWithSource }
}

type FindUsersToMergeOptions = {
  userToKeepId?: string
}

function findUsersToMerge(
  existingUsersWithSource: Awaited<
    ReturnType<typeof queryMatchingUsers>
  >['existingUsersWithSource'],
  options: FindUsersToMergeOptions = {},
) {
  const { userToKeepId } = options

  if (!existingUsersWithSource.length) {
    return null
  }
  if (existingUsersWithSource.length === 1) {
    return { userToKeep: existingUsersWithSource[0], usersToDelete: [] }
  }

  logger.info(`findUsersToMerge: found ${existingUsersWithSource.length} users to merge`)
  prettyLog(existingUsersWithSource)

  const usersToMerge = existingUsersWithSource.filter(user => {
    if (user.sourceOfExistingUser === 'Unverified User Crypto Address') {
      return true
    }
    if (user.user.userCryptoAddresses.some(addr => addr.hasBeenVerifiedViaAuth)) {
      logger.info(
        `findUsersToMerge: found user with verified crypto address ${user.user.userCryptoAddresses[0].cryptoAddress}, not merging`,
      )
      return false
    }
    if (user.sourceOfExistingUser === 'Embedded Wallet Email Address') {
      return true
    }
    if (user.sourceOfExistingUser === 'Session Id') {
      return true
    }
  })

  const userToKeep =
    existingUsersWithSource.find(x => x.user.id === userToKeepId) ||
    usersToMerge.find(x => x.sourceOfExistingUser === 'Embedded Wallet Email Address') ||
    usersToMerge.find(x => x.sourceOfExistingUser === 'Unverified User Crypto Address') ||
    usersToMerge[0]

  const usersToDelete = usersToMerge.filter(x => x.user.id !== userToKeep.user.id)
  return { userToKeep, usersToDelete }
}

async function createUser({
  localUser,
  hasSignedInWithEmail,
  sessionId,
}: {
  localUser: ServerLocalUser | null
  hasSignedInWithEmail: boolean
  sessionId: string | null
}) {
  return prismaClient.user.create({
    include: {
      address: true,
      primaryUserEmailAddress: true,
      userEmailAddresses: true,
      userCryptoAddresses: true,
    },
    data: {
      informationVisibility: UserInformationVisibility.ANONYMOUS,
      hasOptedInToEmails: hasSignedInWithEmail,
      hasOptedInToMembership: false,
      smsStatus: SMSStatus.NOT_OPTED_IN,
      referralId: generateReferralId(),
      userSessions: {
        create: { id: sessionId ?? undefined },
      },
      ...mapLocalUserToUserDatabaseFields(localUser),
    },
  })
}

async function maybeUpsertPhoneNumber({
  user,
  embeddedWalletUserDetails,
}: {
  user: UpsertedUser
  embeddedWalletUserDetails: ThirdwebEmbeddedWalletMetadata
}) {
  const phoneNumber = embeddedWalletUserDetails.phone
  const smsStatus = SMSStatus.OPTED_IN_HAS_REPLIED

  const result = await prismaClient.user.update({
    where: { id: user.id },
    data: {
      smsStatus,
      phoneNumber,
    },

    include: {
      address: true,
      primaryUserEmailAddress: true,
      userEmailAddresses: true,
      userCryptoAddresses: true,
    },
  })

  return {
    user: result,
    phoneNumber,
    smsStatus,
  }
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
    addr => parseThirdwebAddress(addr.cryptoAddress) === cryptoAddress,
  )
  if (existingUserCryptoAddress) {
    if (existingUserCryptoAddress.hasBeenVerifiedViaAuth) {
      Sentry.captureMessage(
        'maybeUpsertCryptoAddress: invalid logic, we should only hit this point if the crypto address is unverified',
        { extra: { cryptoAddress, user, localUser } },
      )
    }
    log(`maybeUpsertCryptoAddress: updating existing crypto address to be verified`)
    await prismaClient.userCryptoAddress.update({
      where: { id: existingUserCryptoAddress.id },
      data: {
        hasBeenVerifiedViaAuth: true,
        asPrimaryUserCryptoAddress: { connect: { id: user.id } },
      },
    })
    existingUserCryptoAddress.hasBeenVerifiedViaAuth = true
    user.primaryUserCryptoAddressId = existingUserCryptoAddress.id
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
  embeddedWalletUserDetails,
}: {
  user: UpsertedUser
  cryptoAddressAssociatedWithEmail: UserCryptoAddress
  embeddedWalletUserDetails: ThirdwebEmbeddedWalletMetadata
}) {
  const log = getLog(cryptoAddressAssociatedWithEmail.cryptoAddress)
  let email = user.userEmailAddresses.find(
    addr => addr.emailAddress.toLowerCase() === embeddedWalletUserDetails.email?.toLowerCase(),
  )

  let wasCreated = false
  let updatedFields: Prisma.UserEmailAddressUncheckedUpdateInput | null = {}

  const originalUserPrimaryUserEmailAddressId = user.primaryUserEmailAddress?.id

  if (!email) {
    email = await prismaClient.userEmailAddress.create({
      data: {
        isVerified: true,
        source: UserEmailAddressSource.THIRDWEB_EMBEDDED_AUTH,
        emailAddress: embeddedWalletUserDetails.email!.toLowerCase(),
        userId: user.id,
        asPrimaryUserEmailAddress: { connect: { id: user.id } },
      },
    })
    log(`maybeUpsertEmbeddedWalletEmailAddress: user email address created from embedded wallet`)
    wasCreated = true
    updatedFields = null
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
  wasUserCreated,
  analytics,
  sessionId,
  embeddedWalletUserDetails,
  decreaseCommunicationTimers,
}: {
  wasUserCreated: boolean
  user: UpsertedUser
  userCryptoAddress: UserCryptoAddress
  localUser: ServerLocalUser | null
  analytics: ServerAnalytics
  sessionId: string | null
  embeddedWalletUserDetails: ThirdwebEmbeddedWalletMetadata | null
  decreaseCommunicationTimers?: boolean
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

    const signUpFlowExperimentVariant =
      localUser?.persisted?.experiments?.gh02_SWCSignUpFlowExperiment
    if (signUpFlowExperimentVariant === 'control') {
      await claimNFTAndSendEmailNotification(optInUserAction, userCryptoAddress)
    }

    if (embeddedWalletUserDetails?.phone) {
      await smsActions.optInUser(embeddedWalletUserDetails.phone, user)
    }

    analytics.trackUserActionCreated({
      actionType: UserActionType.OPT_IN,
      campaignName: UserActionOptInCampaignName.DEFAULT,
      creationMethod: 'On Site',
      userState: wasUserCreated ? 'New' : 'Existing',
    })

    const result = await inngest.send({
      name: INITIAL_SIGNUP_USER_COMMUNICATION_JOURNEY_INNGEST_EVENT_NAME,
      data: {
        userId: user.id,
        sessionId,
        decreaseTimers: decreaseCommunicationTimers,
      },
    })
    log(
      `triggerPostLoginUserActionSteps: initial signup communication journey triggered with inngest id: ${result.ids[0]}`,
    )
  } else {
    log(`triggerPostLoginUserActionSteps: opt in user action previously existed`)
  }
  const pastActionsMinted = await mintPastActions(user.id, userCryptoAddress, localUser)
  return { pastActionsMinted, hadOptInUserAction, optInUserAction }
}
