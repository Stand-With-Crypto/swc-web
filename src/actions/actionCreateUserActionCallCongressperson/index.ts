'use server'
import 'server-only'

import { SMSStatus, User, UserActionType, UserInformationVisibility } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import { waitUntil } from '@vercel/functions'
import { nativeEnum, object, z } from 'zod'

import { getClientUser } from '@/clientModels/clientUser/clientUser'
import {
  getMaybeUserAndMethodOfMatch,
  UserAndMethodOfMatch,
} from '@/utils/server/getMaybeUserAndMethodOfMatch'
import { getUserAccessLocationCookie } from '@/utils/server/getUserAccessLocationCookie'
import { claimNFTAndSendEmailNotification } from '@/utils/server/nft/claimNFT'
import { prismaClient } from '@/utils/server/prismaClient'
import { getRequestRateLimiter } from '@/utils/server/ratelimit/throwIfRateLimited'
import { getServerAnalytics, getServerPeopleAnalytics } from '@/utils/server/serverAnalytics'
import {
  mapLocalUserToUserDatabaseFields,
  parseLocalUserFromCookies,
} from '@/utils/server/serverLocalUser'
import { getUserSessionId } from '@/utils/server/serverUserSessionId'
import { withServerActionMiddleware } from '@/utils/server/serverWrappers/withServerActionMiddleware'
import { logElectoralZoneNotFound } from '@/utils/server/swcCivic/utils/logElectoralZoneNotFound'
import { createCountryCodeValidation } from '@/utils/server/userActionValidation/checkCountryCode'
import { withValidations } from '@/utils/server/userActionValidation/withValidations'
import { maybeGetElectoralZoneFromAddress } from '@/utils/shared/getElectoralZoneFromAddress'
import { mapPersistedLocalUserToAnalyticsProperties } from '@/utils/shared/localUser'
import { getLogger } from '@/utils/shared/logger'
import { generateReferralId } from '@/utils/shared/referralId'
import { convertAddressToAnalyticsProperties } from '@/utils/shared/sharedAnalytics'
import {
  DEFAULT_SUPPORTED_COUNTRY_CODE,
  SupportedCountryCodes,
} from '@/utils/shared/supportedCountries'
import { USUserActionCallCampaignName } from '@/utils/shared/userActionCampaigns/us/usUserActionCampaigns'
import { zodAddress } from '@/validation/fields/zodAddress'
import { zodDTSISlug } from '@/validation/fields/zodDTSISlug'
import { zodPhoneNumber } from '@/validation/fields/zodPhoneNumber'

const getCreateActionCallCongresspersonInputValidationSchema = (
  countryCode: SupportedCountryCodes,
) =>
  object({
    phoneNumber: zodPhoneNumber(countryCode),
    campaignName: nativeEnum(USUserActionCallCampaignName),
    dtsiSlug: zodDTSISlug,
    address: zodAddress,
  })

export type CreateActionCallCongresspersonInput = z.infer<
  ReturnType<typeof getCreateActionCallCongresspersonInputValidationSchema>
>

interface SharedDependencies {
  localUser: Awaited<ReturnType<typeof parseLocalUserFromCookies>>
  sessionId: Awaited<ReturnType<typeof getUserSessionId>>
  analytics: ReturnType<typeof getServerAnalytics>
  peopleAnalytics: ReturnType<typeof getServerPeopleAnalytics>
  hasRegisteredRatelimit: boolean
  countryCode: string
}

const logger = getLogger(`actionCreateUserActionCallCongressperson`)

export const actionCreateUserActionCallCongressperson = withServerActionMiddleware(
  'actionCreateUserActionCallCongressperson',
  withValidations(
    [createCountryCodeValidation(DEFAULT_SUPPORTED_COUNTRY_CODE)],
    _actionCreateUserActionCallCongressperson,
  ),
)

