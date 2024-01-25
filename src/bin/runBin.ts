import { prismaClient } from '@/utils/server/prismaClient'
import * as Sentry from '@sentry/nextjs'
// eslint-disable-next-line
import '../../sentry.server.config'

export async function runBin(fn: (...args: any[]) => Promise<any>) {
  return fn()
    .then(async () => {
      await prismaClient.$disconnect()
      await Sentry.flush(2000)
    })
    .catch(async (e: any) => {
      Sentry.captureException(e, { tags: { domain: 'runBin' } })
      await prismaClient.$disconnect()
      await Sentry.flush(2000)
      process.exit(1)
    })
}
