'use server'
import 'server-only'

import { cookies } from 'next/headers'

import { withServerActionMiddleware } from '@/utils/server/withServerActionMiddleware'

export const actionServerOnlyCookie = withServerActionMiddleware(
  'actionServerOnlyCookie',
  _actionServerOnlyCookie,
)

function _actionServerOnlyCookie(...args: Parameters<ReturnType<typeof cookies>['set']>) {
  cookies().set(...args)
}
