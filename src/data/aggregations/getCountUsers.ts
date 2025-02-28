import 'server-only'

import { prismaClient } from '@/utils/server/prismaClient'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'

interface GetCountUsersProps {
  countryCode: string
}

export const getCountUsers = async ({ countryCode }: GetCountUsersProps) => {
  const count = await prismaClient.user.count({ where: { countryCode } })
  if (NEXT_PUBLIC_ENVIRONMENT === 'production') {
    return { count }
  }
  /*
  Our database in testing env is populated with way less info but we want the UI
  to look comparable to production so we mock the numbers
  */
  return { count: count * 10111 }
}
