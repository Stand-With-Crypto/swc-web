'use server'
import 'server-only'
import { cookies } from 'next/headers'

export async function actionServerOnlyCookie(
  ...args: Parameters<ReturnType<typeof cookies>['set']>
) {
  cookies().set(...args)
}
