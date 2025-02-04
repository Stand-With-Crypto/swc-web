import * as Sentry from '@sentry/nextjs'
import { NextRequest, NextResponse } from 'next/server'

import { requiredOutsideLocalEnv } from '@/utils/shared/requiredEnv'

const BUILDER_IO_WEBHOOK_AUTH_TOKEN = requiredOutsideLocalEnv(
  process.env.BUILDER_IO_WEBHOOK_AUTH_TOKEN,
  'BUILDER_IO_WEBHOOK_AUTH_TOKEN',
  "Builder.io webhook's auth token",
)!

type HandlerFunction = (request: NextRequest, ...args: any[]) => Promise<Response>

/**
 * Middleware that checks if the request is authorized to access the Builder.io webhook.
 * @example
 * ```ts
 * export const POST = withBuilderIoAuthMiddleware(async () => {
 *   return NextResponse.json({ message: 'Hello, world!' })
 * })
 * ```
 */
export function withBuilderIoAuthMiddleware(fn: HandlerFunction): HandlerFunction {
  return async function (request: NextRequest, ...args: any[]): Promise<Response> {
    const authHeader = request.headers.get('Authorization')

    if (authHeader !== `Bearer ${BUILDER_IO_WEBHOOK_AUTH_TOKEN}`) {
      Sentry.captureMessage('Received unauthorized request to Builder.io webhook', {
        extra: {
          ...request,
        },
        tags: {
          domain: 'builder.io',
          model: 'webhook',
        },
      })

      return new NextResponse('Unauthorized', {
        status: 401,
      })
    }

    return await fn(request, ...args)
  }
}
