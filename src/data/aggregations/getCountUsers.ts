import { prismaClient } from '@/utils/server/prismaClient'
import 'server-only'

export const getCountUsers = async () => {
  // TODO verify what we mean when we say "crypto advocates". If someone reaches out to their rep but isn't signed in, is that a user?
  const count = await prismaClient.user.count()
  return { count }
}

export type CountUsers = Awaited<ReturnType<typeof getCountUsers>>
