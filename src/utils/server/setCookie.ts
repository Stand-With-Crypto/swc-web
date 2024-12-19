'use server'

import { cookies } from 'next/headers'

export async function setCookie(...args: Parameters<Awaited<ReturnType<typeof cookies>>['set']>) {
  const currentCookies = await cookies()

  return currentCookies.set(...args)
}
