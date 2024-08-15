import { NextRequest, NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'

import { getLogger } from '@/utils/shared/logger'
import { USER_SESSION_ID_COOKIE_NAME } from '@/utils/shared/userSessionId'

type HandlerFunction = (request: NextRequest, ...args: any[]) => Promise<NextResponse>

const logger = getLogger('route onError wrapper')

export function withErrorHandler(fn: HandlerFunction): HandlerFunction {
  return async function (request: NextRequest, ...args: any[]): Promise<NextResponse> {
    const userSession = request.cookies.get(USER_SESSION_ID_COOKIE_NAME)?.value

    try {
      return await fn(request, ...args)
    } catch (error) {
      logger.error(`${(error as Error).message} at ${request.url}`)
      Sentry.captureException(error, {
        extra: {
          userSession,
          url: request.url,
        },
        tags: {
          domain: 'routeErrorHandler',
        },
      })
      return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
    }
  }
}
