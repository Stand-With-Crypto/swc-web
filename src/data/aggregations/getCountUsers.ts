import { prismaClient } from '@/utils/server/prismaClient'
import 'server-only'

export const getCountUsers = async () => {
  const count = await prismaClient.user.count()
  return { count }
}

export type CountUsers = Awaited<ReturnType<typeof getCountUsers>>
