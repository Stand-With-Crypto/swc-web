import { prismaClient } from '@/utils/server/prismaClient'
import { normalizePhoneNumber } from '@/utils/shared/phoneNumber'

export async function getUserByPhoneNumber(phoneNumber: string) {
  return prismaClient.user.findFirst({
    where: {
      phoneNumber: normalizePhoneNumber(phoneNumber),
    },
    orderBy: {
      datetimeUpdated: 'desc',
    },
    include: {
      userSessions: {
        orderBy: {
          datetimeUpdated: 'desc',
        },
        take: 1,
      },
    },
  })
}
