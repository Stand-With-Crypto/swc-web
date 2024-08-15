import * as Sentry from '@sentry/nextjs'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

import { USER_SESSION_ID_COOKIE_NAME } from '@/utils/shared/userSessionId'

type HandlerFunction = (request: NextRequest, ...args: any[]) => Promise<Response>

export function withUserSession(fn: HandlerFunction): HandlerFunction {
  return async function (request: NextRequest, ...args: any[]): Promise<Response> {
    const userSession = cookies().get(USER_SESSION_ID_COOKIE_NAME)?.value

    if (userSession) {
      Sentry.setUser({
        id: userSession,
        idType: 'session',
      })
    }

    return await fn(request, ...args)
  }
}
