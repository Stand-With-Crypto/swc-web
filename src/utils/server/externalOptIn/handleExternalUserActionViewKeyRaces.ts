import {
  Address,
  User,
  UserActionType,
  UserCryptoAddress,
  UserEmailAddress,
  UserSession,
} from '@prisma/client'
import { waitUntil } from '@vercel/functions'
import { string, z } from 'zod'

import { getOrCreateSessionIdForUser } from '@/utils/server/externalOptIn/getOrCreateSessionIdForUser'
import { prismaClient } from '@/utils/server/prismaClient'
import { getServerAnalytics } from '@/utils/server/serverAnalytics'
import { getLocalUserFromUser } from '@/utils/server/serverLocalUser'
import {
  VerifiedSWCPartner,
  VerifiedSWCPartnerApiResponse,
} from '@/utils/server/verifiedSWCPartner/constants'
import {
  GetCongressionalDistrictFromAddressSuccess,
  maybeGetCongressionalDistrictFromAddress,
} from '@/utils/shared/getCongressionalDistrictFromAddress'
import { getLogger } from '@/utils/shared/logger'
import { UserActionViewKeyRacesCampaignName } from '@/utils/shared/userActionCampaigns'
import { US_STATE_CODE_TO_DISPLAY_NAME_MAP } from '@/utils/shared/usStateUtils'

export const zodExternalUserActionViewKeyRaces = z.object({
  userId: string(),
  sessionId: string(),
  usaState: string(),
  usCongressionalDistrict: string(),
  campaignName: string().optional(),
})

const logger = getLogger('handleExternalUserActionViewKeyRaces')

export enum ExternalUserActionViewKeyRacesResult {
  NEW_ACTION = 'new-action',
  EXISTING_ACTION = 'existing-action',
}

type UserWithRelations = User & {
  userEmailAddresses: UserEmailAddress[]
  userCryptoAddresses: UserCryptoAddress[]
  userSessions: Array<UserSession>
  address?: Address | null
}

type Input = z.infer<typeof zodExternalUserActionViewKeyRaces> & {
  partner?: VerifiedSWCPartner
}

export async function handleExternalUserActionViewKeyRaces(
  input: Input,
): Promise<VerifiedSWCPartnerApiResponse<ExternalUserActionViewKeyRacesResult>> {
  const {
    userId,
    sessionId,
    usaState,
    usCongressionalDistrict,
    campaignName = UserActionViewKeyRacesCampaignName['2024_ELECTION'],
  } = input
  const actionType = UserActionType.VIEW_KEY_RACES

  const userAddress = await getUserAddress(userId)
  const userAlreadyOptedIn = await getUserAlreadyOptedIn(userId)

  if (!userAlreadyOptedIn) {
    logger.info('User has not even opted in or does not exist')

    return {
      result: null,
      resultOptions: [],
      sessionId,
      userId,
    }
  }

  const currentUsaState = userAddress?.address?.administrativeAreaLevel1 ?? usaState

  const maybeCongressionalDistrict = (await maybeGetCongressionalDistrictFromAddress(
    { countryCode: 'US', formattedDescription: userAddress?.address?.formattedDescription ?? '' },
    { stateCode: currentUsaState as keyof typeof US_STATE_CODE_TO_DISPLAY_NAME_MAP },
  )) as GetCongressionalDistrictFromAddressSuccess

  const currentCongressionalDistrict =
    userAddress?.address?.usCongressionalDistrict ||
    usCongressionalDistrict ||
    maybeCongressionalDistrict?.districtNumber?.toString() ||
    null

  const existingViewKeyRacesAction = await getUserAlreadyViewedKeyRaces(userId)

  const user = userAlreadyOptedIn.user as UserWithRelations

  const localUser = getLocalUserFromUser(user)
  const analytics = getServerAnalytics({ userId: user.id, localUser })

  if (existingViewKeyRacesAction) {
    logger.info(`User ${userId} has already viewed key races`)

    const shouldUpdateActionWithAddressInfo =
      existingViewKeyRacesAction.userActionViewKeyRaces?.usaState !== currentUsaState ||
      existingViewKeyRacesAction.userActionViewKeyRaces?.usCongressionalDistrict !==
        currentCongressionalDistrict

    const areNewValuesPresent = currentUsaState !== null || currentCongressionalDistrict !== null

    if (shouldUpdateActionWithAddressInfo && areNewValuesPresent) {
      const updatedUserActionViewKeyRaces = await updateUserActionViewKeyRaces(
        existingViewKeyRacesAction,
        currentUsaState,
        currentCongressionalDistrict,
        campaignName,
      )

      analytics.trackUserActionUpdated({
        actionType,
        campaignName,
        creationMethod: input.partner ? 'Verified SWC Partner' : 'Third Party',
        userState: 'Existing With Updates',
      })

      waitUntil(analytics.flush())

      return {
        result: ExternalUserActionViewKeyRacesResult.NEW_ACTION,
        resultOptions: Object.values(ExternalUserActionViewKeyRacesResult),
        sessionId: await getOrCreateSessionIdForUser(updatedUserActionViewKeyRaces.user),
        userId: updatedUserActionViewKeyRaces.user.id,
      }
    }

    analytics.trackUserActionCreatedIgnored({
      actionType,
      campaignName,
      creationMethod: input.partner ? 'Verified SWC Partner' : 'Third Party',
      reason: 'Already Exists',
      userState: 'Existing',
    })
    waitUntil(analytics.flush())

    return {
      result: ExternalUserActionViewKeyRacesResult.EXISTING_ACTION,
      resultOptions: Object.values(ExternalUserActionViewKeyRacesResult),
      sessionId: await getOrCreateSessionIdForUser(user),
      userId: existingViewKeyRacesAction.user.id,
    }
  }

  logger.info(`Creating new action for user ${userId}`)

  const newUserActionViewKeyRaces = await createUserActionViewKeyRaces(
    userId,
    currentUsaState,
    currentCongressionalDistrict,
    campaignName,
  )

  analytics.trackUserActionCreated({
    actionType,
    campaignName,
    creationMethod: input.partner ? 'Verified SWC Partner' : 'Third Party',
    userState: 'New',
  })

  waitUntil(analytics.flush())

  return {
    result: ExternalUserActionViewKeyRacesResult.NEW_ACTION,
    resultOptions: Object.values(ExternalUserActionViewKeyRacesResult),
    sessionId: await getOrCreateSessionIdForUser(newUserActionViewKeyRaces.user),
    userId: newUserActionViewKeyRaces.user.id,
  }
}

