import { CommunicationType, Prisma, UserCommunicationJourneyType } from '@prisma/client'
import { NonRetriableError } from 'inngest'

import { prismaClient } from '@/utils/server/prismaClient'

// this journey types should have only one UserCommunicationJourney per user
const journeyTypesWithSingleJourney = [
  UserCommunicationJourneyType.WELCOME_SMS,
  UserCommunicationJourneyType.GOODBYE_SMS,
  UserCommunicationJourneyType.UNSTOP_CONFIRMATION_SMS,
]

export const DEFAULT_CAMPAIGN_NAME = 'default'

export type BulkCreateCommunicationJourneyPayload = Record<
  string, // campaign name || DEFAULT_CAMPAIGN_NAME
  Array<{ phoneNumber: string; messageId: string }>
>

export async function bulkCreateCommunicationJourney(
  journeyType: UserCommunicationJourneyType,
  payload: BulkCreateCommunicationJourneyPayload,
) {
  const getCampaignName = (campaignName: string) =>
    campaignName === DEFAULT_CAMPAIGN_NAME ? undefined : campaignName

  for (const campaignKey of Object.keys(payload)) {
    const campaignName = getCampaignName(campaignKey)

    const users = await prismaClient.user.findMany({
      where: {
        phoneNumber: {
          in: payload[campaignKey].map(({ phoneNumber }) => phoneNumber),
        },
      },
      select: {
        id: true,
        phoneNumber: true,
      },
    })

    if (!campaignName && !journeyTypesWithSingleJourney.includes(journeyType)) {
      throw new NonRetriableError(`Please inform a campaign name for journey ${journeyType}`)
    }

    const usersWithExistingCommunicationJourney = (
      await prismaClient.userCommunicationJourney.findMany({
        where: {
          userId: {
            in: users.map(({ id }) => id),
          },
          journeyType,
          campaignName,
        },
        select: {
          userId: true,
        },
      })
    ).map(({ userId }) => userId)

    await prismaClient.userCommunicationJourney.createMany({
      data: users
        .filter(({ id }) => !usersWithExistingCommunicationJourney.includes(id))
        .map(({ id }) => ({
          journeyType,
          campaignName,
          userId: id,
        })),
    })

    const createdCommunicationJourneys = await prismaClient.userCommunicationJourney.findMany({
      where: {
        userId: {
          in: users.map(({ id }) => id),
        },
        journeyType,
        campaignName,
      },
      select: {
        id: true,
        userId: true,
      },
    })

    const createCommunicationPayload = users
      .map(user => {
        // Using phone number here because multiple users can have the same phone number
        const message = payload[campaignKey].find(
          ({ phoneNumber }) => phoneNumber === user.phoneNumber,
        )
        const communicationJourney = createdCommunicationJourneys.find(
          ({ userId }) => userId === user.id,
        )

        if (!message?.messageId || !communicationJourney?.id) {
          return
        }

        return {
          messageId: message.messageId,
          userCommunicationJourneyId: communicationJourney.id,
          communicationType: CommunicationType.SMS,
        }
      })
      .filter(communication => !!communication) as Prisma.UserCommunicationCreateManyArgs['data']

    await prismaClient.userCommunication.createMany({
      data: createCommunicationPayload,
    })
  }
}