async function _actionCreateUserActionCallCongressperson(
  input: CreateActionCallCongresspersonInput,
) {
  logger.info('triggered')
  const { triggerRateLimiterAtMostOnce } = getRequestRateLimiter({
    context: 'unauthenticated',
  })

  const countryCode = await getUserAccessLocationCookie()

  const validatedInput =
    getCreateActionCallCongresspersonInputValidationSchema(countryCode).safeParse(input)
  if (!validatedInput.success) {
    return {
      errors: validatedInput.error.flatten().fieldErrors,
    }
  }

  const localUser = await parseLocalUserFromCookies()
  const sessionId = await getUserSessionId()

  const userMatch = await getMaybeUserAndMethodOfMatch({
    prisma: {
      include: { primaryUserCryptoAddress: true, address: true },
    },
  })

  if (!userMatch.user) {
    await triggerRateLimiterAtMostOnce()
  }

  const user = userMatch.user || (await createUser({ localUser, sessionId, countryCode }))

  const peopleAnalytics = getServerPeopleAnalytics({
    localUser,
    userId: user.id,
  })
  const analytics = getServerAnalytics({
    userId: user.id,
    localUser,
  })
  const beforeFinish = () => Promise.all([analytics.flush(), peopleAnalytics.flush()])

  const recentUserAction = await getRecentUserActionByUserId(user.id, validatedInput)
  if (recentUserAction) {
    logSpamActionSubmissions({
      validatedInput,
      sharedDependencies: { analytics },
    })
    waitUntil(beforeFinish())
    return { user: getClientUser(user) }
  }

  try {
    const electoralZone = await maybeGetElectoralZoneFromAddress({
      address: {
        ...validatedInput.data.address,
        googlePlaceId: validatedInput.data.address.googlePlaceId || null,
        latitude: validatedInput.data.address.latitude || null,
        longitude: validatedInput.data.address.longitude || null,
      },
    })
    if ('notFoundReason' in electoralZone || !electoralZone) {
      logElectoralZoneNotFound({
        address: validatedInput.data.address.formattedDescription,
        placeId: validatedInput.data.address.googlePlaceId,
        countryCode,
        notFoundReason: electoralZone.notFoundReason ?? 'ELECTORAL_ZONE_NOT_FOUND',
        domain: 'actionCreateUserActionCallCongressperson',
      })
    } else {
      validatedInput.data.address.electoralZone = electoralZone.zoneName
      if (electoralZone.administrativeArea) {
        validatedInput.data.address.swcCivicAdministrativeArea = electoralZone.administrativeArea
      }
    }
  } catch (error) {
    logger.error('error getting `electoralZone`:' + error)
    Sentry.captureException(error, {
      fingerprint: ['error getting electoralZone'],
      tags: {
        domain: 'actionCreateUserActionCallCongressperson',
      },
    })
  }

  await triggerRateLimiterAtMostOnce()
  const { userAction, updatedUser } = await createActionAndUpdateUser({
    user,
    isNewUser: !userMatch.user,
    validatedInput: validatedInput.data,
    userMatch,
    sharedDependencies: { sessionId, analytics, peopleAnalytics },
    countryCode,
  })

  if (user.primaryUserCryptoAddress !== null) {
    await claimNFTAndSendEmailNotification({
      userAction,
      userCryptoAddress: user.primaryUserCryptoAddress,
      countryCode,
    })
  }

  waitUntil(beforeFinish())
  return { user: getClientUser(updatedUser) }
}

