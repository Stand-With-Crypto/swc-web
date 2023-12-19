import { prismaClient } from '@/utils/server/prismaClient'
import { REPLACE_ME__captureException } from '@/utils/shared/captureException'

export const runBin = async (fn: (...args: any[]) => Promise<any>) => {
  return fn()
    .then(async () => {
      await prismaClient.$disconnect()
    })
    .catch(async (e: any) => {
      REPLACE_ME__captureException(e)
      await prismaClient.$disconnect()
      process.exit(1)
    })
}
