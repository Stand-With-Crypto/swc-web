import 'server-only'

import { UserActionType } from '@prisma/client'

import { prismaClient } from '@/utils/server/prismaClient'

export async function getCountVoterActions() {
  // `prismaClient.count` doesn't support distinct, that's why we're using a raw query here
  // see https://github.com/prisma/prisma/issues/4228
  return prismaClient.$queryRaw<{ count: number }[]>`
    select count(DISTINCT user_id) as count from user_action where action_type in (
      ${UserActionType.VOTER_REGISTRATION},
      ${UserActionType.VOTER_ATTESTATION},
      ${UserActionType.VOTING_INFORMATION_RESEARCHED},
      ${UserActionType.VIEW_KEY_RACES}
    )
  `.then(res => Number(res[0].count))
}
