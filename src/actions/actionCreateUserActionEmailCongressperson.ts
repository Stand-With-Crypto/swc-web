'use server'
import { getClientUser } from '@/clientModels/clientUser/clientUser'
import { getMaybeUserAndMethodOfMatch } from '@/utils/server/getMaybeUserAndMethodOfMatch'
import { prismaClient } from '@/utils/server/prismaClient'
import {
  AnalyticsUserActionUserState,
  getServerAnalytics,
  getServerPeopleAnalytics,
} from '@/utils/server/serverAnalytics'
import {
  ServerLocalUser,
  mapLocalUserToUserDatabaseFields,
  parseLocalUserFromCookies,
} from '@/utils/server/serverLocalUser'
import { getUserSessionId } from '@/utils/server/serverUserSessionId'
import { mapPersistedLocalUserToAnalyticsProperties } from '@/utils/shared/localUser'
import { getLogger } from '@/utils/shared/logger'
import { convertAddressToAnalyticsProperties } from '@/utils/shared/sharedAnalytics'
import { zodUserActionFormEmailCongresspersonAction } from '@/validation/forms/zodUserActionFormEmailCongressperson'
import {
  Address,
  Prisma,
  User,
  UserActionType,
  UserCryptoAddress,
  UserEmailAddress,
  UserEmailAddressSource,
} from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import { subDays } from 'date-fns'
import 'server-only'
import { z } from 'zod'

const logger = getLogger(`actionCreateUserActionEmailCongressperson`)

type UserWithRelations = User & {
  primaryUserCryptoAddress: UserCryptoAddress | null
  userEmailAddresses: UserEmailAddress[]
  address: Address | null
}
type Input = z.infer<typeof zodUserActionFormEmailCongresspersonAction>

export async function actionCreateUserActionEmailCongressperson(input: Input) {
  logger.info('triggered')
  const userMatch = await getMaybeUserAndMethodOfMatch({
    include: { primaryUserCryptoAddress: true, userEmailAddresses: true, address: true },
  })
  logger.info(userMatch.user ? 'found user' : 'no user found')
  const sessionId = getUserSessionId()
  const validatedFields = zodUserActionFormEmailCongresspersonAction.safeParse(input)
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }
  logger.info('validated fields')

  const localUser = parseLocalUserFromCookies()
  const { user, userState } = await maybeUpsertUser({
    existingUser: userMatch.user,
    input: validatedFields.data,
    sessionId,
    localUser,
  })
  const analytics = getServerAnalytics({ userId: user.id, localUser })
  const peopleAnalytics = getServerPeopleAnalytics({ userId: user.id, localUser })
  if (localUser) {
    peopleAnalytics.setOnce(mapPersistedLocalUserToAnalyticsProperties(localUser.persisted))
  }
  logger.info('fetched/created user')
  const campaignName = validatedFields.data.campaignName
  const actionType = UserActionType.EMAIL
  let userAction = await prismaClient.userAction.findFirst({
    where: {
      datetimeCreated: {
        lte: subDays(new Date(), 1),
      },
      actionType,
      campaignName,
      userId: user.id,
    },
    include: {
      userActionEmail: true,
    },
  })
  if (userAction) {
    analytics.trackUserActionCreatedIgnored({
      actionType,
      campaignName,
      reason: 'Too Many Recent',
      creationMethod: 'On Site',
      userState,
      ...convertAddressToAnalyticsProperties(validatedFields.data.address),
    })
    Sentry.captureMessage(
      `duplicate ${actionType} user action for campaign ${campaignName} submitted`,
      { extra: { validatedFields, userAction }, user: { id: user.id } },
    )
    return { user: getClientUser(user) }
  }

  userAction = await prismaClient.userAction.create({
    data: {
      user: { connect: { id: user.id } },
      actionType: UserActionType.EMAIL,
      campaignName: validatedFields.data.campaignName,
      ...('userCryptoAddress' in userMatch
        ? {
            userCryptoAddress: { connect: { id: userMatch.userCryptoAddress.id } },
          }
        : { userSession: { connect: { id: sessionId } } }),
      userActionEmail: {
        create: {
          senderEmail: validatedFields.data.emailAddress,
          fullName: validatedFields.data.fullName,
          phoneNumber: validatedFields.data.phoneNumber,
          address: {
            connectOrCreate: {
              where: { googlePlaceId: validatedFields.data.address.googlePlaceId },
              create: validatedFields.data.address,
            },
          },
          userActionEmailRecipients: {
            createMany: {
              data: [
                {
                  dtsiSlug: validatedFields.data.dtsiSlug,
                },
              ],
            },
          },
        },
      },
    },
    include: {
      userActionEmail: true,
    },
  })
  analytics.trackUserActionCreated({
    actionType,
    campaignName,
    creationMethod: 'On Site',
    userState,
    ...convertAddressToAnalyticsProperties(validatedFields.data.address),
  })
  peopleAnalytics.set({
    ...convertAddressToAnalyticsProperties(validatedFields.data.address),
    // https://docs.mixpanel.com/docs/data-structure/user-profiles#reserved-user-properties
    $email: validatedFields.data.emailAddress,
    $phone: validatedFields.data.phoneNumber,
    $name: validatedFields.data.fullName,
  })

  // TODO actually trigger the logic to send the email to capital canary. We should be calling some Inngest function here

  logger.info('updated user')
  return { user: getClientUser(user) }
}

