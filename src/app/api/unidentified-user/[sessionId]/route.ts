import { NextResponse } from 'next/server'

import { getClientUnidentifiedUser } from '@/clientModels/clientUser/clientUser'
import { prismaClient } from '@/utils/server/prismaClient'

interface RequestContext {
  params: {
    sessionId: string
  }
}

export async function GET(_: Request, { params }: RequestContext) {
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
    return { user: null }
  }

  return NextResponse.json({
    user: getClientUnidentifiedUser(user),
  })
}
