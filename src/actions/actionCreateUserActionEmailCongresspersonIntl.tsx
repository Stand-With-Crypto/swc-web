'use server'
import 'server-only'

import {
  Address,
  Prisma,
  SMSStatus,
  User,
  UserActionType,
  UserCryptoAddress,
  UserEmailAddress,
  UserEmailAddressSource,
  UserInformationVisibility,
} from '@prisma/client'
import { render } from '@react-email/components'
import * as Sentry from '@sentry/nextjs'
import { waitUntil } from '@vercel/functions'
import { z } from 'zod'

import { getClientUser } from '@/clientModels/clientUser/clientUser'
import { sendMail } from '@/utils/server/email'
import { IPPoolName } from '@/utils/server/email/sendMail'
import EmailToRepresentative from '@/utils/server/email/templates/emailToRepresentative'
import { getMaybeUserAndMethodOfMatch } from '@/utils/server/getMaybeUserAndMethodOfMatch'
import { getUserAccessLocationCookie } from '@/utils/server/getUserAccessLocationCookie'
import { prismaClient } from '@/utils/server/prismaClient'
import { getQuorumPoliticianByDTSIPerson } from '@/utils/server/quorum/getQuorumPoliticianFromDTSIPerson'
import { getRequestRateLimiter } from '@/utils/server/ratelimit/throwIfRateLimited'
import {
  AnalyticsUserActionUserState,
  getServerAnalytics,
  getServerPeopleAnalytics,
} from '@/utils/server/serverAnalytics'
import {
  mapLocalUserToUserDatabaseFields,
  parseLocalUserFromCookies,
  ServerLocalUser,
} from '@/utils/server/serverLocalUser'
import { getUserSessionId } from '@/utils/server/serverUserSessionId'
import { withServerActionMiddleware } from '@/utils/server/serverWrappers/withServerActionMiddleware'
import { createCountryCodeValidation } from '@/utils/server/userActionValidation/checkCountryCode'
import { withValidations } from '@/utils/server/userActionValidation/withValidations'
import { mapPersistedLocalUserToAnalyticsProperties } from '@/utils/shared/localUser'
import { getLogger } from '@/utils/shared/logger'
import { generateReferralId } from '@/utils/shared/referralId'
import { requiredOutsideLocalEnv } from '@/utils/shared/requiredEnv'
import { convertAddressToAnalyticsProperties } from '@/utils/shared/sharedAnalytics'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { userFullName } from '@/utils/shared/userFullName'
import { withSafeParseWithMetadata } from '@/utils/shared/zod'
import { zodUserActionFormEmailCongresspersonAction } from '@/validation/forms/zodUserActionFormEmailCongressperson'

const SENDGRID_SENDER_REP = requiredOutsideLocalEnv(
  process.env.SENDGRID_SENDER_REP,
  'SENDGRID_SENDER_REP',
  'Sendgrid Contact Your Rep Email Sends',
)

const logger = getLogger(`actionCreateUserActionEmailCongresspersonIntl`)

type UserWithRelations = User & {
  primaryUserCryptoAddress: UserCryptoAddress | null
  userEmailAddresses: UserEmailAddress[]
  address: Address | null
}
type Input = z.infer<typeof zodUserActionFormEmailCongresspersonAction>

export const actionCreateUserActionEmailCongresspersonIntl = withServerActionMiddleware(
  'actionCreateUserActionEmailCongresspersonIntl',
  withValidations(
    [
      createCountryCodeValidation([
        SupportedCountryCodes.AU,
        SupportedCountryCodes.CA,
        SupportedCountryCodes.GB,
      ]),
    ],
    _actionCreateUserActionEmailCongresspersonIntl,
  ),
)

