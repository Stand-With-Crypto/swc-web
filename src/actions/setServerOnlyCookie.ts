'use server'
import 'server-only'
import { cookies } from 'next/headers'

export async function setServerOnlyCookie(...args: Parameters<ReturnType<typeof cookies>['set']>) {
  cookies().set(...args)
}
