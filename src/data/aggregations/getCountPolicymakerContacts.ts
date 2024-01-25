import { prismaClient } from '@/utils/server/prismaClient'
import { UserActionType } from '@prisma/client'
import 'server-only'

export const getCountPolicymakerContacts = async () => {
  const [countUserActionEmailRecipients, countUserActionCalls] = await Promise.all([
    prismaClient.userActionEmailRecipient.count(),
    prismaClient.userAction.count({ where: { actionType: UserActionType.CALL } }),
  ])
  return { countUserActionEmailRecipients, countUserActionCalls }
}

export type CountPolicymakerContacts = Awaited<ReturnType<typeof getCountPolicymakerContacts>>