async function _actionCreateUserActionEmailCongresspersonIntl(input: Input) {
  logger.info('triggered')
  const { triggerRateLimiterAtMostOnce } = getRequestRateLimiter({
    context: 'unauthenticated',
  })

  const userMatch = await getMaybeUserAndMethodOfMatch({
    prisma: {
      include: { primaryUserCryptoAddress: true, userEmailAddresses: true, address: true },
    },
  })
  logger.info(userMatch.user ? 'found user' : 'no user found')
  const sessionId = await getUserSessionId()
  const validatedFields = withSafeParseWithMetadata(
    zodUserActionFormEmailCongresspersonAction,
    input,
  )
  const countryCode = (await getUserAccessLocationCookie())!

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      errorsMetadata: validatedFields.errorsMetadata,
    }
  }
  logger.info('validated fields')

  const localUser = await parseLocalUserFromCookies()
  const { user, userState } = await maybeUpsertUser({
    existingUser: userMatch.user,
    input: validatedFields.data,
    sessionId,
    localUser,
    onUpsertUser: triggerRateLimiterAtMostOnce,
    countryCode,
  })

  const analytics = getServerAnalytics({ userId: user.id, localUser })
  const peopleAnalytics = getServerPeopleAnalytics({ userId: user.id, localUser })
  const beforeFinish = () => Promise.all([analytics.flush(), peopleAnalytics.flush()])

  if (localUser) {
    peopleAnalytics.setOnce(mapPersistedLocalUserToAnalyticsProperties(localUser.persisted))
  }
  logger.info('fetched/created user')
  const campaignName = validatedFields.data.campaignName
  const actionType = UserActionType.EMAIL
  let userAction = await prismaClient.userAction.findFirst({
    where: {
      actionType,
      campaignName,
      userId: user.id,
    },
    include: {
      userActionEmail: true,
    },
  })
  if (userAction && process.env.USER_ACTION_BYPASS_SPAM_CHECK !== 'true') {
    analytics.trackUserActionCreatedIgnored({
      actionType,
      campaignName,
      reason: 'Too Many Recent',
      creationMethod: 'On Site',
      userState,
      ...convertAddressToAnalyticsProperties(validatedFields.data.address),
    })
    waitUntil(beforeFinish())
    return { user: getClientUser(user) }
  }

  await triggerRateLimiterAtMostOnce()

  userAction = await prismaClient.userAction.create({
    data: {
      user: { connect: { id: user.id } },
      actionType,
      countryCode,
      campaignName: validatedFields.data.campaignName,
      ...('userCryptoAddress' in userMatch && userMatch.userCryptoAddress
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
              data: validatedFields.data.dtsiSlugs.map(dtsiSlug => ({ dtsiSlug })),
            },
          },
        },
      },
    },
    include: {
      userActionEmail: true,
    },
  })

  const quorumPoliticians = await Promise.all(
    validatedFields.data.dtsiPeople.map(person =>
      getQuorumPoliticianByDTSIPerson({
        person,
        countryCode,
      }),
    ),
  )
  const quorumPoliticianEmails = quorumPoliticians
    .map(politician => {
      if (politician && !politician?.email) {
        logger.warn(
          `Missing email address for representative ${politician.firstName} ${politician.lastName}`,
        )
        Sentry.captureMessage(
          `Missing email address for representative ${politician.firstName} ${politician.lastName}`,
          {
            extra: {
              politician,
              countryCode,
              dtsiSlugs: validatedFields.data.dtsiSlugs,
            },
            tags: {
              domain: `quorum`,
            },
            level: 'warning',
          },
        )
      }
      return politician?.email
    })
    .filter(Boolean)
  if (quorumPoliticianEmails.length === 0) {
    analytics.trackUserActionCreatedIgnored({
      actionType,
      campaignName,
      reason: 'Missing Quorum Email Address',
      creationMethod: 'On Site',
      userState,
      ...convertAddressToAnalyticsProperties(validatedFields.data.address),
    })
    logger.warn('No representatives emails found, skipping email & analytics')
    return { user: getClientUser(user) }
  }

  analytics.trackUserActionCreated({
    actionType,
    campaignName,
    'Recipient DTSI Slug': validatedFields.data.dtsiSlugs,
    creationMethod: 'On Site',
    userState,
    ...convertAddressToAnalyticsProperties(validatedFields.data.address),
  })
  peopleAnalytics.set({
    ...convertAddressToAnalyticsProperties(validatedFields.data.address),
    $email: validatedFields.data.emailAddress,
    $name: userFullName(validatedFields.data),
  })

  const html = await render(<EmailToRepresentative body={validatedFields.data.contactMessage} />)
  await Promise.all(
    quorumPoliticianEmails.map(email =>
      sendMail({
        countryCode,
        payload: {
          to: email,
          from: SENDGRID_SENDER_REP,
          ...(process.env.VERCEL_ENV === 'production' && {
            ip_pool_name: IPPoolName.REPRESENTATIVES,
          }),
          subject: validatedFields.data.subject,
          html,
          customArgs: {
            campaign: validatedFields.data.campaignName,
            userId: user.id,
          },
        },
      }),
    ),
  )

  waitUntil(beforeFinish())
  return { user: getClientUser(user) }
}

async function maybeUpsertUser({
  existingUser,
  input,
  sessionId,
  localUser,
  onUpsertUser,
  countryCode,
}: {
  existingUser: UserWithRelations | null
  input: Input
  sessionId: string
  localUser: ServerLocalUser | null
  onUpsertUser: () => Promise<void> | void
  countryCode: string
}): Promise<{ user: UserWithRelations; userState: AnalyticsUserActionUserState }> {
  const { firstName, lastName, emailAddress, address } = input

  if (existingUser) {
    const updatePayload: Prisma.UserUpdateInput = {
      ...(firstName && firstName !== existingUser.firstName && { firstName }),
      ...(lastName && lastName !== existingUser.lastName && { lastName }),
      ...(!existingUser.hasOptedInToEmails && { hasOptedInToEmails: true }),
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
      countryCode,
    }
    const keysToUpdate = Object.keys(updatePayload)
    if (!keysToUpdate.length) {
      return { user: existingUser, userState: 'Existing' }
    }
    logger.info(`updating the following user fields ${keysToUpdate.join(', ')}`)
    await onUpsertUser()
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
  await onUpsertUser()
  const user = await prismaClient.user.create({
    include: {
      primaryUserCryptoAddress: true,
      userEmailAddresses: true,
      address: true,
    },
    data: {
      ...mapLocalUserToUserDatabaseFields(localUser),
      referralId: generateReferralId(),
      informationVisibility: UserInformationVisibility.ANONYMOUS,
      userSessions: { create: { id: sessionId } },
      hasOptedInToEmails: true,
      hasOptedInToMembership: false,
      smsStatus: SMSStatus.NOT_OPTED_IN,
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
      countryCode,
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
