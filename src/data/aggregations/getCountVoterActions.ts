import 'server-only'

import { UserActionType } from '@prisma/client'

import { prismaClient } from '@/utils/server/prismaClient'

export async function getCountVoterActions() {
  return prismaClient.userAction.count({
    where: {
      actionType: {
        in: [
          UserActionType.VOTER_REGISTRATION,
          UserActionType.VOTER_ATTESTATION,
          UserActionType.VOTING_INFORMATION_RESEARCHED,
          UserActionType.VIEW_KEY_RACES,
        ],
      },
    },
  })
}
