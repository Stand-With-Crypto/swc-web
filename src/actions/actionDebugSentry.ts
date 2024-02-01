'use server'
import { withServerActionMiddleware } from '@/utils/server/withServerActionMiddleware'
import 'server-only'

export const actionDebugSentry = withServerActionMiddleware('actionDebugSentry', _actionDebugSentry)

function _actionDebugSentry(_args: any) {
  throw new Error('Debug Sentry 2')
}
