import { CommunicationType, UserCommunicationJourneyType } from '@prisma/client'
import { NonRetriableError } from 'inngest'

import { prismaClient } from '@/utils/server/prismaClient'

export type CreatedCommunicationJourney = Awaited<ReturnType<typeof createCommunicationJourney>>

export async function createCommunicationJourney(
  phoneNumber: string,
  journeyType: UserCommunicationJourneyType,
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

  const usersWithExistingCommunicationJourney = (
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

  await prismaClient.userCommunicationJourney.createMany({
    data: usersWithPhoneNumber
      .filter(id => !usersWithExistingCommunicationJourney.includes(id))
      .map(id => ({
        userId: id,
        journeyType,
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
      userId: true,
      userCommunications: {
        select: {
          messageId: true,
        },
      },
    },
  })
}

export async function createCommunication(
  communicationJourneys: CreatedCommunicationJourney,
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
