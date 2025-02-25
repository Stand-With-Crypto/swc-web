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
import { getTenantId } from '@/utils/server/getTenantId'
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
import { createCountryCodeValidation } from '@/utils/server/userActionValidation/checkCountryCode'
import { withValidations } from '@/utils/server/userActionValidation/withValidations'
import {
  logCongressionalDistrictNotFound,
  maybeGetCongressionalDistrictFromAddress,
} from '@/utils/shared/getCongressionalDistrictFromAddress'
import { mapPersistedLocalUserToAnalyticsProperties } from '@/utils/shared/localUser'
import { getLogger } from '@/utils/shared/logger'
import { generateReferralId } from '@/utils/shared/referralId'
import { convertAddressToAnalyticsProperties } from '@/utils/shared/sharedAnalytics'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'
import { UserActionCallCampaignName } from '@/utils/shared/userActionCampaigns'
import { zodAddress } from '@/validation/fields/zodAddress'
import { zodDTSISlug } from '@/validation/fields/zodDTSISlug'
import { zodPhoneNumber } from '@/validation/fields/zodPhoneNumber'

const createActionCallCongresspersonInputValidationSchema = object({
  phoneNumber: zodPhoneNumber,
  campaignName: nativeEnum(UserActionCallCampaignName),
  dtsiSlug: zodDTSISlug,
  address: zodAddress,
})

export type CreateActionCallCongresspersonInput = z.infer<
  typeof createActionCallCongresspersonInputValidationSchema
>

interface SharedDependencies {
  localUser: Awaited<ReturnType<typeof parseLocalUserFromCookies>>
  sessionId: Awaited<ReturnType<typeof getUserSessionId>>
  analytics: ReturnType<typeof getServerAnalytics>
  peopleAnalytics: ReturnType<typeof getServerPeopleAnalytics>
  hasRegisteredRatelimit: boolean
  tenantId: string
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

  const validatedInput = createActionCallCongresspersonInputValidationSchema.safeParse(input)
  if (!validatedInput.success) {
    return {
      errors: validatedInput.error.flatten().fieldErrors,
    }
  }

  const localUser = await parseLocalUserFromCookies()
  const sessionId = await getUserSessionId()
  const tenantId = await getTenantId()

  const userMatch = await getMaybeUserAndMethodOfMatch({
    prisma: {
      include: { primaryUserCryptoAddress: true, address: true },
    },
  })

  if (!userMatch.user) {
    await triggerRateLimiterAtMostOnce()
  }

  const user = userMatch.user || (await createUser({ localUser, sessionId, tenantId }))

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
    const usCongressionalDistrict = await maybeGetCongressionalDistrictFromAddress(
      validatedInput.data.address,
    )
    if ('notFoundReason' in usCongressionalDistrict) {
      logCongressionalDistrictNotFound({
        notFoundReason: usCongressionalDistrict.notFoundReason,
        address: validatedInput.data.address.formattedDescription,
        domain: 'actionCreateUserActionCallCongressperson',
      })
    }
    if ('districtNumber' in usCongressionalDistrict) {
      validatedInput.data.address.usCongressionalDistrict = `${usCongressionalDistrict.districtNumber}`
    }
  } catch (error) {
    logger.error('error getting `usCongressionalDistrict`:' + error)
    Sentry.captureException(error, {
      tags: {
        domain: 'actionCreateUserActionCallCongressperson',
        message: 'error getting usCongressionalDistrict',
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
    tenantId,
  })

  if (user.primaryUserCryptoAddress !== null) {
    await claimNFTAndSendEmailNotification(userAction, user.primaryUserCryptoAddress)
  }

  waitUntil(beforeFinish())
  return { user: getClientUser(updatedUser) }
}

async function createUser(
  sharedDependencies: Pick<SharedDependencies, 'localUser' | 'sessionId' | 'tenantId'>,
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
      tenantId: sharedDependencies.tenantId,
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
  tenantId,
}: {
  user: U
  isNewUser: boolean
  validatedInput: CreateActionCallCongresspersonInput
  userMatch: UserAndMethodOfMatch
  sharedDependencies: Pick<SharedDependencies, 'sessionId' | 'analytics' | 'peopleAnalytics'>
  tenantId: string
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
      tenantId,
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