async function maybeUpsertUser({
  existingUser,
  input,
  sessionId,
  localUser,
}: {
  existingUser: UserWithRelations | null
  input: Input
  sessionId: string
  localUser: ServerLocalUser | null
}): Promise<{ user: UserWithRelations; userState: AnalyticsUserActionUserState }> {
  const { fullName, emailAddress, phoneNumber, address } = input

  if (existingUser) {
    const updatePayload: Prisma.UserUpdateInput = {
      ...(fullName && fullName !== existingUser.fullName && { fullName }),
      ...(phoneNumber && phoneNumber !== existingUser.phoneNumber && { phoneNumber }),
      ...(!existingUser.hasOptedInToEmails && { hasOptedInToEmail: true }),
      ...(emailAddress &&
        existingUser.userEmailAddresses.every(addr => addr.emailAddress !== emailAddress) && {
          userEmailAddresses: {
            create: {
              emailAddress,
              isVerified: false,
              source: UserEmailAddressSource.USER_ENTERED,
            },
          },
        }),
      ...(address &&
        existingUser.address?.googlePlaceId !== address.googlePlaceId && {
          address: {
            connectOrCreate: {
              where: { googlePlaceId: address.googlePlaceId },
              create: address,
            },
          },
        }),
    }
    const keysToUpdate = Object.keys(updatePayload)
    if (!keysToUpdate.length) {
      return { user: existingUser, userState: 'Existing' }
    }
    logger.info(`updating the following user fields ${keysToUpdate.join(', ')}`)
    const user = await prismaClient.user.update({
      where: { id: existingUser.id },
      data: updatePayload,
      include: {
        primaryUserCryptoAddress: true,
        userEmailAddresses: true,
        address: true,
      },
    })

    if (!user.primaryUserEmailAddressId && emailAddress) {
      const newEmail = user.userEmailAddresses.find(addr => addr.emailAddress === emailAddress)!
      logger.info(`updating primary email`)
      await prismaClient.user.update({
        where: { id: user.id },
        data: { primaryUserEmailAddressId: newEmail.id },
      })
      user.primaryUserEmailAddressId = newEmail.id
    }
    return { user, userState: 'Existing With Updates' }
  }
  const user = await prismaClient.user.create({
    include: {
      primaryUserCryptoAddress: true,
      userEmailAddresses: true,
      address: true,
    },
    data: {
      ...mapLocalUserToUserDatabaseFields(localUser),
      isPubliclyVisible: false,
      userSessions: { create: { id: sessionId } },
      hasOptedInToEmails: true,
      hasOptedInToMembership: false,
      hasOptedInToSms: false,
      fullName,
      phoneNumber,
      userEmailAddresses: {
        create: {
          emailAddress,
          isVerified: false,
          source: UserEmailAddressSource.USER_ENTERED,
        },
      },
      address: {
        connectOrCreate: {
          where: { googlePlaceId: address.googlePlaceId },
          create: address,
        },
      },
    },
  })
  const primaryUserEmailAddressId = user.userEmailAddresses[0].id
  await prismaClient.user.update({
    where: { id: user.id },
    data: {
      primaryUserEmailAddressId,
    },
  })
  user.primaryUserEmailAddressId = primaryUserEmailAddressId
  return { user, userState: 'New' }
}