async function createUser(
  sharedDependencies: Pick<SharedDependencies, 'localUser' | 'sessionId' | 'countryCode'>,
) {
  const { localUser, sessionId } = sharedDependencies
  const createdUser = await prismaClient.user.create({
    data: {
      referralId: generateReferralId(),
      informationVisibility: UserInformationVisibility.ANONYMOUS,
      userSessions: { create: { id: sessionId } },
      hasOptedInToEmails: false,
      hasOptedInToMembership: false,
      smsStatus: SMSStatus.NOT_OPTED_IN,
      ...mapLocalUserToUserDatabaseFields(localUser),
      countryCode: sharedDependencies.countryCode,
    },
    include: {
      primaryUserCryptoAddress: true,
      address: true,
    },
  })
  logger.info('created user')

  if (localUser?.persisted) {
    waitUntil(
      getServerPeopleAnalytics({ localUser, userId: createdUser.id })
        .setOnce(mapPersistedLocalUserToAnalyticsProperties(localUser.persisted))
        .flush(),
    )
  }

  return createdUser
}

async function getRecentUserActionByUserId(
  userId: User['id'],
  validatedInput: z.SafeParseSuccess<CreateActionCallCongresspersonInput>,
) {
  return prismaClient.userAction.findFirst({
    where: {
      actionType: UserActionType.CALL,
      campaignName: validatedInput.data.campaignName,
      userId: userId,
    },
  })
}

function logSpamActionSubmissions({
  validatedInput,
  sharedDependencies,
}: {
  validatedInput: z.SafeParseSuccess<CreateActionCallCongresspersonInput>
  sharedDependencies: Pick<SharedDependencies, 'analytics'>
}) {
  sharedDependencies.analytics.trackUserActionCreatedIgnored({
    actionType: UserActionType.CALL,
    campaignName: validatedInput.data.campaignName,
    reason: 'Too Many Recent',
    userState: 'Existing',
    ...convertAddressToAnalyticsProperties(validatedInput.data.address),
  })
}

async function createActionAndUpdateUser<U extends User>({
  user,
  validatedInput,
  userMatch,
  sharedDependencies,
  isNewUser,
  countryCode,
}: {
  user: U
  isNewUser: boolean
  validatedInput: CreateActionCallCongresspersonInput
  userMatch: UserAndMethodOfMatch
  sharedDependencies: Pick<SharedDependencies, 'sessionId' | 'analytics' | 'peopleAnalytics'>
  countryCode: string
}) {
  const userAction = await prismaClient.userAction.create({
    data: {
      user: { connect: { id: user.id } },
      actionType: UserActionType.CALL,
      campaignName: validatedInput.campaignName,
      ...('userCryptoAddress' in userMatch && userMatch.userCryptoAddress
        ? {
            userCryptoAddress: { connect: { id: userMatch.userCryptoAddress.id } },
          }
        : { userSession: { connect: { id: sharedDependencies.sessionId } } }),
      countryCode,
      userActionCall: {
        create: {
          recipientDtsiSlug: validatedInput.dtsiSlug,
          recipientPhoneNumber: validatedInput.phoneNumber,
          address: {
            connectOrCreate: {
              where: { googlePlaceId: validatedInput.address.googlePlaceId },
              create: validatedInput.address,
            },
          },
        },
      },
    },
    include: {
      userActionCall: true,
    },
  })
  const updatedUser = userAction.userActionCall!.addressId
    ? await prismaClient.user.update({
        where: { id: user.id },
        data: {
          address: {
            connect: {
              id: userAction.userActionCall!.addressId,
            },
          },
        },
        include: {
          primaryUserCryptoAddress: true,
          address: true,
        },
      })
    : user
  logger.info('created user action and updated user')

  sharedDependencies.analytics.trackUserActionCreated({
    actionType: UserActionType.CALL,
    campaignName: validatedInput.campaignName,
    'Recipient DTSI Slug': validatedInput.dtsiSlug,
    'Recipient Phone Number': validatedInput.phoneNumber,
    ...convertAddressToAnalyticsProperties(validatedInput.address),
    userState: isNewUser ? 'New' : 'Existing',
  })
  sharedDependencies.peopleAnalytics.set({
    ...convertAddressToAnalyticsProperties(validatedInput.address),
  })

  return { userAction, updatedUser }
}
