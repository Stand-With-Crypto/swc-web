import 'server-only'

import { UserActionType } from '@prisma/client'

import { prismaClient } from '@/utils/server/prismaClient'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'

export const getCountPolicymakerContacts = async () => {
  // TODO verify what we mean when we say "policymaker contacts".
  const [countUserActionEmailRecipients, countUserActionCalls] = await Promise.all([
    prismaClient.userActionEmailRecipient.count(),
    prismaClient.userAction.count({ where: { actionType: UserActionType.CALL } }),
  ])
  if (NEXT_PUBLIC_ENVIRONMENT === 'production') {
    return { countUserActionEmailRecipients, countUserActionCalls }
  }
  /*
  Our database in testing env is populated with way less info but we want the UI
  to look comparable to production so we mock the numbers
  */
  return {
    countUserActionEmailRecipients: countUserActionEmailRecipients * 1011,
    countUserActionCalls: countUserActionCalls * 1011,
  }
}

export type CountPolicymakerContacts = Awaited<ReturnType<typeof getCountPolicymakerContacts>>
