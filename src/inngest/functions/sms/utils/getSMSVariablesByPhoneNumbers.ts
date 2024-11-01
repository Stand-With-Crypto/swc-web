import { prismaClient } from '@/utils/server/prismaClient'
import { UserSMSVariables } from '@/utils/server/sms/utils/variables'

export async function getSMSVariablesByPhoneNumbers(phoneNumbers: string[]) {
  const users = await prismaClient.user.findMany({
    where: {
      phoneNumber: {
        in: phoneNumbers,
      },
    },
    orderBy: {
      // Use asc here so we take the latest created user when reducing
      datetimeCreated: 'asc',
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

  return users.reduce(
    (acc, user) => {
      if (!user?.phoneNumber) return acc

      return {
        ...acc,
        [user.phoneNumber]: {
          userId: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          sessionId: user.userSessions?.[0]?.id,
        },
      }
    },
    {} as Record<string, UserSMSVariables>,
  )
}
