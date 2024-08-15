import { CommunicationType, UserCommunicationJourneyType } from '@prisma/client'
import { NonRetriableError } from 'inngest'

import { prismaClient } from '@/utils/server/prismaClient'

export type CreatedCommunicationJourneys = Awaited<ReturnType<typeof createCommunicationJourneys>>

// this journey types should have only one UserCommunicationJourney per user
const journeyTypesWithSingleJourney = [
  UserCommunicationJourneyType.WELCOME_SMS,
  UserCommunicationJourneyType.GOODBYE_SMS,
  UserCommunicationJourneyType.UNSTOP_CONFIRMATION_SMS,
]

export async function createCommunicationJourneys(
  phoneNumber: string,
  journeyType: UserCommunicationJourneyType,
  campaignName?: string,
) {
  const usersWithPhoneNumber = (
    await prismaClient.user.findMany({
      where: {
        phoneNumber,
      },
      select: {
        id: true,
      },
    })
  ).map(({ id }) => id)

  if (usersWithPhoneNumber.length === 0) {
    throw new NonRetriableError('User not found')
  }

  let usersWithExistingCommunicationJourney: string[] = []

  if (journeyTypesWithSingleJourney.includes(journeyType)) {
    usersWithExistingCommunicationJourney = (
      await prismaClient.userCommunicationJourney.findMany({
        where: {
          userId: {
            in: usersWithPhoneNumber,
          },
          journeyType,
        },
        select: {
          userId: true,
        },
      })
    ).map(({ userId }) => userId)
  }

  await prismaClient.userCommunicationJourney.createMany({
    data: usersWithPhoneNumber
      .filter(id => !usersWithExistingCommunicationJourney.includes(id))
      .map(id => ({
        userId: id,
        journeyType,
        campaignName,
      })),
  })

  return prismaClient.userCommunicationJourney.findMany({
    where: {
      userId: {
        in: usersWithPhoneNumber,
      },
      journeyType,
    },
    select: {
      id: true,
      userCommunications: {
        select: {
          messageId: true,
        },
      },
    },
  })
}

export async function createCommunication(
  communicationJourneys: CreatedCommunicationJourneys,
  messageId: string,
) {
  await prismaClient.userCommunication.createMany({
    data: communicationJourneys.map(({ id }) => ({
      communicationType: CommunicationType.SMS,
      messageId,
      userCommunicationJourneyId: id,
    })),
  })
}
