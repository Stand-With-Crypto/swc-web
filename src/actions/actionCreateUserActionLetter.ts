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

  const recipientResults = await Promise.all(
    validatedFields.data.dtsiPeople.map(async dtsiPerson => {
      const idempotencyKey = `LETTER:${countryCode}:${campaignName}:${user.id}:${dtsiPerson.slug}`

      const fromAddress = buildPostGridAddress(
        validatedFields.data.firstName,
        validatedFields.data.lastName,
        address,
      )

      // Get Quorum politician to retrieve office address
      const quorumPolitician = await getQuorumPoliticianByDTSIPerson({
        countryCode,
        person: dtsiPerson,
      })

      let toAddress: PostGrid.Contacts.ContactCreateParams.ContactCreateWithFirstName
      let fullOfficeAddress: string

      if (quorumPolitician) {
        // Fetch full address data from Quorum
        const addressData = await getQuorumPoliticianAddress(quorumPolitician.id)

        if (addressData?.officeAddress) {
          // Use structured address components from Quorum
          toAddress = {
            firstName: dtsiPerson.firstName || 'Representative',
            lastName: dtsiPerson.lastName || 'Unknown',
            addressLine1: addressData.officeAddress.street1 || 'Parliament House',
            ...(addressData.officeAddress.street2 && {
              addressLine2: addressData.officeAddress.street2,
            }),
            city: addressData.officeAddress.city || 'Canberra',
            provinceOrState: addressData.officeAddress.state || 'ACT',
            postalOrZip: addressData.officeAddress.zipcode || '2600',
            countryCode: 'AU',
          }
          fullOfficeAddress = addressData.address || 'Address unavailable'
        } else {
          // Fallback if Quorum doesn't have structured address
          logger.warn(
            `No structured address from Quorum for ${dtsiPerson.slug}, using fallback`,
          )
          toAddress = buildFallbackAddress(dtsiPerson)
          fullOfficeAddress = 'Parliament House, Canberra, ACT 2600, Australia'
        }
      } else {
        // Fallback if no Quorum match found
        logger.warn(`No Quorum match for ${dtsiPerson.slug}, using fallback address`)
        toAddress = buildFallbackAddress(dtsiPerson)
        fullOfficeAddress = 'Parliament House, Canberra, ACT 2600, Australia'
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
        officeAddress: fullOfficeAddress,
      }
    }),
  )

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
              officeAddress: result.officeAddress,
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

function buildFallbackAddress(
  dtsiPerson: Input['dtsiPeople'][0],
): PostGrid.Contacts.ContactCreateParams.ContactCreateWithFirstName {
  return {
    firstName: dtsiPerson.firstName || 'Representative',
    lastName: dtsiPerson.lastName || 'Unknown',
    addressLine1: 'Parliament House',
    city: 'Canberra',
    provinceOrState: 'ACT',
    postalOrZip: '2600',
    countryCode: 'AU',
  }
}
