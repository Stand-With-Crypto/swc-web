import { prismaClient } from '@/utils/server/prismaClient'
import { getUserSessionIdOnPageRouter } from '@/utils/server/serverUserSessionId'
import { getServerAnalytics, getServerPeopleAnalytics } from '@/utils/server/serverAnalytics'
import {
  ServerLocalUser,
  mapLocalUserToUserDatabaseFields,
  parseLocalUserFromCookiesForPageRouter,
} from '@/utils/server/serverLocalUser'
import { mapPersistedLocalUserToAnalyticsProperties } from '@/utils/shared/localUser'
import { User, UserCryptoAddress, UserEmailAddressSource } from '@prisma/client'
import {
  ThirdwebEmbeddedWalletMetadata,
  fetchEmbeddedWalletMetadataFromThirdweb,
} from '@/utils/server/thirdweb/fetchEmbeddedWalletMetadataFromThirdweb'
import { NextApiRequest } from 'next'
import { AuthSessionMetadata } from '@/utils/server/thirdweb/types'
import { AnalyticProperties } from '@/utils/shared/sharedAnalytics'

export async function onLogin(address: string, req: NextApiRequest): Promise<AuthSessionMetadata> {
  const localUser = parseLocalUserFromCookiesForPageRouter(req)
  // try and get the existing user linked to this cryptoAddress
  let existingUser = await prismaClient.user.findFirst({
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
  existingUser = await prismaClient.user.findFirst({
    where: { userSessions: { some: { id: userSessionId } } },
  })
  const userCryptoAddress = await prismaClient.userCryptoAddress.create({
    data: {
      cryptoAddress: address,
      user: existingUser
        ? { connect: { id: existingUser.id } }
        : {
            create: {
              isPubliclyVisible: false,
              hasOptedInToEmails: true,
              hasOptedInToMembership: false,
              hasOptedInToSms: false,
              ...mapLocalUserToUserDatabaseFields(localUser),
            },
          },
    },
    include: { user: true },
  })
  const embeddedWalletEmailAddress = await fetchEmbeddedWalletMetadataFromThirdweb(address)
  let primaryUserEmailAddressId: null | string = null
  /*
    If the authenticated crypto address came from a thirdweb embedded wallet, we want to create a user email address
    and link it to the wallet so we know it's an embedded address
    */
  if (embeddedWalletEmailAddress) {
    const email = await upsertEmbeddedWalletEmailAddress(
      embeddedWalletEmailAddress,
      userCryptoAddress,
    )
    if (!userCryptoAddress.user.primaryUserEmailAddressId) {
      primaryUserEmailAddressId = email.id
    }
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
