'use server'
import * as Sentry from '@sentry/nextjs'
import { getMaybeUserAndMethodOfMatch } from '@/utils/server/getMaybeUserAndMethodOfMatch'
import { prismaClient } from '@/utils/server/prismaClient'
import { getUserSessionIdOnAppRouter } from '@/utils/server/serverUserSessionId'
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

const logger = getLogger(`actionCreateUserActionEmailCongressperson`)

export async function actionCreateUserActionEmailCongressperson(
  data: z.infer<typeof zodUserActionFormEmailCongresspersonAction>,
) {
  logger.info('triggered')
  const userMatch = await getMaybeUserAndMethodOfMatch({ include: { userCryptoAddress: true } })
  logger.info(userMatch.user ? 'found user' : 'no user found')
  const sessionId = getUserSessionIdOnAppRouter()
  const validatedFields = zodUserActionFormEmailCongresspersonAction.safeParse(data)
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }
  logger.info('validated fields')
  const localUser = parseLocalUserFromCookies()
  const analytics = getServerAnalytics({ ...userMatch, localUser })
  let user =
    userMatch.user ||
    (await prismaClient.user.create({
      data: {
        isPubliclyVisible: false,
        userSessions: { create: { id: sessionId } },
        ...mapLocalUserToUserDatabaseFields(localUser),
      },
      include: { userCryptoAddress: true },
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
      'Address Administrative Area Level 1': validatedFields.data.address.administrativeAreaLevel1,
      'Address Country Code': validatedFields.data.address.countryCode,
      'Address Locality': validatedFields.data.address.locality,
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
    'Address Administrative Area Level 1': validatedFields.data.address.administrativeAreaLevel1,
    'Address Country Code': validatedFields.data.address.countryCode,
    'Address Locality': validatedFields.data.address.locality,
  })
  const peopleAnalytics = getServerPeopleAnalytics({ ...userMatch, localUser })
  peopleAnalytics.set({
    'Address Administrative Area Level 1': validatedFields.data.address.administrativeAreaLevel1,
    'Address Country Code': validatedFields.data.address.countryCode,
    'Address Locality': validatedFields.data.address.locality,
    // https://docs.mixpanel.com/docs/data-structure/user-profiles#reserved-user-properties
    $email: validatedFields.data.email,
    $phone: validatedFields.data.phoneNumber,
    $name: validatedFields.data.fullName,
  })
  /*
  We assume any updates the user makes to this action should propagate to the user's profile
  */
  user = await prismaClient.user.update({
    where: { id: user.id },
    include: { userCryptoAddress: true },
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
  return { user, userAction }
}
