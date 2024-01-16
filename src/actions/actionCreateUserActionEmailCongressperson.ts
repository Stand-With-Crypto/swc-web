'use server'
import * as Sentry from '@sentry/nextjs'
import { getMaybeUserAndMethodOfMatch } from '@/utils/server/getMaybeUserAndMethodOfMatch'
import { prismaClient } from '@/utils/server/prismaClient'
import { getUserSessionId } from '@/utils/server/serverUserSessionId'
import { getLogger } from '@/utils/shared/logger'
import { zodUserActionFormEmailCongresspersonAction } from '@/validation/forms/zodUserActionFormEmailCongressperson'
import { UserActionType, UserEmailAddressSource } from '@prisma/client'
import { subDays } from 'date-fns'
import 'server-only'
import { z } from 'zod'
import { getServerAnalytics, getServerPeopleAnalytics } from '@/utils/server/severAnalytics'
import {
  mapLocalUserToUserDatabaseFields,
  parseLocalUserFromCookies,
} from '@/utils/server/serverLocalUser'
import { convertAddressToAnalyticsProperties } from '@/utils/shared/sharedAnalytics'

const logger = getLogger(`actionCreateUserActionEmailCongressperson`)

export async function actionCreateUserActionEmailCongressperson(
  data: z.infer<typeof zodUserActionFormEmailCongresspersonAction>,
) {
  logger.info('triggered')
  const userMatch = await getMaybeUserAndMethodOfMatch({
    include: { primaryUserCryptoAddress: true },
  })
  logger.info(userMatch.user ? 'found user' : 'no user found')
  const sessionId = getUserSessionId()
  const validatedFields = zodUserActionFormEmailCongresspersonAction.safeParse(data)
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }
  logger.info('validated fields')
  const localUser = parseLocalUserFromCookies()
  const analytics = getServerAnalytics({ ...userMatch, localUser })
  const user =
    userMatch.user ||
    (await prismaClient.user.create({
      data: {
        isPubliclyVisible: false,
        userSessions: { create: { id: sessionId } },
        ...mapLocalUserToUserDatabaseFields(localUser),
      },
    }))
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
      ...convertAddressToAnalyticsProperties(validatedFields.data.address),
    })
    Sentry.captureMessage(
      `duplicate ${actionType} user action for campaign ${campaignName} submitted`,
      { extra: { validatedFields, userAction }, user: { id: user.id } },
    )
    return { user, userAction }
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
          senderEmail: validatedFields.data.email,
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
    ...convertAddressToAnalyticsProperties(validatedFields.data.address),
  })
  const peopleAnalytics = getServerPeopleAnalytics({ ...userMatch, localUser })
  peopleAnalytics.set({
    ...convertAddressToAnalyticsProperties(validatedFields.data.address),
    // https://docs.mixpanel.com/docs/data-structure/user-profiles#reserved-user-properties
    $email: validatedFields.data.email,
    $phone: validatedFields.data.phoneNumber,
    $name: validatedFields.data.fullName,
  })
  /*
  We assume any updates the user makes to this action should propagate to the user's profile
  */
  const returnedUser = await prismaClient.user.update({
    where: { id: user.id },
    data: {
      fullName: validatedFields.data.fullName,
      phoneNumber: validatedFields.data.phoneNumber,
      address: {
        connect: {
          id: userAction.userActionEmail!.addressId,
        },
      },
      primaryUserEmailAddress: {
        connectOrCreate: {
          where: {
            address_userId: {
              address: validatedFields.data.email,
              userId: user.id,
            },
          },
          create: {
            address: validatedFields.data.email,
            isVerified: false,
            source: UserEmailAddressSource.USER_ENTERED,
            userId: user.id,
          },
        },
      },
    },
  })
  // TODO actually trigger the logic to send the email to capital canary. We should be calling some Inngest function here

  logger.info('updated user')
  return { user: returnedUser, userAction }
}
