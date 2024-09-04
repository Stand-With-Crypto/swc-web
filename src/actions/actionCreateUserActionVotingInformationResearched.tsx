'use server'
import 'server-only'

import { SMSStatus, User, UserActionType, UserInformationVisibility } from '@prisma/client'
import { waitUntil } from '@vercel/functions'
import { nativeEnum, object, z } from 'zod'

import { getClientUser } from '@/clientModels/clientUser/clientUser'
import { getMaybeUserAndMethodOfMatch } from '@/utils/server/getMaybeUserAndMethodOfMatch'
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
import { mapPersistedLocalUserToAnalyticsProperties } from '@/utils/shared/localUser'
import { getLogger } from '@/utils/shared/logger'
import { generateReferralId } from '@/utils/shared/referralId'
import { convertAddressToAnalyticsProperties } from '@/utils/shared/sharedAnalytics'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'
import { UserActionVotingInformationResearchedCampaignName } from '@/utils/shared/userActionCampaigns'
import { zodAddress } from '@/validation/fields/zodAddress'

const createActionVotingInformationResearchedInputValidationSchema = object({
  campaignName: nativeEnum(UserActionVotingInformationResearchedCampaignName),
  shouldReceiveNotifications: z.boolean(),
  address: zodAddress,
})

export type CreateActionVotingInformationResearchedInput = z.infer<
  typeof createActionVotingInformationResearchedInputValidationSchema
>

const logger = getLogger('actionCreateUserActionVotingInformationResearched')

export const actionCreateUserActionVotingInformationResearched = withServerActionMiddleware(
  'actionCreateUserActionVotingInformationResearched',
  withValidations(
    [createCountryCodeValidation(DEFAULT_SUPPORTED_COUNTRY_CODE)],
    _actionCreateUserActionVotingInformationResearched,
  ),
)

async function _actionCreateUserActionVotingInformationResearched(
  input: CreateActionVotingInformationResearchedInput,
) {
  logger.info('triggered')
  const { triggerRateLimiterAtMostOnce } = getRequestRateLimiter({
    context: 'unauthenticated',
  })

  const validatedInput =
    createActionVotingInformationResearchedInputValidationSchema.safeParse(input)
  if (!validatedInput.success) {
    return {
      errors: validatedInput.error.flatten().fieldErrors,
    }
  }

  const localUser = parseLocalUserFromCookies()
  const sessionId = getUserSessionId()

  const actionType = UserActionType.VOTING_INFORMATION_RESEARCHED
  const campaignName = validatedInput.data.campaignName

  const userMatch = await getMaybeUserAndMethodOfMatch({
    prisma: {
      include: { primaryUserCryptoAddress: true, primaryUserEmailAddress: true, address: true },
    },
  })

  if (!userMatch.user) {
    await triggerRateLimiterAtMostOnce()
  }

  const user =
    userMatch.user ||
    (await createUser({ localUser, sessionId, address: validatedInput.data.address }))
  const isNewUser = !userMatch.user

  const peopleAnalytics = getServerPeopleAnalytics({
    localUser,
    userId: user.id,
  })
  const analytics = getServerAnalytics({
    userId: user.id,
    localUser,
  })
  const beforeFinish = () => Promise.all([analytics.flush(), peopleAnalytics.flush()])

  const existingVotingInformationResearchAction = await getExistingUserAction(
    user.id,
    validatedInput,
  )
  const existingActionAddress = {
    stateCode:
      existingVotingInformationResearchAction?.userActionVotingInformationResearched?.address
        ?.administrativeAreaLevel1 ?? null,
    congressionalDistrict:
      existingVotingInformationResearchAction?.userActionVotingInformationResearched?.address
        ?.usCongressionalDistrict ?? null,
  }
  const newAddress = {
    stateCode: validatedInput.data.address?.administrativeAreaLevel1 ?? null,
    congressionalDistrict: validatedInput.data.address?.usCongressionalDistrict ?? null,
  }

  if (existingVotingInformationResearchAction) {
    logger.info(
      `User ${user.id} has already researched voting information for ${validatedInput.data.campaignName}`,
    )

    const shouldUpdateAction =
      existingActionAddress.stateCode !== newAddress.stateCode ||
      existingActionAddress.congressionalDistrict !== newAddress.congressionalDistrict

    if (shouldUpdateAction) {
      const { updatedUser } = await updateAction({
        existingVotingInformationResearchAction,
        validatedInput,
      })

      analytics.trackUserActionUpdated({
        actionType,
        campaignName,
        creationMethod: 'On Site',
        userState: isNewUser ? 'New' : 'Existing With Updates',
      })

      waitUntil(beforeFinish())
      return { user: getClientUser(updatedUser) }
    }

    analytics.trackUserActionCreatedIgnored({
      actionType,
      campaignName,
      reason: 'Too Many Recent',
      userState: isNewUser ? 'New' : 'Existing With Updates',
      ...convertAddressToAnalyticsProperties(validatedInput.data.address),
    })
    waitUntil(beforeFinish())
    return { user: getClientUser(user) }
  }

  await triggerRateLimiterAtMostOnce()
  const { updatedUser } = await createActionAndUpdateUser({
    user,
    validatedInput,
    sessionId,
  })

  analytics.trackUserActionCreated({
    actionType,
    campaignName,
    userState: !userMatch.user ? 'New' : 'Existing',
    ...convertAddressToAnalyticsProperties(validatedInput.data.address),
  })
  peopleAnalytics.set({
    ...convertAddressToAnalyticsProperties(validatedInput.data.address),
  })

  waitUntil(beforeFinish())
  return { user: getClientUser(updatedUser) }
}

