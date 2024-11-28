import {
  CommunicationMessageStatus,
  CommunicationType,
  Prisma,
  UserCommunicationJourneyType,
} from '@prisma/client'

import { prismaClient } from '@/utils/server/prismaClient'

// this journey types should have only one UserCommunicationJourney per user
const journeyTypesWithSingleJourney = [
  UserCommunicationJourneyType.GOODBYE_SMS,
  UserCommunicationJourneyType.UNSTOP_CONFIRMATION_SMS,
]

interface BulkCreateCommunicationJourneyPayload {
  journeyType: UserCommunicationJourneyType
  phoneNumber: string
  message?: {
    id: string
    status?: CommunicationMessageStatus
  }
  campaignName: string
  variantName?: string
}

export async function bulkCreateCommunicationJourney({
  campaignName,
  journeyType,
  message,
  phoneNumber,
  variantName,
}: BulkCreateCommunicationJourneyPayload) {
  const users = await prismaClient.user.findMany({
    where: {
      phoneNumber,
    },
    select: {
      id: true,
      phoneNumber: true,
    },
  })

  if (!campaignName && !journeyTypesWithSingleJourney.includes(journeyType)) {
    throw new Error(`Please inform a campaign name for journey ${journeyType}`)
  }

  const usersWithExistingCommunicationJourney = (
    await prismaClient.userCommunicationJourney.findMany({
      where: {
        userId: {
          in: users.map(({ id }) => id),
        },
        journeyType,
        campaignName,
        variantName,
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
        variantName,
      })),
  })

  const createdCommunicationJourneys = await prismaClient.userCommunicationJourney.findMany({
    where: {
      userId: {
        in: users.map(({ id }) => id),
      },
      journeyType,
      campaignName,
      variantName,
    },
    select: {
      id: true,
      userId: true,
    },
  })

  if (!message) return

  const createCommunicationPayload = users.map<Prisma.UserCommunicationCreateManyInput>(user => {
    const communicationJourney = createdCommunicationJourneys.find(
      ({ userId }) => userId === user.id,
    )

    if (!communicationJourney?.id) {
      throw new Error(`Couldn't find communicationJourney id for user ${user.id}`)
    }

    return {
      messageId: message.id,
      status: message.status,
      userCommunicationJourneyId: communicationJourney.id,
      communicationType: CommunicationType.SMS,
    }
  })

  await prismaClient.userCommunication.createMany({
    data: createCommunicationPayload,
  })
}
