import { CommunicationType, Prisma, UserCommunicationJourneyType } from '@prisma/client'
import { NonRetriableError } from 'inngest'

import { prismaClient } from '@/utils/server/prismaClient'

// this journey types should have only one UserCommunicationJourney per user
const journeyTypesWithSingleJourney = [
  UserCommunicationJourneyType.GOODBYE_SMS,
  UserCommunicationJourneyType.UNSTOP_CONFIRMATION_SMS,
]

export const BULK_WELCOME_CAMPAIGN_NAME = 'bulk-welcome'

export type BulkCreateCommunicationJourneyPayload = Record<
  string, // campaign name || BULK_WELCOME_CAMPAIGN_NAME
  Array<{ phoneNumber: string; messageId: string }>
>

export async function bulkCreateCommunicationJourney(
  journeyType: UserCommunicationJourneyType,
  payload: BulkCreateCommunicationJourneyPayload,
) {
  for (const campaignName of Object.keys(payload)) {
    const users = await prismaClient.user.findMany({
      where: {
        phoneNumber: {
          in: payload[campaignName].map(({ phoneNumber }) => phoneNumber),
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
        const message = payload[campaignName].find(
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
