'use server'
import 'server-only'

import {
  Address,
  Prisma,
  SMSStatus,
  User,
  UserActionLetterStatus,
  UserActionType,
  UserCryptoAddress,
  UserEmailAddress,
  UserEmailAddressSource,
  UserInformationVisibility,
} from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import { waitUntil } from '@vercel/functions'
import { z } from 'zod'

import { getClientUser } from '@/clientModels/clientUser/clientUser'
import { getMaybeUserAndMethodOfMatch } from '@/utils/server/getMaybeUserAndMethodOfMatch'
import { getUserAccessLocationCookie } from '@/utils/server/getUserAccessLocationCookie'
import { buildPostGridAddress } from '@/utils/server/postgrid/buildLetterAddress'
import { createLetter } from '@/utils/server/postgrid/createLetter'
import { PostGridLetterAddress } from '@/utils/server/postgrid/types'
import { prismaClient } from '@/utils/server/prismaClient'
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
import { convertAddressToAnalyticsProperties } from '@/utils/shared/sharedAnalytics'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { userFullName } from '@/utils/shared/userFullName'
import { withSafeParseWithMetadata } from '@/utils/shared/zod'
import { zodUserActionFormLetterAction } from '@/validation/forms/zodUserActionFormLetter'

const actionType = UserActionType.LETTER

const logger = getLogger(`actionCreateUserActionLetter`)

type UserWithRelations = User & {
  primaryUserCryptoAddress: UserCryptoAddress | null
  userEmailAddresses: UserEmailAddress[]
  address: Address | null
}
type Input = z.infer<typeof zodUserActionFormLetterAction>

export const actionCreateUserActionLetter = withServerActionMiddleware(
  'actionCreateUserActionLetter',
  withValidations(
    [createCountryCodeValidation([SupportedCountryCodes.AU])],
    _actionCreateUserActionLetter,
  ),
)

async function _actionCreateUserActionLetter(input: Input) {
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
  const validatedFields = withSafeParseWithMetadata(zodUserActionFormLetterAction, input)
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

  // Check for existing action
  let userAction = await prismaClient.userAction.findFirst({
    where: {
      actionType,
      campaignName,
      userId: user.id,
    },
    include: {
      userActionLetter: true,
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

  // Get or create address
  const address = await prismaClient.address.upsert({
    where: { googlePlaceId: validatedFields.data.address.googlePlaceId },
    create: validatedFields.data.address,
    update: validatedFields.data.address,
  })

  // Build letter HTML content
  // TODO: Create a function to build the letter
  const getLetterHTML = (politicianName: string) => `
    <html>
      <body>
        <p>${validatedFields.data.letterPreview.replace(/\n/g, '</p><p>')}</p>
      </body>
    </html>
  `

  // Call PostGrid for each recipient FIRST
  const recipientResults = await Promise.all(
    validatedFields.data.dtsiPeople.map(async dtsiPerson => {
      const idempotencyKey = `LETTER:${countryCode}:${campaignName}:${user.id}:${dtsiPerson.slug}`

      // Build addresses
      const fromAddress = buildPostGridAddress(
        validatedFields.data.firstName,
        validatedFields.data.lastName,
        address,
      )

      // For politician address, we'll use a placeholder or fetch from DTSI if available
      // For now, using the advocate's address as a placeholder (you'll need to integrate with DTSI/Quorum for actual politician addresses)
      const toAddress: PostGridLetterAddress = {
        firstName: dtsiPerson.firstName || 'Representative',
        lastName: dtsiPerson.lastName || 'Unknown',
        addressLine1: 'Parliament House',
        city: 'Canberra',
        provinceOrState: 'ACT',
        postalOrZip: '2600',
        countryCode: 'AU',
      }

      const letterResult = await createLetter({
        to: toAddress,
        from: fromAddress,
        html: getLetterHTML(`${dtsiPerson.firstName} ${dtsiPerson.lastName}`),
        idempotencyKey,
        metadata: {
          userId: user.id,
          campaignName,
          countryCode,
          dtsiSlug: dtsiPerson.slug,
        },
      })

      return {
        dtsiSlug: dtsiPerson.slug,
        postgridLetterId: letterResult.letterId,
        status: letterResult.status,
        success: letterResult.success,
      }
    }),
  )

  // Create all database records in a single transaction
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
      userActionLetter: {
        create: {
          firstName: validatedFields.data.firstName,
          lastName: validatedFields.data.lastName,
          addressId: address.id,
          recipients: {
            create: recipientResults.map(result => ({
              dtsiSlug: result.dtsiSlug,
              postgridOrderId: result.postgridLetterId || null,
              addressId: address.id,
              statusHistory: {
                create: {
                  status: result.status
                    ? (result.status.toLowerCase() as UserActionLetterStatus)
                    : UserActionLetterStatus.READY,
                  postgridOrderId: result.postgridLetterId || null,
                },
              },
            })),
          },
        },
      },
    },
    include: {
      userActionLetter: {
        include: {
          recipients: true,
        },
      },
    },
  })

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
