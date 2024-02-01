'use server'
import { withServerActionMiddleware } from '@/utils/server/withServerActionMiddleware'
import 'server-only'

export const actionDebugSentry = withServerActionMiddleware('actionDebugSentry', _actionDebugSentry)

function _actionDebugSentry() {
  throw new Error('Debug Sentry 2')
}
