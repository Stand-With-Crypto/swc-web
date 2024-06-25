import { UserCommunicationJourneyType } from '@prisma/client'
import { NonRetriableError } from 'inngest'

import { prismaClient } from '@/utils/server/prismaClient'

export async function createCommunicationJourney(
  phoneNumber: string,
  journeyType: UserCommunicationJourneyType,
) {
  const usersWithPhoneNumber = await prismaClient.user.findMany({
    where: {
      phoneNumber,
    },
    select: {
      id: true,
    },
  })

  if (usersWithPhoneNumber.length === 0) {
    throw new NonRetriableError('User not found')
  }

  const userIds = usersWithPhoneNumber.map(({ id }) => id)

  const existingCommunicationJourney = await prismaClient.userCommunicationJourney.findFirst({
    where: {
      userId: {
        in: userIds,
      },
      journeyType,
    },
  })

  if (existingCommunicationJourney) {
    throw new NonRetriableError('UserCommunicationJourney already exists')
  }

  await prismaClient.userCommunicationJourney.createMany({
    data: userIds.map(id => ({
      userId: id,
      journeyType,
    })),
  })

  return prismaClient.userCommunicationJourney.findMany({
    where: {
      userId: {
        in: userIds,
      },
      journeyType,
    },
    select: {
      id: true,
    },
  })
}
