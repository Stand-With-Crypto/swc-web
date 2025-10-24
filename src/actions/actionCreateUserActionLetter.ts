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
import type PostGrid from 'postgrid-node'
import { z } from 'zod'

import { getClientUser } from '@/clientModels/clientUser/clientUser'
import { getMaybeUserAndMethodOfMatch } from '@/utils/server/getMaybeUserAndMethodOfMatch'
import { getUserAccessLocationCookie } from '@/utils/server/getUserAccessLocationCookie'
import { buildPostGridAddress } from '@/utils/server/postgrid/buildLetterAddress'
import { POSTGRID_STATUS_TO_LETTER_STATUS } from '@/utils/server/postgrid/contants'
import { sendLetter } from '@/utils/server/postgrid/sendLetter'
import { prismaClient } from '@/utils/server/prismaClient'
import { getQuorumPoliticianAddress } from '@/utils/server/quorum/getQuorumPoliticianAddress'
import { getQuorumPoliticianByDTSIPerson } from '@/utils/server/quorum/getQuorumPoliticianFromDTSIPerson'
import type { NormalizedQuorumAddress } from '@/utils/server/quorum/utils/fetchQuorum'
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

  const existingUserAction = await prismaClient.userAction.findFirst({
    where: {
      actionType,
      campaignName,
      userId: user.id,
    },
    include: {
      userActionLetter: true,
    },
  })

  if (existingUserAction && process.env.USER_ACTION_BYPASS_SPAM_CHECK !== 'true') {
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

  const address = await prismaClient.address.upsert({
    where: { googlePlaceId: validatedFields.data.address.googlePlaceId },
    create: validatedFields.data.address,
    update: validatedFields.data.address,
  })

  const recipientResultsWithNulls = await Promise.all(
    validatedFields.data.dtsiPeople.map(async dtsiPerson => {
      const idempotencyKey = `${user.id}:${campaignName}:${countryCode}:${dtsiPerson.slug}`

      const fromAddress = buildPostGridAddress(
        validatedFields.data.firstName,
        validatedFields.data.lastName,
        address,
      )

      const quorumPolitician = await getQuorumPoliticianByDTSIPerson({
        countryCode,
        person: dtsiPerson,
      })

      const addressData = quorumPolitician
        ? await getQuorumPoliticianAddress(quorumPolitician.id)
        : undefined

      if (!quorumPolitician || !isValidAddress(addressData?.officeAddress, addressData?.address)) {
        const errorMessage = !quorumPolitician
          ? `No Quorum politician match found for ${dtsiPerson.slug}`
          : `No valid office address available from Quorum for ${dtsiPerson.slug} (Quorum ID: ${quorumPolitician.id})`

        Sentry.captureException(new Error(errorMessage), {
          tags: {
            domain: 'actionCreateUserActionLetter',
            countryCode,
            issue: !quorumPolitician ? 'missing-quorum-politician-match' : 'missing-office-address',
          },
          extra: {
            dtsiSlug: dtsiPerson.slug,
            campaignName,
            ...(quorumPolitician && { quorumId: quorumPolitician.id }),
            ...(addressData && { addressData }),
          },
        })

        return null
      }

      const toAddress: PostGrid.Contacts.ContactCreateParams.ContactCreateWithFirstName = {
        firstName: dtsiPerson.firstName,
        lastName: dtsiPerson.lastName,
        addressLine1: addressData.officeAddress.street1 || addressData.address || '',
        countryCode,
        addressLine2: addressData.officeAddress.street2 || '',
        city: addressData.officeAddress.city || '',
        provinceOrState: addressData.officeAddress.state || '',
        postalOrZip: addressData.officeAddress.zipcode || '',
      }

      const letter = await sendLetter({
        to: toAddress,
        from: fromAddress,
        templateId: 'template_iUD4isUdA8kz8BpCc3c6F3', // TODO: Add template ID
        idempotencyKey,
        metadata: {
          userId: user.id,
          campaignName,
          countryCode,
          dtsiSlug: dtsiPerson.slug,
        },
      })

      return {
        letter,
        dtsiPerson,
        recipientAddress: addressData.address!, // Safe: validated above
      }
    }),
  )

  const recipientResults = recipientResultsWithNulls.filter(
    (result): result is NonNullable<typeof result> => result !== null,
  )

  if (recipientResults.length === 0) {
    logger.warn('No valid politician addresses found for any recipients')
    waitUntil(beforeFinish())
    return { user: getClientUser(user) }
  }

  await prismaClient.userAction.create({
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
          address: {
            connectOrCreate: {
              where: { googlePlaceId: validatedFields.data.address.googlePlaceId },
              create: validatedFields.data.address,
            },
          },
          userActionLetterRecipients: {
            create: recipientResults.map(result => ({
              dtsiSlug: result.dtsiPerson.slug,
              officeAddress: result.recipientAddress,
              postgridOrderId: result?.letter?.trackingNumber || null,
              userActionLetterStatusUpdates: {
                create: {
                  status: result?.letter?.status
                    ? POSTGRID_STATUS_TO_LETTER_STATUS[result.letter.status]
                    : UserActionLetterStatus.UNKNOWN,
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
          userActionLetterRecipients: true,
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

const isValidAddress = (
  officeAddress: NormalizedQuorumAddress | null | undefined,
  fullAddress: string | null | undefined,
): officeAddress is NonNullable<NormalizedQuorumAddress> => {
  if (!officeAddress || !fullAddress) return false

  // Require essential fields for mailing
  const hasEssentialFields =
    !!officeAddress.street1 &&
    !!officeAddress.city &&
    !!officeAddress.state &&
    !!officeAddress.zipcode

  return hasEssentialFields
}
