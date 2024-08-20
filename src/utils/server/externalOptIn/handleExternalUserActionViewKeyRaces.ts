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
import { getServerAnalytics, getServerPeopleAnalytics } from '@/utils/server/serverAnalytics'
import { getLocalUserFromUser } from '@/utils/server/serverLocalUser'
import { VerifiedSWCPartner } from '@/utils/server/verifiedSWCPartner/constants'
import { mapPersistedLocalUserToAnalyticsProperties } from '@/utils/shared/localUser'
import { getLogger } from '@/utils/shared/logger'
import { UserActionOptInCampaignName } from '@/utils/shared/userActionCampaigns'

export const zodExternalUserActionViewKeyRaces = z.object({
  userId: string(),
  sessionId: string(),
  usCongressionalDistrict: string(),
  usaState: string(),
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

export type ExternalUserActionOptInResponse<ResultOptions extends string> = {
  result: ResultOptions
  resultOptions: ResultOptions[]
  sessionId: string
  userId: string
}

export async function handleExternalUserActionViewKeyRaces(
  input: Input,
): Promise<ExternalUserActionOptInResponse<ExternalUserActionViewKeyRacesResult>> {
  const {
    userId,
    sessionId,
    usCongressionalDistrict,
    usaState,
    campaignName = UserActionOptInCampaignName.DEFAULT,
  } = input
  const actionType = UserActionType.VIEW_KEY_RACES
  const existingAction = await prismaClient.userAction.findFirst({
    where: {
      actionType: UserActionType.VIEW_KEY_RACES,
      ...(usCongressionalDistrict && {
        userActionViewKeyRaces: {
          usCongressionalDistrict,
        },
      }),
      ...(usaState && {
        userActionViewKeyRaces: {
          usaState,
        },
      }),
      user: {
        id: userId,
        userSessions: {
          some: {
            id: sessionId,
          },
        },
      },
    },
    include: {
      user: {
        include: {
          userSessions: true,
        },
      },
      userActionViewKeyRaces: true,
    },
  })
  const user = existingAction?.user as UserWithRelations
  const localUser = getLocalUserFromUser(user)
  const analytics = getServerAnalytics({ userId: user.id, localUser })
  if (!existingAction?.user) {
    waitUntil(
      getServerPeopleAnalytics({ userId: user.id, localUser })
        .setOnce(mapPersistedLocalUserToAnalyticsProperties(localUser.persisted))
        .flush(),
    )
  }

  if (existingAction) {
    logger.info('User already has an existing action')
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
      userId: existingAction.user.id,
    }
  }

  logger.info('Creating new user action')
  const userAction = await prismaClient.userAction.create({
    include: {
      user: {
        include: {
          userSessions: true,
        },
      },
    },
    data: {
      actionType,
      campaignName: UserActionOptInCampaignName.DEFAULT,
      userActionViewKeyRaces: {
        create: {
          usCongressionalDistrict,
          usaState,
        },
      },
      user: { connect: { id: user.id } },
    },
  })

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
    sessionId: await getOrCreateSessionIdForUser(userAction.user),
    userId: userAction.user.id,
  }
}
