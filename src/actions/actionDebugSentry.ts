'use server'
import 'server-only'

import * as Sentry from '@sentry/nextjs'

import { withServerActionMiddleware } from '@/utils/server/withServerActionMiddleware'

export const actionDebugSentry = withServerActionMiddleware('actionDebugSentry', _actionDebugSentry)

function _actionDebugSentry(_args: any) {
  const scope = Sentry.getCurrentScope()
  scope.setExtras({
    debugSentry: 'debug-sentry-client-server-action-value',
    now: new Date().toISOString(),
  })
  scope.setTags({ debugSentry: 'debug-sentry-client-server-action-value' })
  throw new Error('Debug Sentry 2')
}
