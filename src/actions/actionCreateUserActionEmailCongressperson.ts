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
import { userFullName } from '@/utils/shared/userFullName'
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
  UserInformationVisibility,
} from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import { subDays } from 'date-fns'
import 'server-only'
import { z } from 'zod'
import {
  CapitolCanaryCampaignName,
  getCapitolCanaryCampaignID,
} from '@/utils/server/capitolCanary/campaigns'
import { EmailRepViaCapitolCanaryPayloadRequirements } from '@/utils/server/capitolCanary/payloadRequirements'
import { CAPITOL_CANARY_EMAIL_REP_INNGEST_EVENT_NAME } from '@/inngest/functions/emailRepViaCapitolCanary'
import { inngest } from '@/inngest/inngest'
import { throwIfRateLimited } from '@/utils/server/ratelimit/throwIfRateLimited'

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
  await throwIfRateLimited()
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
        gte: subDays(new Date(), 1),
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
      actionType,
      campaignName: validatedFields.data.campaignName,
      ...('userCryptoAddress' in userMatch
        ? {
            userCryptoAddress: { connect: { id: userMatch.userCryptoAddress.id } },
          }
        : { userSession: { connect: { id: sessionId } } }),
      userActionEmail: {
        create: {
          senderEmail: validatedFields.data.emailAddress,
          firstName: validatedFields.data.firstName,
          lastName: validatedFields.data.lastName,
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
    $name: userFullName(validatedFields.data),
  })

  /**
   * Send email via Capitol Canary, and add user to Capitol Canary email subscriber list.
   * Inngest will create a new advocate in Capitol Canary if we do not have the user's advocate ID, or will reuse an existing advocate.
   * By this point, the email address and physical address should have been added to our database.
   */
  const payload: EmailRepViaCapitolCanaryPayloadRequirements = {
    campaignId: getCapitolCanaryCampaignID(CapitolCanaryCampaignName.DEFAULT_EMAIL_REPRESENTATIVE),
    user: {
      ...user,
      address: user.address!,
    },
    userEmailAddress: user.userEmailAddresses.find(
      emailAddr => emailAddr.emailAddress === validatedFields.data.emailAddress,
    ),
    opts: {
      isEmailOptin: true,
    },
    emailSubject: 'Support Crypto', // This does not particularly matter for now as subject is currently overridden in the Capitol Canary admin settings.
    emailMessage: validatedFields.data.message,
  }
  await inngest.send({
    name: CAPITOL_CANARY_EMAIL_REP_INNGEST_EVENT_NAME,
    data: payload,
  })

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
  const { firstName, lastName, emailAddress, address } = input

  if (existingUser) {
    const updatePayload: Prisma.UserUpdateInput = {
      ...(firstName && firstName !== existingUser.firstName && { firstName }),
      ...(lastName && lastName !== existingUser.lastName && { lastName }),
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
      informationVisibility: UserInformationVisibility.ANONYMOUS,
      userSessions: { create: { id: sessionId } },
      hasOptedInToEmails: true,
      hasOptedInToMembership: false,
      hasOptedInToSms: false,
      firstName,
      lastName,
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
