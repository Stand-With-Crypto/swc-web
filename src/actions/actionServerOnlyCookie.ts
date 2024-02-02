'use server'
import { withServerActionMiddleware } from '@/utils/server/withServerActionMiddleware'
import { cookies } from 'next/headers'
import 'server-only'

export const actionServerOnlyCookie = withServerActionMiddleware(
  'actionServerOnlyCookie',
  _actionServerOnlyCookie,
)

function _actionServerOnlyCookie(...args: Parameters<ReturnType<typeof cookies>['set']>) {
  cookies().set(...args)
}
