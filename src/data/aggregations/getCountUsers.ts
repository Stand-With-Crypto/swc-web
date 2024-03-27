import 'server-only'

import { prismaClient } from '@/utils/server/prismaClient'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'

export const getCountUsers = async () => {
  const count = await prismaClient.user.count()
  if (NEXT_PUBLIC_ENVIRONMENT === 'production' || NEXT_PUBLIC_ENVIRONMENT === 'local') {
    return { count }
  }
  /*
  Our database in testing env is populated with way less info but we want the UI
  to look comparable to production so we mock the numbers
  */
  return { count: count * 1011 }
}

export type CountUsers = Awaited<ReturnType<typeof getCountUsers>>
