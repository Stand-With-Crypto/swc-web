import * as Sentry from '@sentry/nextjs'
import { NextRequest, NextResponse } from 'next/server'

import { USER_SESSION_ID_COOKIE_NAME } from '@/utils/shared/userSessionId'

type HandlerFunction = (request: NextRequest, ...args: any[]) => Promise<NextResponse>

export function withUserSession(fn: HandlerFunction): HandlerFunction {
  return async function (request: NextRequest, ...args: any[]): Promise<NextResponse> {
    const userSession = request.cookies.get(USER_SESSION_ID_COOKIE_NAME)?.value

    Sentry.setUser({
      id: userSession,
      idType: 'session',
    })

    return await fn(request, ...args)
  }
}
