import { NextResponse } from 'next/server'

import { getClientUnidentifiedUser } from '@/clientModels/clientUser/clientUser'
import { prismaClient } from '@/utils/server/prismaClient'
import { withUserSession } from '@/utils/server/serverWrappers/withUserSession'

interface RequestContext {
  params: {
    sessionId: string
  }
}

export const GET = withUserSession(async (_: Request, { params }: RequestContext) => {
  const { sessionId } = params

  const user = await prismaClient.user.findFirst({
    where: {
      userSessions: {
        some: {
          id: sessionId,
        },
      },
    },
    include: {
      primaryUserEmailAddress: true,
    },
  })

  if (!user) {
    return NextResponse.json({
      user: null,
    })
  }

  return NextResponse.json({
    user: getClientUnidentifiedUser(user),
  })
})