async function getExistingUserAction(
  userId: User['id'],
  validatedInput: z.SafeParseSuccess<CreateActionVotingInformationResearchedInput>,
) {
  return prismaClient.userAction.findFirst({
    where: {
      actionType: UserActionType.VOTING_INFORMATION_RESEARCHED,
      campaignName: validatedInput.data.campaignName,
      user: {
        id: userId,
      },
    },
    include: {
      userActionVotingInformationResearched: {
        include: {
          address: true,
        },
      },
    },
  })
}

async function createUser({
  localUser,
  sessionId,
  address,
}: {
  localUser: ReturnType<typeof parseLocalUserFromCookies>
  sessionId: ReturnType<typeof getUserSessionId>
  address?: z.infer<typeof zodAddress>
}) {
  const createdUser = await prismaClient.user.create({
    data: {
      referralId: generateReferralId(),
      informationVisibility: UserInformationVisibility.ANONYMOUS,
      userSessions: { create: { id: sessionId } },
      hasOptedInToEmails: false,
      hasOptedInToMembership: false,
      smsStatus: SMSStatus.NOT_OPTED_IN,
      ...(address
        ? {
            address: {
              connectOrCreate: {
                where: { googlePlaceId: address.googlePlaceId },
                create: address,
              },
            },
          }
        : {}),
      ...mapLocalUserToUserDatabaseFields(localUser),
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

async function createActionAndUpdateUser({
  user,
  validatedInput,
  sessionId,
}: {
  user: User
  validatedInput: z.SafeParseSuccess<CreateActionVotingInformationResearchedInput>
  sessionId: ReturnType<typeof getUserSessionId>
}) {
  const userAction = await prismaClient.userAction.create({
    data: {
      user: { connect: { id: user.id } },
      actionType: UserActionType.VOTING_INFORMATION_RESEARCHED,
      campaignName: validatedInput.data.campaignName,
      ...(user.primaryUserCryptoAddressId
        ? {
            userCryptoAddress: { connect: { id: user.primaryUserCryptoAddressId } },
          }
        : { userSession: { connect: { id: sessionId } } }),
      userActionVotingInformationResearched: {
        create: {
          shouldReceiveNotifications: validatedInput.data.shouldReceiveNotifications,
          address: {
            connectOrCreate: {
              where: { googlePlaceId: validatedInput.data.address.googlePlaceId },
              create: validatedInput.data.address,
            },
          },
        },
      },
    },
    include: {
      userActionVotingInformationResearched: true,
    },
  })

  const updatedUser = await prismaClient.user.update({
    where: { id: user.id },
    data: {
      address: {
        connectOrCreate: {
          where: { googlePlaceId: validatedInput.data.address.googlePlaceId },
          create: validatedInput.data.address,
        },
      },
    },
    include: {
      primaryUserCryptoAddress: true,
      address: true,
    },
  })
  logger.info('created user action and updated user')

  return { userAction, updatedUser }
}

async function updateAction({
  existingVotingInformationResearchAction,
  validatedInput,
}: {
  existingVotingInformationResearchAction: NonNullable<
    Awaited<ReturnType<typeof getExistingUserAction>>
  >
  validatedInput: z.SafeParseSuccess<CreateActionVotingInformationResearchedInput>
}) {
  const updatedAction = await prismaClient.userAction.update({
    where: { id: existingVotingInformationResearchAction.id },
    data: {
      userActionVotingInformationResearched: {
        update: {
          shouldReceiveNotifications: validatedInput.data.shouldReceiveNotifications,
          address: {
            connectOrCreate: {
              where: { googlePlaceId: validatedInput.data.address.googlePlaceId },
              create: validatedInput.data.address,
            },
          },
        },
      },
    },
    include: {
      userActionVotingInformationResearched: true,
    },
  })

  const updatedUser = await prismaClient.user.update({
    where: { id: existingVotingInformationResearchAction.userId },
    data: {
      address: {
        connectOrCreate: {
          where: { googlePlaceId: validatedInput.data.address.googlePlaceId },
          create: validatedInput.data.address,
        },
      },
    },
    include: {
      primaryUserCryptoAddress: true,
      address: true,
    },
  })

  logger.info('updated user action and user')
  return { updatedAction, updatedUser }
}
