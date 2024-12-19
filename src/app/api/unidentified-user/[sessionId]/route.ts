import { NextResponse } from 'next/server'

import { getClientUnidentifiedUser } from '@/clientModels/clientUser/clientUser'
import { prismaClient } from '@/utils/server/prismaClient'
import { withRouteMiddleware } from '@/utils/server/serverWrappers/withRouteMiddleware'

interface RequestContext {
  params: Promise<{
    sessionId: string
  }>
}

export const GET = withRouteMiddleware(async (_: Request, { params }: RequestContext) => {
  const { sessionId } = await params

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
