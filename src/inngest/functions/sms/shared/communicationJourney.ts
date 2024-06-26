import {
  CommunicationType,
  UserCommunication,
  UserCommunicationJourney,
  UserCommunicationJourneyType,
} from '@prisma/client'
import { NonRetriableError } from 'inngest'

import { prismaClient } from '@/utils/server/prismaClient'

export interface CommunicationJourney {
  id: UserCommunicationJourney['id']
  userCommunications: Array<{
    messageId: UserCommunication['messageId']
  }>
}

export async function createCommunicationJourney(
  phoneNumber: string,
  journeyType: UserCommunicationJourneyType,
): Promise<CommunicationJourney[]> {
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
      userCommunications: {
        select: {
          messageId: true,
        },
      },
    },
  })
}

export async function createCommunication(
  communicationJourneys: CommunicationJourney[],
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