async function updateUserActionViewKeyRaces(
  existingViewKeyRacesAction: Awaited<ReturnType<typeof getUserAlreadyViewedKeyRaces>>,
  usaState: string | null,
  usCongressionalDistrict: string | null,
  campaignName: string,
) {
  const updateData: Record<string, string | undefined> = {
    ...(usaState !== null && { usaState }),
    ...(usCongressionalDistrict !== null && { usCongressionalDistrict }),
  }

  return prismaClient.userAction.update({
    where: {
      id: existingViewKeyRacesAction?.id,
    },
    data: {
      campaignName,
      userActionViewKeyRaces: {
        update: updateData,
      },
    },
    include: {
      user: {
        include: {
          userSessions: true,
        },
      },
    },
  })
}

async function createUserActionViewKeyRaces(
  userId: string,
  usaState: string | null,
  usCongressionalDistrict: string | null,
  campaignName: string,
) {
  return prismaClient.userAction.create({
    include: {
      user: {
        include: {
          userSessions: true,
        },
      },
    },
    data: {
      actionType: UserActionType.VIEW_KEY_RACES,
      campaignName,
      userActionViewKeyRaces: {
        create: {
          usCongressionalDistrict,
          usaState,
        },
      },
      user: {
        connect: {
          id: userId,
        },
      },
    },
  })
}

async function getUserAlreadyViewedKeyRaces(userId: string) {
  return prismaClient.userAction.findFirst({
    where: {
      actionType: UserActionType.VIEW_KEY_RACES,
      user: {
        id: userId,
      },
    },
    include: {
      userActionViewKeyRaces: true,
      user: {
        include: {
          userSessions: true,
        },
      },
    },
  })
}

async function getUserAlreadyOptedIn(userId: string) {
  return prismaClient.userAction.findFirst({
    where: {
      actionType: UserActionType.OPT_IN,
      user: {
        id: userId,
      },
    },
    include: {
      user: true,
    },
  })
}

async function getUserAddress(userId: string) {
  return prismaClient.user.findFirst({
    where: {
      id: userId,
      address: {
        countryCode: 'US',
      },
    },
    select: {
      address: {
        select: {
          administrativeAreaLevel1: true,
          usCongressionalDistrict: true,
          formattedDescription: true,
          countryCode: true,
        },
      },
    },
  })
}
