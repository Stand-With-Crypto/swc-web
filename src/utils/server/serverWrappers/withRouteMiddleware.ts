import * as Sentry from '@sentry/nextjs'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

import { USER_SESSION_ID_COOKIE_NAME } from '@/utils/shared/userSessionId'

type HandlerFunction = (request: NextRequest, ...args: any[]) => Promise<Response>

/**
 * Middleware that sets the user session in Sentry.
 * @example
 * ```ts
 * export const GET = withRouteMiddleware(async () => {
 *   const response = await getSomeData()
 *   return NextResponse.json(response)
 * })
 * ```
 * @warning This middleware ONLY works for non static routes as it reads the user session from cookies.
 */
export function withRouteMiddleware(fn: HandlerFunction): HandlerFunction {
  return async function (request: NextRequest, ...args: any[]): Promise<Response> {
    const currentCookies = await cookies()
    const userSession = currentCookies.get(USER_SESSION_ID_COOKIE_NAME)?.value

    if (userSession) {
      Sentry.setUser({
        id: userSession,
        idType: 'session',
      })
    }

    return await fn(request, ...args)
  }
}
