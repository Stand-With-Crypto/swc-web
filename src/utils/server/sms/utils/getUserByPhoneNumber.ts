import { prismaClient } from '@/utils/server/prismaClient'
import { normalizePhoneNumber } from '@/utils/shared/phoneNumber'

export async function getUserByPhoneNumber(phoneNumber: string) {
  const [user] = await prismaClient.user.findMany({
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
    take: 1,
  })

  return user
}
