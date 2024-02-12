import { User, UserSession } from '@prisma/client'
import _ from 'lodash'

import { prismaClient } from '@/utils/server/prismaClient'

export async function getOrCreateSessionIdToSendBackToPartner(
  user: User & { userSessions: Array<UserSession> },
) {
  if (user.userSessions.length > 0) {
    return _.sortBy(user.userSessions, x => x.datetimeUpdated)[0].id
  }
  const userSession = await prismaClient.userSession.create({
    data: {
      user: { connect: { id: user.id } },
    },
  })
  return userSession.id
}
