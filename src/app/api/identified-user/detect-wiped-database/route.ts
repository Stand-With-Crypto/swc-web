import 'server-only'

import * as Sentry from '@sentry/nextjs'
import { NextResponse } from 'next/server'

import { getAuthUser } from '@/utils/server/authentication/getAuthUser'
import { prismaClient } from '@/utils/server/prismaClient'
import { withRouteMiddleware } from '@/utils/server/serverWrappers/withRouteMiddleware'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'

export const dynamic = 'force-dynamic'

async function apiResponse() {
  if (NEXT_PUBLIC_ENVIRONMENT === 'production') {
    Sentry.captureMessage('Someone tried to access the wiped database detection API in production')
    return { state: 'ok' as const }
  }
  const authUser = await getAuthUser()
  if (!authUser) {
    return { state: 'unauthenticated' as const }
  }
  const correspondingUser = await prismaClient.user.findFirst({
    where: { id: authUser.userId },
    include: { userCryptoAddresses: true },
  })
  if (!correspondingUser) {
    return { state: 'wiped-database' as const }
  }
  return { state: 'ok' as const }
}

export type DetectWipedDatabaseResponse = Awaited<ReturnType<typeof apiResponse>>

export const POST = withRouteMiddleware(async () => {
  const response = await apiResponse()
  return NextResponse.json(response)
})
