import 'server-only'

import Sentry from '@sentry/nextjs'
import { NextResponse } from 'next/server'

import { prismaClient } from '@/utils/server/prismaClient'
import { appRouterGetAuthUser } from '@/utils/server/thirdweb/appRouterGetAuthUser'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'

export const dynamic = 'force-dynamic'

async function apiResponse() {
  if (NEXT_PUBLIC_ENVIRONMENT === 'production') {
    Sentry.captureMessage('Someone tried to access the wiped database detection API in production')
    return { state: 'ok' as const }
  }
  const authUser = await appRouterGetAuthUser()
  if (!authUser) {
    return { state: 'unauthenticated' as const }
  }
  const correspondingUser = await prismaClient.user.findFirst({ where: { id: authUser.userId } })
  if (!correspondingUser) {
    return { state: 'wiped-database' as const }
  }
  return { state: 'ok' as const }
}

export type DetectWipedDatabaseResponse = Awaited<ReturnType<typeof apiResponse>>

export async function POST() {
  const response = await apiResponse()
  return NextResponse.json(response)
}
